const { Schema, model } = require("mongoose");


const userModel = new Schema({
    name:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: true,
    },
    bio:{
        type: String,
        required: true,
    },
    lastActive:{
        type: Date,
        required: true,
    },
    avatar:{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    password:{
        type: String,
        required: true,
        select: false,
    },
},{
    timestamps: true,
})

const User = model("User" , userModel)
module.exports = User;


