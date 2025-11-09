const { Schema, model, Types } = require("mongoose");


const requestModel = new Schema({
    status:{
        type: String,
        default: 'pending',
        enum: ["pending" , "accepted" , "rejected"],
    },
    sender:{
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver:{
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
},{
    timestamps: true,
})
const Request = model("Request" , requestModel)
module.exports = Request;