class ApiError extends Error {
    constructor(message="Somthing went Wrong", statusCode, errors = [], stack=""
        ) {
        super(message)
        this.statusCode = statusCode || 500;
        this.data = null;
        this.errors = errors;
        this.message = message;
        this.success = false;
        if (stack){
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }   

    
}
export {ApiError};