const { REFETCH_CHATS, ALERT, NEW_MESSAGE, NEW_MESSAGE_ALERT } = require("../constants/event");
const { getOtherMember } = require("../lib/helper");
const { TryCatch, ErrorHandler } = require("../middlewares/error");
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const { emitEvent, deleteFilesFromCloudinary, uploadFilesToCloudinary } = require("../utils/features");


const newGroupChat = TryCatch(async(req, res, next)=>{
    const {name , members} = req.body;

    if(members.length < 2) return next(new ErrorHandler('Group chat must have at least 3 members' , 400));

    const allMembers =[...members , req.userId];

    const chat = await Chat.create({
        name,
        members: allMembers,
        groupChat: true,
        creator: req.userId,
    })
    emitEvent(req, ALERT , allMembers , `Welcome to ${name} group.`)
    emitEvent(req, REFETCH_CHATS , allMembers)

    return res.status(201).json({
        success: true,
        message: "Group Created",
    })

})
const getMyChats = TryCatch(async(req , res , next)=>{
    const chats = await Chat.find({members: req.userId}).populate("members" , "name avatar").sort({ updatedAt: -1 });
    const transformedChats = chats.map(({_id , name ,members , groupChat})=>{
        const otherMember = getOtherMember(members , req.userId);
        return {
            _id,
             groupChat,
             avatar: groupChat ? members.slice(0 ,3).map(({avatar})=> avatar.url ) : [otherMember.avatar.url],
             name: groupChat ? name : otherMember.name,
             members: members.filter(i => i._id.toString() != req.userId.toString()).map(i=> i._id),            
        }
    })
    const {name = ""} = req.query;

    const filteredChats = transformedChats.filter(chat => {
        const regex = new RegExp(name, "i");
        return regex.test(chat.name);
    });
    return res.status(200).json({
        success: true,
        chats: filteredChats,
    })
})

const getMyGroups = TryCatch(async(req , res , next)=>{
    const groups = await Chat.find({members: req.userId, creator: req.userId , groupChat: true }).populate("members" , "name avatar");

    const transformedgroups = groups.map(({_id , name ,members , groupChat})=>{
        return {
            _id,
             groupChat,
             avatar: members.slice(0 ,3).map(({avatar})=> avatar.url),
             name: name,           
        }
    })
    return res.status(201).json({
        success: true,
        groups: transformedgroups,
    })
})

const addMembers = TryCatch(async(req , res , next)=>{
    const {chatId , members} = req.body;

    const group = await Chat.findById(chatId)


    if (!group) return next(new ErrorHandler("Chat not found", 404));

    if (!group.groupChat) return next(new ErrorHandler("This is not a group chat", 400));
  
    if (group.creator.toString() !== req.userId.toString()) return next(new ErrorHandler("You are not allowed to add members", 403));
    
    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));

    const allNewMembers = await Promise.all(allNewMembersPromise);
    const uniqueMembers = allNewMembers.filter( i=> !group.members.includes(i._id.toString())).map(i => i._id)
    group.members.push(...uniqueMembers)

    if (group.members.length > 50) return next(new ErrorHandler("Group members limit reached", 400));

    await group.save()

    const allUsersName = allNewMembers.map( i=> i.name).join(", ")
    emitEvent(
        req,
        ALERT,
        group.members,
       {chatId , message: `${allUsersName} has been added to the group`}
    )
    emitEvent(req, REFETCH_CHATS, group.members);

    return res.status(201).json({
        success: true,
        message: "Members added sucessfully",
    })
})

