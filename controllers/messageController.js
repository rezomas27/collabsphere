// controllers/messageController.js
const Message = require('../models/message');
const User = require('../models/user');

const getMessages = async (req, res) => {
    try {
        const { before, limit = 20 } = req.query;
        const query = {
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        };

        // Add pagination if 'before' timestamp is provided
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'userName')
            .populate('recipient', 'userName')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .lean();

        // Filter out messages where sender or recipient is null (deleted users)
        const validMessages = messages.filter(msg => msg.sender && msg.recipient);

        res.json(validMessages);
    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({ message: error.message });
    }
};

const getConversationMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { before, limit = 20 } = req.query;

        const query = {
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'userName')
            .populate('recipient', 'userName')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .lean();

        res.json(messages);
    } catch (error) {
        console.error('Error in getConversationMessages:', error);
        res.status(500).json({ message: error.message });
    }
};

const mongoose = require('mongoose');

// Modify the sendMessage function in messageController.js
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient ID is required' });
        }

        // Validate recipientId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return res.status(400).json({ message: 'Invalid recipient ID format' });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content: content.trim(),
            delivered: false, // Track delivery state
            deliveryAttempts: 0 // Track delivery attempts
        });

        await message.save();

        // Populate sender and recipient after saving
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'userName')
            .populate('recipient', 'userName')
            .lean();

        // Send real-time update using WebSocket
        const wsServer = req.app.get('wsServer');
        let deliverySuccess = false;

        if (wsServer) {
            // Generate a message ID for tracking delivery
            const messageId = populatedMessage._id.toString();
            deliverySuccess = wsServer.sendToUser(recipientId, {
                type: 'new_message',
                message: populatedMessage,
                messageId: messageId
            });

            // If delivery is successful, mark as delivered
            if (deliverySuccess) {
                await Message.findByIdAndUpdate(message._id, { 
                    delivered: true,
                    deliveredAt: new Date()
                });
                populatedMessage.delivered = true;
                populatedMessage.deliveredAt = new Date();
            } else {
                // Log delivery failure
                console.log(`Message delivery failed to user ${recipientId} for message ${messageId}`);
                
                // Queue for retry
                setTimeout(async () => {
                    const wsServer = req.app.get('wsServer');
                    if (wsServer) {
                        const retrySuccess = wsServer.sendToUser(recipientId, {
                            type: 'new_message',
                            message: populatedMessage,
                            messageId: messageId,
                            isRetry: true
                        });
                        
                        if (retrySuccess) {
                            await Message.findByIdAndUpdate(message._id, { 
                                delivered: true,
                                deliveredAt: new Date(),
                                deliveryAttempts: 1
                            });
                        } else {
                            // If retry failed, increment attempt counter
                            await Message.findByIdAndUpdate(message._id, { 
                                deliveryAttempts: 1
                            });
                        }
                    }
                }, 5000); // Retry after 5 seconds
            }
        }

        res.status(201).json({
            ...populatedMessage,
            delivered: deliverySuccess
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add this new function in messageController.js to sync messages
const syncMessages = async (req, res) => {
    try {
        const { lastSyncTime, conversationWith } = req.query;
        
        const query = {
            $or: [
                { sender: req.user._id, recipient: conversationWith },
                { sender: conversationWith, recipient: req.user._id }
            ]
        };

        // If lastSyncTime is provided, get only messages after that time
        if (lastSyncTime) {
            query.createdAt = { $gt: new Date(lastSyncTime) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'userName')
            .populate('recipient', 'userName')
            .sort('createdAt')
            .lean();
            
        // Mark any unread messages as delivered
        const undeliveredMessages = messages.filter(msg => 
            !msg.delivered && msg.recipient._id.toString() === req.user._id.toString()
        );
        
        if (undeliveredMessages.length > 0) {
            await Promise.all(undeliveredMessages.map(msg => 
                Message.findByIdAndUpdate(msg._id, { 
                    delivered: true,
                    deliveredAt: new Date()
                })
            ));
        }

        res.json({
            messages,
            syncTime: new Date(),
            undeliveredCount: undeliveredMessages.length
        });
    } catch (error) {
        console.error('Error in syncMessages:', error);
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        message.read = true;
        await message.save();

        // Send real-time update using WebSocket
        const wsServer = req.app.get('wsServer');
        if (wsServer) {
            wsServer.sendToUser(message.sender.toString(), {
                type: 'message_read',
                messageId: message._id
            });
        }

        res.json(message);
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Delete all messages between the current user and the specified user
        await Message.deleteMany({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        });

        // Send WebSocket notification if needed
        const wsServer = req.app.get('wsServer');
        if (wsServer) {
            wsServer.sendToUser(userId, {
                type: 'conversation_deleted',
                withUserId: req.user._id
            });
        }

        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    getConversationMessages,
    sendMessage,
    markAsRead,
    deleteConversation,
    syncMessages
};