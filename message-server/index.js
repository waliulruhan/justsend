const express = require('express')
const { createServer } = require('node:http');
const { connectDB, userSocketIDs } = require('./utils/features');
const dotenv  = require('dotenv');
const cors = require("cors");
const { errorMiddleWare } = require('./middlewares/error');
const cookieParser = require('cookie-parser');

const userRoute =require('./routes/userRoutes');
const chatRoute =require('./routes/chatRoutes');
const adminRoute =require('./routes/adminRoutes');

const { v4 : uuid } = require("uuid")
const { v2 : cloudinary } = require("cloudinary");

const { Server } = require('socket.io');
const { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING, CHAT_JOINED, CHAT_LEAVED, CHAT_ONLINE_USERS, ONLINE_USERS, MARK_MESSAGE_AS_SEEN } = require('./constants/event');

const Message = require('./models/messageModel');
const Chat = require('./models/chatModel');

const { corsOptions } = require('./constants/config');
const { socketAuth } = require('./middlewares/auth');
const User = require('./models/userModel');


dotenv.config()


const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 5000;




connectDB(mongoURI)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });


const app = express();
const server = createServer(app)

const io = new Server(server , {
    cors: corsOptions,
})
app.set("io", io);
 

app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser())
app.set("trust proxy", 1);

app.get('/',(req , res)=>{
    res.send('hiiiiii from message')
})

app.use('/api/v1/user' , userRoute)
app.use('/api/v1/chat' , chatRoute)
app.use('/api/v1/admin' , adminRoute)


// socket

const chatOnlineUsers = new Set();
const onlineUsers = new Set();

const getSockets = (users) => {
    return users?.map(userId => userSocketIDs.get(userId.toString())); 
}

io.use((socket , next)=>{
   cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuth(err , socket , next)
  )
})

io.on("connection" , (socket)=>{
    const user = socket.user;

    User.findByIdAndUpdate(user._id, { lastActive: Date.now() })
    .catch(err => console.error("Update failed:", err.message));

    userSocketIDs.set(user._id.toString() , socket.id)
    onlineUsers.add(user.id);

    socket.on(ONLINE_USERS, ({friends}) => {
      const membersSocket = getSockets(friends);
      io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    }); 

    socket.on(NEW_MESSAGE , async({ chatId , members , message })=>{
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
              _id: user._id,
              name: user.name,
              avatar: user.avatar            },
            seen: false,
            chat: chatId,
            createdAt: new Date().toISOString(),
          };
          
          const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
          }; 

        const membersSockets = getSockets(members) 

        io.to(membersSockets).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        })
        io.to(membersSockets).emit(NEW_MESSAGE_ALERT, {chatId})

        try {
            Message.create(messageForDB)
            await Chat.findByIdAndUpdate(chatId, { $set: { updatedAt: new Date() } });
        }catch(error){
            console.log(error)
        }
    }) 
    socket.on(START_TYPING, ({ members, chatId }) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(START_TYPING, { chatId });
      });
    
      socket.on(STOP_TYPING, ({ members, chatId }) => {
        const membersSockets = getSockets(members);
        socket.to(membersSockets).emit(STOP_TYPING, { chatId });
      });

      socket.on(CHAT_JOINED, ({ members, userId}) => {
        chatOnlineUsers.add(userId);
        const membersSocket = getSockets(members);
          io.to(membersSocket).emit(CHAT_ONLINE_USERS, Array.from(chatOnlineUsers));

      }); 

      socket.on(CHAT_LEAVED, ({ userId, members }) => {
        chatOnlineUsers.delete(userId);
    
        const membersSocket = getSockets(members);

          io.to(membersSocket).emit(CHAT_ONLINE_USERS, Array.from(chatOnlineUsers));
      });


// setting message as seen
      socket.on(MARK_MESSAGE_AS_SEEN , async({chatId , members})=>{
        try{
          await Message.updateMany({chat : chatId , seen : false} ,{ $set:{seen : true}})

          const membersSocket = getSockets(members);
          io.to(membersSocket).emit(MARK_MESSAGE_AS_SEEN , { chatId })


        }catch(error){
          onsole.log(error)
        }
      })



    socket.on("disconnect" , ()=>{
        userSocketIDs.delete(user._id);

        // this is for: if a person has joined a chat
        chatOnlineUsers.delete(user._id);
        socket.broadcast.emit(CHAT_ONLINE_USERS, Array.from(chatOnlineUsers));

        // this is for: all active users
        onlineUsers.delete(user.id);
        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
    })
})

// error middleware
app.use(errorMiddleWare)


server.listen( port ,()=>{
    console.log(`Message server is running port: ${port} `)
})
