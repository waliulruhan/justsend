const { Router } = require("express");

const { login , register, getMyProfile, logout, searchUser, sendFriendRequest, acceptRequest , getNotifications, getAllFriends, getUserInfo} =require('../controllers/userControllers');
const { singleAvatar } = require("../middlewares/multer");
const { checkAuth } = require("../middlewares/auth");
const { validateHandler, registerValidator } = require("../lib/validators");

const app = Router()

app.post('/register', singleAvatar , register )
app.post('/login' , login )

// these routes requires auth
app.use(checkAuth)
app.get('/me',getMyProfile)
app.get('/logout', logout)
app.get('/search', searchUser)
app.put('/request' , sendFriendRequest)
app.put('/accept-request' , acceptRequest)
app.get('/notifications' , getNotifications)
app.get('/friends' , getAllFriends)
app.post('/get-user-info' , getUserInfo)


module.exports= app