const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sent_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Message must have a sender'],
    },
    sent_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,  
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',  
        default: null,  
    },
    message: {
        type: String,
        required: [true, 'Please enter your message'],
        trim: true  
    },
    read: {
        type: Boolean,
        default: false  
    }
}, {
    timestamps: true  
});

MessageSchema.pre('validate', function(next) {
    if (this.sent_to && this.room) {
        return next(new Error('Message cannot be sent to both a user and a room.'));
    }
    if (!this.sent_to && !this.room) {
        return next(new Error('Message must be sent to either a user (1v1) or a room (chat room).'));
    }
    if(this.message.trim().length === 0)
    {
        return next(new Error('Empty message,'))
    }
    next();
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
