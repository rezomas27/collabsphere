// controllers/messageController.js
const Message = require('../models/message');
const User = require('../models/user');

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .populate('sender', 'userName')
        .populate('recipient', 'userName')
        .sort('-createdAt');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const message = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        await message.save();
        await message.populate('sender', 'userName');
        await message.populate('recipient', 'userName');

        res.status(201).json(message);
    } catch (error) {
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

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    markAsRead
};