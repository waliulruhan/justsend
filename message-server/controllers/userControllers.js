const { hash, compare } = require('bcrypt');
const User = require('../models/userModel.js');
const Request = require('../models/requestModel.js');
const Chat = require('../models/chatModel.js');
const { sendToken, cookieOptions, emitEvent, uploadFilesToCloudinary } = require('../utils/features.js');
const { ErrorHandler, TryCatch } = require('../middlewares/error.js');
const { NEW_REQUEST, REFETCH_CHATS } = require('../constants/event.js');
const { getOtherMember } = require('../lib/helper.js');

const register= TryCatch(async(req , res , next)=>{
    const {name , username , bio , password  } = req.body;
    const hashedPassword = await hash(password ,10)  
  const file = req.file;

    if (!file) return next(new ErrorHandler("Please Upload Avatar"));

  const result = await uploadFilesToCloudinary([file]);

    const avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };

    const user = await User.create({
      name,
      bio,
      username,
      password: hashedPassword,
      avatar,
      lastActive: Date.now(),
    });
  
    sendToken(res, user, 201, "User created");
  
  })

const login= TryCatch( async(req , res , next)=>{
    const {username, password} = req.body;
    const user = await User.findOne({ username }).select("+password");

    if(!user) return next(new ErrorHandler("Invalid username", 404))

    const isMatch = await compare(password , user.password);
    
    if(!isMatch) return  next(new ErrorHandler("Invalid password" , 404))
    sendToken( res , user , 200 , 'welcome to message')
})


const getMyProfile = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.userId);
  
    if (!user) return next(new ErrorHandler("User not found", 404));
  
    res.status(200).json({
      success: true,
      user,
    });
  });
  
  const logout = TryCatch(async (req, res , next) => {
    return res.status(200).cookie("happiness-cookie", "", { ...cookieOptions, maxAge: 0 })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  });

  const searchUser = TryCatch(async (req, res , next) => {
    const {name = ""} = req.query;

    const myChats = await Chat.find({ groupChat: false, members: req.userId });

    const allUsersFromMyChat  = await myChats.flatMap(chat => chat.members);

    const nonFriendUsers = await User.find({
      _id:{$nin: allUsersFromMyChat},
      name:{ $regex: name, $options:"i"}
    })
    
    const users = nonFriendUsers.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url,
    }));


    return res.status(200).json({
        success: true,
        users,
      });

  });

  const sendFriendRequest = TryCatch(async (req, res , next) => {
    const {userId} = req.body;

    const request = await Request.findOne({
      $or: [
      { sender: req.userId, receiver: userId },
      { sender: userId, receiver: req.userId },
    ],
    });

    if(request) return next(new ErrorHandler("Request already sent" , 404))
    if(req.userId === userId) return next(new ErrorHandler("Can't send request to yourself" , 404))


    await Request.create({
      sender: req.userId,
      receiver: userId,
    });

    emitEvent(req , NEW_REQUEST , [userId]);

    return res.status(200).json({
        success: true,
        message: "Friend request sent",
      });
  });
  const acceptRequest = TryCatch(async (req, res ,next) => {
    const {requestId , accept} = req.body;

    const request = await Request.findById(requestId).populate("sender", "name").populate("receiver", "name");


    if (!request) return next(new ErrorHandler("Request not found", 404));

    if (request.receiver._id.toString() !== req.userId.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

    if (!accept) {
      await request.deleteOne();
  
      return res.status(200).json({
        success: true,
        message: "Friend Request Rejected",
      });
    }

      const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });

  });

  const getNotifications =TryCatch(async(req , res , next)=>{
    const requests = await Request.find({receiver: req.userId}).populate("sender", "name avatar");
    
    const allRequests = requests.map(({ _id, sender }) => ({
     _id,
     sender: {
       _id: sender._id,
       name: sender.name,
       avatar: sender.avatar.url,
     },
    }));
    return res.status(200).json({
      success: true, 
      allRequests,
    })

  })

  const getAllFriends =TryCatch(async(req , res , next)=>{
    const chatId = req.query.chatId;

    const chats = await Chat.find({
      groupChat: false,
      members: req.userId,
    }).populate("members" , "name avatar");

    const friends = chats.map(({members}) => {
      const otherUser = getOtherMember(members , req.userId);
      return{
        _id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar.url,
      }
    });

  if(chatId){
    const chat= await Chat.findById(chatId)

    const availableFriends = friends.filter(friend => !chat.members.includes(friend._id));

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  }else{
    return res.status(200).json({
      success: true ,
      friends,
    })
    }
    
    

  })
 
  const getUserInfo =TryCatch(async(req , res , next)=>{
    const {userId} = req.body;
    const user = await User.findById(userId);

    return res.status(200).json({
      success: true,
      user,
    })
  
  })



module.exports={
    register,
    login,
    getMyProfile,
    logout,
    searchUser,
    sendFriendRequest,
    acceptRequest,
    getNotifications,
    getAllFriends,
    getUserInfo,
}