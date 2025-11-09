const jwt = require("jsonwebtoken");
const { mongoose } = require("mongoose");
const { v4 : uuid } = require("uuid");
const { v2 : cloudinary } = require("cloudinary");

const userSocketIDs = new Map();

async function connectDB(uri) {
  mongoose.connect(uri, {
    w: 'majority',
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
}

const cookieOptions = {
  maxAge: 16 * 24 * 60 * 60 * 1000,
  secure: true,
  sameSite: 'none',
  path: '/',
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res.status(code).cookie("happiness-cookie", token, cookieOptions).json({
    success: true,
    user,
    message,
    token,
  });
};

const emitEvent=(req, event, users, data)=>{
  const membersSockets = users?.map(userId => userSocketIDs.get(userId.toString())); 
  const io = req.app.get("io");
  io.to(membersSockets).emit(event, data);
}


const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error uploading files to cloudinary", err);
  }
};

const deleteFilesFromCloudinary = async(public_ids)=>{
  try {
    const deletePromises = public_ids.map((public_id) => {
      return cloudinary.uploader.destroy(public_id);
    });

    const results = await Promise.all(deletePromises);
    return results;
  } catch (err) {
    console.error('Error deleting files from Cloudinary:', err);
    throw new Error('Error deleting files from Cloudinary');
  }
}


module.exports={
  userSocketIDs,
    connectDB,
    sendToken,
    cookieOptions,
    emitEvent,
    deleteFilesFromCloudinary,
    uploadFilesToCloudinary,


}