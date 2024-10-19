const ChatRoom = require('../Modals/ChatroomModal')
const chatroomRouter = require('../Router/chatroomRouter')
const Message = require('../Modals/MessageModal')
const validateMongoDBid = require('../Utils/validateMongodbId')

exports.create_room = async (req, res) =>{
    try {
        room_name = req.body.room_name
        created_by = req.user._id
        users = [req.user._id]
        
        const checkroom = await ChatRoom.findOne({room_name})
        if(checkroom)
        {
            throw new Error('room with same name already exists')
        }
            
        const newchatroom = {
            room_name,
            created_by,
            users
        }
        const room = await ChatRoom.create(newchatroom)

        const io = req.app.get('io');
        io.emit('new_room', room)

        res.status(200).json({
            status:'success',
            data: room
        })
    } catch (error) {
        console.log('error message : ',error.message)
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
    
}

exports.delete_room = async (req, res) =>{
    try {
        const { id } = req.params
        validateMongoDBid(id)
        const userid = req.user._id
        
        const checkroom = await ChatRoom.findById(id)
        console.log(checkroom)
        console.log(checkroom.created_by,userid)
        if(!checkroom)
        {
            throw new error('chatroom does not exists')
        }

        if(userid.toString() !== checkroom.created_by.toString())
        {
            throw new Error("Access denied, only admin can delete the chatroom");
        }
            
        const room = await ChatRoom.findByIdAndDelete(id)

        const io = req.app.get('io');
        io.emit('room_deleted', room)

        res.status(200).json({
            status:'success',
            message:'chatroom succesfully deleted',
            data: room
        })
    } catch (error) {
        console.log('error message : ',error.message)
        res.status(500).json({
            status: 'fail',
            stack:error.stack,
            message: error.message
        });
    }
    
}

exports.check_member = async (req, res, next) => {
    try {
        const { id } = req.params;  
        const userId = req.user._id; 

        validateMongoDBid(id);

        const chatRoom = await ChatRoom.findById(id);

        if (!chatRoom) {
            throw new Error('Chat room not found')
        }

        const isMember = chatRoom.users.includes(userId);

        if (!isMember) {
            throw new Error('You are not a member of this chat room. Please join to continue.')
        }

        next();
    } catch (error) {
        console.error('Error message: ', error.message);
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};


exports.join_room = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id; 
        validateMongoDBid(id);  

        const chatRoom = await ChatRoom.findById(id);

        if (!chatRoom) {
            throw new Error('Chat room not found')
        }

        const isMember = chatRoom.users.includes(userId);

        if (isMember) {
            throw new Error('You are already a member of this chat room.')
        }

        const updated_room = await ChatRoom.findByIdAndUpdate(
            id,  
            { $push: { users: userId } },  
            { new: true, useFindAndModify: false }  
        );

        if (!updated_room) {
            return res.status(404).json({
                status: 'fail',
                message: 'Chat room not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User joined the chatroom successfully',
            data: updated_room
        });
        
    } catch (error) {
        console.error('Error message: ', error.message);
        res.status(500).json({
            status: 'fail',
            stack:error.stack,
            message: error.message
        });
    }
};


exports.leave_room = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id; 
        validateMongoDBid(id);  

        const chatRoom = await ChatRoom.findById(id);

        if (!chatRoom) {
            throw new Error('Chat room not found')
        }

        if(userId === chatRoom.created_by)
        {
            throw new Error('Admin cant leave the group')
        }

        const updated_room = await ChatRoom.findByIdAndUpdate(
            id,  
            { $pull: { users: userId } },  
            { new: true, useFindAndModify: false }  
        );

        if (!updated_room) {
            return res.status(404).json({
                status: 'fail',
                message: 'Chat room not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User left the chatroom successfully',
            data: updated_room
        });
        
    } catch (error) {
        console.error('Error message: ', error.message);
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};


exports.get_chatroom_messages = async (req, res, next) => {
    const { id } = req.params;
    validateMongoDBid(id);

    try {
        const roomMessages = await ChatRoom.findById(id)
            .populate({
                path: 'messages',
                populate: { 
                    path: 'sent_by', 
                    select: 'Username' 
                },
                options: { sort: { createdAt: 1 } }  
            });

        if (!roomMessages) return res.status(404).json('Chat room not found');

        console.log(roomMessages);

        const formattedMessages = roomMessages.messages.map(message => {
            const createdAt = new Date(message.createdAt); 

            const formattedDate = createdAt.toISOString().slice(0, 10); 
            const formattedTime = createdAt.toTimeString().slice(0, 8); 

            return {
                _id: message._id,
                content: message.message,
                sent_by:{
                    _id : message.sent_by._id,
                    Username : message.sent_by.Username
                } , 
                createdAt: {
                    date: formattedDate,  
                    time: formattedTime   
                },
                read: message.read
            };
        });

        console.log(formattedMessages);

        res.status(200).json({
            status: 'success',
            data: {
                roomId: roomMessages._id,
                messages: formattedMessages
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json('Server error');
    }
};



exports.send_message = async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDBid(id);  

        const sent_by = req.user._id;
        const room = id;
        const message = req.body.message;

        if (message.trim().length === 0) {
            throw new Error("Message is empty..!");
        }

        const messg = {
            sent_by,
            room,
            message
        };

        const mess = await Message.create(messg);

        const updated_mess = await ChatRoom.findByIdAndUpdate(
            room,  
            { $push: { messages: mess._id } },  
            { new: true, useFindAndModify: false }  
        );

        const io = req.app.get('io');
        io.emit('newchatroomMessage', updated_mess);

        

        return res.status(200).json({
            status: 'success',
            data: mess
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }
};

exports.delete_message = async (req, res) => {
    try {
        const { id } = req.params;  
        const message_id = req.body.id
        const user_id = req.user._id; 
        
        console.log(req.params)
        validateMongoDBid(id);
        

        const message = await Message.findById(message_id);
        if (!message) {
            throw new Error("Message not found");
        }

        if (message.sent_by.toString() !== user_id.toString()) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to delete this message'
            });
        }

        const deleted_message = await Message.findByIdAndDelete(message_id);

        const updated_chatroom = await ChatRoom.findByIdAndUpdate(
            id,  
            { $pull: { messages: message_id } },  
            { new: true, useFindAndModify: false }  
        );

        const io = req.app.get('io');
        io.emit('chatroomDeleteMessage', updated_chatroom);

        
        res.status(200).json({
            status: 'success',
            message: 'Message deleted successfully',
            data: deleted_message
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }
};

exports.getchatrooms = async (req,res) =>{
    try {
        const chatrooms = await ChatRoom.find()
        if (!chatrooms)
        {
            console.log("no chatrooms present..!");
        }
        res.status(200).json({
            status: 'success',
            data:chatrooms
        });
        
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }

}

