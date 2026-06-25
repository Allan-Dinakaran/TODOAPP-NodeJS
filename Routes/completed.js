const express= require('express');
const task=require('../Database/schema');
const userauth=require('../Middleware/token_auth');

const router = express.Router();

router.get('/',userauth,async(req,res)=>{
    try{
    completedtask=await task.find({Completed:true,user: req.user.id},
    );

    res.status(200).json(completedtask);
    }
    catch(error){
        res.status(500).send((error)=>{error.message});
    }
});

module.exports=router;