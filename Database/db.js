const mongoose=require('mongoose');

async function connect(){
    try{
        let connection = await mongoose.connect('mongodb://localhost:27017/todo');
        console.log("Connection established...");
    }
    catch(error){
        console.error(error.message);
    }
}

module.exports = connect;