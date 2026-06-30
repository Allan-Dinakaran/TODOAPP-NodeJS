const mongoose = require('mongoose');

const todo_schema = mongoose.Schema({
    taskid: {
        type: Number,
    },
    taskname: {
        type: String,
        required: [true, 'A name is required for the task'],
        minlength: 3
    },
    Description: {
        type: String,
        required: [true, 'Give a description of the task you are about to do'],
        minlength: 5
    },
    Completed: {
        type: Boolean,
        default: false
    },
    CreatedOn: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    fileUrl: { type: String },
    filePublicId: { type: String }
});

const todo_model=mongoose.model('Tasks', todo_schema);

module.exports=todo_model;