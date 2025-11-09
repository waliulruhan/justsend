const User = require('../models/userModel.js');
const Request = require('../models/requestModel.js');
const Message = require('../models/messageModel.js');
const Chat = require('../models/chatModel.js');
const { TryCatch, ErrorHandler } = require('../middlewares/error.js');
const jwt = require('jsonwebtoken');
const {cookieOptions} = require("../utils/features.js")

const adminLogin = TryCatch(async(req , res , next)=> {
    const adminKey = process.env.SECRET_KEY || 'hebvfhuywgrgvbeurfgwbefwusgvbweirb';
    const {secretKey} = req.body;
    const isMatched = secretKey === adminKey;

    if(!isMatched) return next( new ErrorHandler("Invalid Admin key!" , 401));

    const token = jwt.sign(secretKey , process.env.JWT_SECRET);

    return res.status(200).cookie("happiness-admin-cookie" , token , {
        ... cookieOptions,
        maxAge: 20 * 60 * 1000,
    }).json({
        success: true,
        message: "Welcome ADMIN"
    })
})


const adminLogout = TryCatch(async (req, res, next) => {
    return res
      .status(200)
      .cookie("happiness-admin-cookie", "", {
        ...cookieOptions,
        maxAge: 0,
      })
      .json({
        success: true,
        message: "Logged Out Successfully",
      });
  });

const getIsAdmin = TryCatch(async (req, res, next) => {
    return res.status(200).json({
      admin: true,
    });
  });

const allUsers =TryCatch(async(req ,res)=> {
    const users = await User.find();

    const transformedUsers = await Promise.all(
        users.map(async ({ name, username, avatar, _id }) => {
          const [groups, friends] = await Promise.all([
            Chat.countDocuments({ groupChat: true, members: _id }),
            Chat.countDocuments({ groupChat: false, members: _id }),
          ]);
    
          return {
            name,
            username,
            avatar: avatar.url,
            _id,
            groups,
            friends,
          };
        })
      );
    
    return res.status(200).json({
        success: true,
        users: transformedUsers,
    });
})

const allChats = TryCatch(async (req, res) => {
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");
  
    const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, name, creator }) => {
        const totalMessages = await Message.countDocuments({ chat: _id });
  
        return {
          _id,
          groupChat,
          name,
          avatar: members.slice(0, 3).map((member) => member.avatar.url),
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
          })),
          creator: {
            name: creator?.name || "None",
            avatar: creator?.avatar.url || "",
          },
          totalMembers: members.length,
          totalMessages,
        };
      })
    );
    return res.status(200).json({
        success: true,
        chats: transformedChats,
    });
});

    const allMessages = TryCatch(async (req, res) => {
        const messages = await Message.find({})
          .populate("sender", "name avatar")
          .populate("chat", "groupChat");
      
        const transformedMessages = messages.map(
          ({ content, attachments, _id, sender, createdAt, chat }) => ({
            _id,
            attachments,
            content,
            createdAt,
            chat: chat._id,
            groupChat: chat.groupChat,
            sender: {
              _id: sender._id,
              name: sender.name,
              avatar: sender.avatar.url,
            },
          })
        );
      
        return res.status(200).json({
          success: true,
          messages: transformedMessages,
        });
      });    

const getDashboardStats = TryCatch(async (req, res) => {
    const [groupsCount, usersCount, messagesCount, totalChatsCount] =
        await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
        ]);


    const stats = {
        groupsCount,
        usersCount,
        messagesCount,
        totalChatsCount,
        messagesCount
    };

    return res.status(200).json({
        success: true,
        stats,
    });
});
      


  module.exports = {
    adminLogout,
    adminLogin,
    allUsers,
    getIsAdmin,
    allChats,
    allMessages,
    getDashboardStats, 
  }