const express= require('express');
const task=require('../Database/schema');

const router = express.Router();

router.get('/',async(req,res)=>{
    try{
    completedtask=await task.find({Completed:true});

    res.status(200).json(completedtask);
    }
    catch(error){
        res.status(500).send((error)=>{error.message});
    }
});

module.exports=router;