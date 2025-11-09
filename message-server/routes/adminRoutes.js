const {Router} =  require("express")
const { allUsers, adminLogin, adminLogout, allChats, allMessages, getDashboardStats, getIsAdmin } = require("../controllers/adminControllers");
const { checkAdminAuth } = require("../middlewares/auth");

const app = Router()

app.post('/verify' , adminLogin);

app.get("/logout", adminLogout);

app.use(checkAdminAuth)

app.get("/" , getIsAdmin)

app.get("/users",  allUsers)
app.get("/chats" , allChats)
app.get("/messages" , allMessages)
app.get("/stats" , getDashboardStats)

module.exports = app;