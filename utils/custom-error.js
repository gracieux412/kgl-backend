class KGLError extends Error{
    constructor(statusCode, message, reason=" "){
        
        this.statusCode = statusCode;
        super(message)
        this.reason = reason
    }
}

module.exports= { KGLError }