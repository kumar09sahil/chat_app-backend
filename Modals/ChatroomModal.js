const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
    room_name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true,
        unique: true,  
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: [true, 'Chat room must have an admin']
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true,
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',  
    }]
}, {
    timestamps: true  
});

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
module.exports = ChatRoom;
