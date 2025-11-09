class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }

const errorMiddleWare =(err, req , res , next)=>{
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    const response = {
        success: false,
        message: err.message,
      };
     
      return res.status(err.statusCode).json(response);  

}

const TryCatch = (passedFunc) => async (req, res, next) => {
    try {
      await passedFunc(req, res, next);
    } catch (error) {
      next(error);
    }
  };

 module.exports ={
    errorMiddleWare,
    TryCatch,
    ErrorHandler,
    
 }