// controllers/messageController.js
const Message = require('../models/message');
const User = require('../models/user');

const getMessages = async (req, res) => {
    try {
        console.log('Fetching messages for user:', req.user._id);
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .populate('sender', 'userName')
        .populate('recipient', 'userName')
        .sort('-createdAt')
        .lean();

        console.log('Found messages count:', messages.length);

        // Filter out messages where sender or recipient is null (deleted users)
        const validMessages = messages.filter(msg => msg.sender && msg.recipient);
        console.log('Valid messages count:', validMessages.length);

        res.json(validMessages);
    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        console.log('Sending message. Request body:', req.body);
        const { recipientId, content } = req.body;

        if (!content?.trim()) {
            console.log('Message content is empty');
            return res.status(400).json({ message: 'Message content is required' });
        }

        if (!recipientId) {
            console.log('Recipient ID is missing');
            return res.status(400).json({ message: 'Recipient ID is required' });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            console.log('Recipient not found:', recipientId);
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content: content.trim()
        });

        console.log('Saving message:', message);
        await message.save();

        // Populate sender and recipient after saving
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'userName')
            .populate('recipient', 'userName')
            .lean();

        console.log('Message sent successfully:', populatedMessage);
        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        console.log('Marking message as read:', req.params.messageId);
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            console.log('Message not found:', req.params.messageId);
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.recipient.toString() !== req.user._id.toString()) {
            console.log('Unauthorized mark as read attempt');
            return res.status(403).json({ message: 'Not authorized' });
        }

        message.read = true;
        await message.save();
        console.log('Message marked as read successfully');

        res.json(message);
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    markAsRead
};