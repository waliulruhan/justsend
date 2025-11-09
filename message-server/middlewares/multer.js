const multer = require("multer");

const multerUpload = multer({
    limits:{
        fileSize: 1024 * 1024 * 25,
    },
})

const singleAvatar = multerUpload.single("avatar");

const attachmentMulter = multerUpload.array("files" , 20)

module.exports={
    multerUpload,
    singleAvatar,
    attachmentMulter,
}