const mongoose = require('mongoose');

const userschema=mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, trim:true },
    email: {type: String, required: true,unique: true, trim: true}
});

const user = mongoose.model('user',userschema);

module.exports=user;