const removeMember = TryCatch(async(req , res , next)=>{
    const {chatId , userId} = req.body;

    const [group, userThatWillBeRemoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId, "name"),
      ]);


    if (!group) return next(new ErrorHandler("Chat not found", 404));

    if (!group.groupChat) return next(new ErrorHandler("This is not a group chat", 400));
  
    if (group.creator.toString() !== req.userId.toString()) return next(new ErrorHandler("You are not allowed to add members", 403));
    
    if (group.members.length <= 3) return next(new ErrorHandler("Group must have at least 3 members", 400));
    
    group.members = group.members.filter(
        (member) => member.toString() !== userId.toString()
        );
        
    
    await group.save()
        
    const allGroupMembers = group.members.map((i) => i.toString());

    emitEvent(
        req,
        ALERT,
        allGroupMembers,
        {chatId , message:`${userThatWillBeRemoved.name} has been removed from the group`}
    )
    emitEvent(req, REFETCH_CHATS, group.members);

    return res.status(201).json({
        success: true,
        message: "Member removed sucessfully",
    })
})

const leaveGroup = TryCatch(async(req , res , next)=>{
    const chatId = req.params.id;

    const group = await Chat.findById(chatId)


    if (!group) return next(new ErrorHandler("Group not found", 404));

    if (!group.groupChat) return next(new ErrorHandler("This is not a group chat", 400));
 
    const remainingMembers = group.members.filter(
        (member) => member.toString() !== req.userId.toString()
      );

    if (remainingMembers.length < 3) return next(new ErrorHandler("Group must have at least 3 members", 400));


    if (group.creator.toString() === req.userId.toString()) {
    const randomElement = Math.floor(Math.random() * remainingMembers.length);
    const newCreator = remainingMembers[randomElement];
    group.creator = newCreator;
   }

    
    
    group.members = remainingMembers;
     
    const [user] = await Promise.all([
    User.findById(req.userId, "name"),
    group.save(),
    ]);
        

    emitEvent(
        req,
        ALERT,
        group.members,
        {chatId , message:`${user.name} has left the group`}
    )

    return res.status(201).json({
        success: true,
        message: "Sucessfully left",
    })
})

const sendAttachments = TryCatch(async(req , res , next)=>{
    const{chatId} = req.body;

    const files = req.files || [];


    if (files.length < 1)
      return next(new ErrorHandler("Please Upload Attachments", 400));
  
    if (files.length > 20)
      return next(new ErrorHandler("Files Can't be more than 20", 400));

    const [chat , me] = await Promise.all([
        Chat.findById(chatId),
        User.findById(req.userId)
    ])

    if(!chat) return next(new ErrorHandler("Chat not found" , 404));
    
    const attachments = await uploadFilesToCloudinary(files);

    const messageForDB = {
        content: "",
        attachments,
        sender: me._id,
        chat: chatId,
      };
    
      const messageForRealTime = {
        ...messageForDB,
        sender: {
          _id: me._id,
          name: me.name,
        },
      };

      const message = await Message.create(messageForDB);

      emitEvent(req, NEW_MESSAGE, chat.members, {
        message: messageForRealTime,
        chatId,
      });
      emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res.status(201).json({
        success: true,
        message,
    })
})

const getChatDetails = TryCatch(async (req, res, next) => {
   
    let chatQuery = Chat.findById(req.params.id);

    
    if (req.query.populate === "true" || !chatQuery.groupChat) {
        chatQuery = chatQuery.populate("members", "name avatar lastActive");
    }

    
    const chat = await chatQuery.lean();  
    
   
    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    if (chat.members) {
        chat.members = chat.members.map(({ _id, name, avatar, lastActive }) => ({
            _id,
            name,
            avatar: avatar.url,
            lastActive 
        }));
        chat.membersRaw = chat.members.map(member => member._id);
    }
    
    return res.status(200).json({
        success: true,
        chat,
    });
});


const renameGroup = TryCatch(async(req , res ,next)=>{
    const chatId = req.params.id;
    const { name } = req.body;
  
    const chat = await Chat.findById(chatId);
  
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
  
    if (!chat.groupChat)
      return next(new ErrorHandler("This is not a group chat", 400));
  
    if (chat.creator.toString() !== req.userId.toString())
      return next(
        new ErrorHandler("You are not allowed to rename the group", 403)
      );
  
    chat.name = name;
  
    await chat.save();
  
    emitEvent(req, REFETCH_CHATS, chat.members);
  
    return res.status(200).json({
      success: true,
      message: "Group renamed successfully",
    });  
})

