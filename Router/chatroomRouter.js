const express = require('express')
const chatroomRouter = express.Router()
const authController = require('../Controller/authController')
const chatroomController = require('../Controller/chatroomController')


chatroomRouter.route('/create_room').post(authController.protect,chatroomController.create_room)
chatroomRouter.route('/delete_room/:id').delete(authController.protect, chatroomController.check_member, chatroomController.delete_room)
chatroomRouter.route('/getchatrooms').get(authController.protect,chatroomController.getchatrooms)
chatroomRouter.route('/:id').get(authController.protect,chatroomController.check_member ,chatroomController.get_chatroom_messages)
chatroomRouter.route('/join_room/:id').patch(authController.protect,chatroomController.join_room)
chatroomRouter.route('/leave_room/:id').patch(authController.protect,chatroomController.check_member ,chatroomController.leave_room)
chatroomRouter.route('/send_message/:id').post(authController.protect,chatroomController.check_member ,chatroomController.send_message)
chatroomRouter.route('/delete_message/:id').patch(authController.protect, chatroomController.check_member, chatroomController.delete_message);



module.exports = chatroomRouter