const express = require ('express');
const mongoose = require('mongoose');
const config = require('config');
const connect_DB = require('./Database/db');
const task= require('./Routes/tasks');
const completed= require('./Routes/completed');
const incomplete= require('./Routes/incomplete');
const auth=require('./Routes/auth');

const app = express();
//Database connection
connect_DB();

//middlewares
app.use(express.json());
app.use('/api/auth',auth);
app.use('/api/tasks/incomplete',incomplete);
app.use('/api/tasks/completed',completed);
app.use('/api/tasks',task);


//Server connection
const PORT=config.get('port') || 3000;
app.listen(PORT,() => {
  console.log("Server Started");
});

