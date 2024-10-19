const User = require('../Modals/UserModal');
const Message = require('../Modals/MessageModal')
const jwt = require('jsonwebtoken')
const validateMongoDBid = require('../Utils/validateMongodbId')
const crypto = require('crypto')
const util = require('util')

const signinResponse = async (user,statuscode,res)=>{
    const token = jwt.sign({id:user._id},process.env.SECRET_STR,{
        algorithm:'HS256',
        expiresIn: process.env.EXPIRES_IN
    })
    const User_data = await User.find();
    res.status(statuscode).json({
        status:'success',
        token,
        data:{
            user,
            User_data
        }
    })
}

exports.signUp = async(req,res) =>{
    try {
        const Username = req.body.Username
        const phoneNumber = req.body.phoneNumber
        const check_user = await User.findOne({phoneNumber})
        // console.log(check_user)
        if(check_user)
        {
            throw new Error('User with this phone number already exists')
        }

        user = {
            Username: Username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            phoneNumber: phoneNumber
        }
        const newUser = await User.create(user)
        signinResponse(newUser,200,res)
    } catch (error) {
        console.log('error message : ',error.message)
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}

exports.login = async(req,res) =>{
    try{
        const Username = req.body.Username
        const phoneNumber = req.body.phoneNumber
        const pswd = req.body.password;
        if(!Username || !pswd || !phoneNumber)
        {
             throw new Error('please enter name, password and phone number')
        }
        const curruser = await User.findOne({phoneNumber}).select('+password')
        if(!curruser)
        {
            throw new Error('please enter a valid credentials')
        }
        const match = await curruser.comparePassword(pswd,curruser.password)
        if(!match)
        {
            throw new Error('please enter a valid credentials')
        }

        signinResponse(curruser,200,res)
        
    } catch(error){
        console.log("error occured : ",error.message)
        res.status(400).json({
            status:'fail',
            message:`logged in failed: ${error.message}`
    })
}
}


exports.protect = async(req,res,next)=>{
    try {
        let testoken = req.headers.authorization
        let token
        if(testoken && testoken.startsWith('Bearer'))
        {
            token = testoken.split(' ')[1]
        }
        if(!token)
        {
            throw new Error('please log in first')
        }

   
        const decodeToken = await util.promisify(jwt.verify)(token,process.env.SECRET_STR)
        console.log(decodeToken)
    
        const curruser = await User.findById(decodeToken.id)
    
        if(!curruser)
        {
            throw new Error('user not found')
        }
    
        req.user = curruser
        next()
    } catch (error) {
        res.status(400).json({
            status:'fail',
            data:{
                message:error.message
            }
        })
    }
   
}

exports.get_messages = async (req, res) => {
    const { id } = req.params;
    validateMongoDBid(id);

    try {
        const privateMessages = await Message.find({
            $or: [
                { sent_by: req.user._id, sent_to: id },
                { sent_by: id, sent_to: req.user._id }
            ]
        }).sort({ createdAt: 1 }); 

        await Message.updateMany(
            {
                sent_by: id,
                sent_to: req.user._id,
                read: false  
            },
            {
                $set: { read: true }  
            }
        );

        if (!privateMessages || privateMessages.length === 0) {
            console.log("No conversation found");
         
        }
      
        const formattedMessages = privateMessages.map(message => {
            const createdAt = new Date(message.createdAt); 

            
            const formattedDate = createdAt.toISOString().slice(0, 10); 
            const formattedTime = createdAt.toTimeString().slice(0, 8); 

            return {
                _id: message._id,
                content: message.message,
                sent_by: message.sent_by,
                sent_to: message.sent_to,
                read: message.read,
                createdAt: {
                    date: formattedDate,  
                    time: formattedTime   
                }
            };
        });
        console.log(formattedMessages)

        res.status(200).json({
            status: 'success',
            data: formattedMessages 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }
};


exports.send_message = async (req, res) => {
    try {
            const { id } = req.params
            validateMongoDBid(id)
            const sent_by = req.user._id 
            const sent_to = id
            const message = req.body.message
            if(message.trim().length === 0)
            {
                throw new Error("Message is empty..!")
            }

            const messg = {
                sent_by,
                sent_to,
                message
            }
            const mess = await Message.create(messg) 

            const io = req.app.get('io');
            io.emit('newMessage', mess);

            res.status(200).json({
                status:'success',
                data: mess
            });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status:'failed',
            message:error.message
        });
    }


}

exports.delete_message = async (req, res) => {
    try {
            const messid = req.body.id
            const userid = req.user._id
            validateMongoDBid(messid)
            const messg = await Message.findById(messid)
            console.log(userid)
            console.log(messg.sent_by)
            if( userid.toString() === messg.sent_by.toString())
            {
                const mess = await Message.findByIdAndDelete(messid) 

                const io = req.app.get('io');
                io.emit('deleteMessage', { messageId: messid });

                res.status(200).json({
                    status:'success',
                    message:"message deleted succesfully",
                    data: mess
                });
            }
            else
            {
                throw new Error("access denied only the sender acan delete the message sent")
            }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status:'failed',
            message:error.message
        });
    }


}


exports.getuser = async (req, res) => {
    try {
        const currentUserId = req.user._id; 

        const users = await User.find({ _id: { $ne: currentUserId } }); 
        if (!users)
        {
            console.log("no current user ...!")
        }
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching users',
            error: error.message
        });
    }
};




