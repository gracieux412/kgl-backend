const mongoose = require("mongoose")

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI)
        console.log(`mongodb connected ${connectionInstance.connection.host}`)
        
    }catch(err){
        console.error(err)
        
    }
}

module.exports = connectDB

// things for me to consider

// can you create a REST API 
// write a logic that will perform a task
// Can use the mongo DB
// can you consume the API in the front end (DOM manipulation)
// Documentation and deploy the backend