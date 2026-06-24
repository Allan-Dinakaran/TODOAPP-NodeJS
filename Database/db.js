const mongoose=require('mongoose');

async function connect(){
    try{
        const mongoURI =process.env.MONGO_URI || "mongodb://localhost:27017/todo";
        let connection = await mongoose.connect(mongoURI);
        console.log("Connection established...");
    }
    catch(error){
        console.error(error.message);
    }
}

module.exports = connect;