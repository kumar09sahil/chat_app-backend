const mongoose = require('mongoose')
const express = require('express')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema({
    Username:{
        type:String,
        required:[true,'please enter your username'],
        min:[5, 'username should at least be of 5 characters'],
        trim:true
    },
    password:{
        type:String,
        required:[true,' please enter your password'],
        minLength:[5, 'password should be of atleast 5 characters'],
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,' please enter your password'],
        validate:{
            validator : function(val){
                return val === this.password
            },
            message:'password and confirm password does not match '
        }
    },
    phoneNumber: {
        type: String, 
        required: [true, 'please enter your number'],
        unique:true,
        validate: {
            validator: function(val) {
                return validator.isNumeric(val) && val.length === 10;
            },
            message: 'please enter a valid 10-digit number'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    tokenExpire:Date,
    passwordChangedAt:Date,
    active:{
        type:Boolean,
        default:true
    }
})

UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next()

    this.password =await bcrypt.hash(this.password,12)
    this.confirmPassword = undefined;
    next()
})

UserSchema.methods.comparePassword = async function (pswd, dbpswd){
    return bcrypt.compare(pswd,dbpswd)
}

UserSchema.pre(/^find/, function(next) {
    this.find({ active: true });
    next();
});




const User = mongoose.model('User',UserSchema)
module.exports = User