const deleteChat = TryCatch(async(req , res ,next)=>{
    const chatId = req.params.id 
    const chat = await Chat.findById(chatId);
  
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
  
    const members = chat.members;
    
    if (chat.groupChat && chat.creator.toString() !== req.userId.toString())return next(new ErrorHandler("You are not allowed to delete the group", 403));

    if (!chat.groupChat && !chat.members.includes(req.userId.toString())) return next(new ErrorHandler("You are not allowed to delete the chat", 403));
      
    const messagesWithAttachments = await Message.find({
        chat: chatId,
        attachments: { $exists: true, $ne: [] },
    });

    const public_ids = [];
    messagesWithAttachments.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
    
    );

    await Promise.all([
        deleteFilesFromCloudinary(public_ids),
        chat.deleteOne(),
        Message.deleteMany({chat: chatId})
    ]);

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
        success: true,
        message: "Chat deleted successfully"
    })

})

const getMessages = TryCatch(async(req, res , next)=>{
    const  chatId = req.params.id;
    
    const {page = 1} =req.query;
    const limit= 100;
    const skip = (page - 1)* limit;

    const chat = await Chat.findById(chatId);

    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    if (!chat.members.includes(req.userId.toString()))return next(new ErrorHandler("You are not allowed to access this chat", 403));

    const[ messages , totalMessagesCount ] = await Promise.all([
        Message.find({chat: chatId}).populate("sender" , "name avatar").skip(skip).limit(limit).sort({createdAt: -1}).lean(),
        Message.countDocuments({chat: chatId})
    ])

    const totalPages = Math.ceil(totalMessagesCount / limit) || 0;
    return res.status(200).json({
        success: true,
        messages: messages.reverse(),
        totalPages
    })


})

const getChatOverview = TryCatch(async (req, res, next) => {
    const { chatId } = req.body;

    try {
        const messagesCount = await Message.countDocuments({ chat: chatId });

        return res.status(200).json({
            success: true,
            messagesCount,
        });
    } catch (error) {
        next(error); 
    }
});

const getAttachments = TryCatch(async (req, res, next) => {
    const { chatId } = req.body;

    try {
        // Fetch the messages with attachments for the given chatId
        const messages = await Message.find({ chat: chatId, attachments: { $ne: [] } });

        // Function to sort attachments based on their extension
        const sortAttachments = (attachments) => {
            const categorizedFiles = {
                images: [],
                audios: [],
                videos: [],
                files: [],
            };

            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            const audioExtensions = ['mp3', 'wav', 'ogg', 'flac'];
            const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'webm'];

            // Loop through the attachments and sort based on file extension
            attachments.forEach((attachment) => {
                const fileExtension = attachment.url.split('.').pop().toLowerCase();
                
                if (imageExtensions.includes(fileExtension)) {
                    categorizedFiles.images.push(attachment.url);
                } else if (audioExtensions.includes(fileExtension)) {
                    categorizedFiles.audios.push(attachment.url);
                } else if (videoExtensions.includes(fileExtension)) {
                    categorizedFiles.videos.push(attachment.url);
                } else {
                    categorizedFiles.files.push(attachment.url);
                }
            });

            return categorizedFiles;
        };

        // Flatten all attachments across messages
        const allAttachments = messages.flatMap((message) => message.attachments);

        // Sort the attachments into categories
        const sortedAttachments = sortAttachments(allAttachments);

        // Send the categorized attachments back in the response
        return res.status(200).json({
            success: true,
            attachments: sortedAttachments,
        });
    } catch (error) {
        next(error);
    }
});


    
module.exports={
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMember,
    leaveGroup,
    sendAttachments,
    getChatDetails,
    renameGroup,
    deleteChat,
    getMessages,
    getChatOverview,
    getAttachments
}