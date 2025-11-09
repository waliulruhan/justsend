const { Router } = require("express");
const { checkAuth } = require("../middlewares/auth");
const { getAttachments, getChatOverview, newGroupChat, getMyChats, getMyGroups, addMembers, removeMember, leaveGroup, sendAttachments, getChatDetails, renameGroup, deleteChat, getMessages } = require("../controllers/chatControllers");
const { attachmentMulter } = require("../middlewares/multer");

const app = Router()

// these routes requires auth
app.use(checkAuth)
app.post('/new', newGroupChat)
app.get('/mychats' , getMyChats)
app.get('/mygroups' , getMyGroups)
app.put('/addmembers' , addMembers)
app.put('/removemember' , removeMember)
app.delete('/leave/:id' ,leaveGroup)

app.post('/message', attachmentMulter , sendAttachments)

app.route('/:id').put(renameGroup).get(getChatDetails).delete(deleteChat)

app.get('/messages/:id', getMessages)

app.post('/chat-overview', getChatOverview)
app.post('/attachment', getAttachments)

module.exports= app