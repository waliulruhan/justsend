const { verify } = require("jsonwebtoken");
const { TryCatch, ErrorHandler } = require("./error");
const User = require("../models/userModel");

const checkAuth = TryCatch(async(req,res,next)=>{
    const token = req.cookies["happiness-cookie"];
    
    if(!token) return next(new ErrorHandler("Please login to access this route.", 401));

    const decodedData = await verify(token , process.env.JWT_SECRET);
    const userId = decodedData._id;
    req.userId = userId;
    next()
})

const checkAdminAuth = TryCatch(async(req,res,next)=>{
    const token = req.cookies["happiness-admin-cookie"];
    const adminSecretKey = process.env.SECRET_KEY || "jhbfjhjshcdshvhsdhvjefhvujwekb"
    if(!token) return next(new ErrorHandler("Only admin access this route.", 401));

    const secretkey = await verify(token , process.env.JWT_SECRET);
    const isMatched = secretkey === adminSecretKey;


    if (!isMatched)return next(new ErrorHandler("Only Admin can access this route", 401));

    next()
})


const socketAuth = async(err , socket , next)=>{
    try{
        if(err) next(err)

        const authToken = socket.request.cookies["happiness-cookie"];

        if (!authToken) return next(new ErrorHandler("Please login to access this route", 401));

        const decodedData = verify(authToken, process.env.JWT_SECRET);

        const user = await User.findById(decodedData._id);
    
        if (!user)
          return next(new ErrorHandler("Please login to access this route", 401));
    
        socket.user = user;
    
        return next();
    }catch(error){
        return next(new ErrorHandler('please login to access this route' , 401))
    }

}

module.exports={
    checkAuth,
    checkAdminAuth,
    socketAuth,
}