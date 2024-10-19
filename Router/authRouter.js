const express = require('express')
const authRouter = express.Router()
const authController = require('../Controller/authController')

authRouter.route('/signup').post(authController.signUp)
authRouter.route('/login').post(authController.login)
authRouter.route('/getuser').get(authController.protect,authController.getuser)
authRouter.route('/:id').get(authController.protect, authController.get_messages)
authRouter.route('/send_message/:id').post(authController.protect, authController.send_message)
authRouter.route('/delete_message').delete(authController.protect, authController.delete_message)



module.exports = authRouter