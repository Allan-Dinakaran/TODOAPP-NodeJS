const express = require('express');
const task = require('../Database/schema');
const userauth=require('../Middleware/token_auth');

const router = express.Router();

router.get('/',userauth,async (req,res)=>{
  try{
    const allTask=await task.find({ user: req.user.id });
    res.status(200).json(allTask);
  }
  catch(error){
    res.json({message: error.message})
  }
});

router.get('/:id',userauth,async (req,res)=>{
  try{
    const specifictask=await task.findOne({ taskid: req.params.id, user: req.user.id });
    if (specifictask.length===0) return res.status(404).send("No task created");
    
    res.status(200).json(specifictask);
  }
  catch(error){
    res.json({message: error.message})
  }
});

router.post('/',userauth,async (req,res)=>{
      try {
      const highestTask = await task.findOne({ user: req.user.id }).sort({ taskid: -1 });
      const nextId = highestTask && highestTask.taskid ? highestTask.taskid + 1 : 1;

      const taskdata = { 
          ...req.body, 
          taskid: nextId,
          user: req.user.id
      };
      const newtask= await task.create(taskdata);
      res.status(201).json(newtask);
    }
    catch(error){
      res.status(400).send((error)=>{error.message});
    }
});




router.put('/:id',userauth,async(req,res)=>{
  try{
    const uptask = await task.findOneAndUpdate({ taskid: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true});

    if(!uptask) return res.status(404).send("Task not found");

    res.status(200).json({message: "Task updated successfully",uptask});
  }
  catch(error){
    res.status(400).json({message: error.message});
  }
});

router.delete('/:id',userauth, async(req,res)=>{
  try{
    deltask=await task.findOneAndDelete({ taskid: req.params.id, user: req.user.id });

    if(!deltask) return res.status(404).send("Task not found");

    res.status(200).json({message: "Task deleted successfully",deltask});
  }
  catch(error){
    res.status(500).json({message: error.message});
  }
});

module.exports=router;