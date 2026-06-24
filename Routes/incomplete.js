const express= require('express');
const task=require('../Database/schema');

const router = express.Router();

router.get('/',async(req,res)=>{
    try{
    incompletedtask=await task.find({Completed:false});

    res.status(200).json(incompletedtask);
    }
    catch(error){
        res.status(500).send((error)=>{error.message});
    }
});

module.exports=router;