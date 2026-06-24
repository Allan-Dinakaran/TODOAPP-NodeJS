const express = require('express');
const task = require('../Database/schema')

const router = express.Router();

router.get('/',async (req,res)=>{
  try{
    const allTask=await task.find();
    res.status(200).json(allTask);
  }
  catch(error){
    res.json({message: error.message})
  }
});

router.get('/:id',async (req,res)=>{
  try{
    const specifictask=await task.find({taskid:req.params.id});
    if (specifictask.length===0) return res.status(404).send("No task created");
    
    res.status(200).json(specifictask);
  }
  catch(error){
    res.json({message: error.message})
  }
});

router.post('/',async (req,res)=>{
    try{
      const totaltask= await task.countDocuments();

      const taskdata={...req.body,taskid:totaltask +1 };
      const newtask= await task.create(taskdata);
      res.status(201).json(newtask);
    }
    catch(error){
      res.status(400).send((error)=>{error.message});
    }
});



router.put('/:id',async(req,res)=>{
  try{
    const uptask = await task.findOneAndUpdate({taskid:req.params.id},{$set:req.body},{new:true,runValidators:true});

    if(!uptask) return res.status(404).send("Task not found");

    res.status(200).json({message: "Task updated successfully",uptask});
  }
  catch(error){
    res.status(400).json({message: error.message});
  }
});

router.delete('/:id', async(req,res)=>{
  try{
    deltask=await task.findOneAndDelete({taskid:req.params.id});

    if(!deltask) return res.status(404).send("Task not found");

    res.status(200).json({message: "Task deleted successfully",deltask});
  }
  catch(error){
    res.status(500).json({message: error.message});
  }
});

module.exports=router;