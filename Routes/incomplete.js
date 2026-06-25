const express= require('express');
const task=require('../Database/schema');
const userauth=require('../Middleware/token_auth');

const router = express.Router();

router.get('/',userauth,async(req,res)=>{
    try{
    incompletedtask=await task.find({Completed:false,user: req.user.id});

    res.status(200).json(incompletedtask);
    }
    catch(error){
        res.status(500).send((error)=>{error.message});
    }
});

module.exports=router;