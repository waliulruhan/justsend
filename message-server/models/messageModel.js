const { Schema, model, Types } = require("mongoose");


const messageModel = new Schema({
    chat:{
        type: Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender:{
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    content:{
        type: String,
    },
    seen:{
      type: Boolean,
      default: false,
    },
    attachments: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
},{
    timestamps: true,
})

const Message = model("Message" , messageModel)
module.exports = Message;