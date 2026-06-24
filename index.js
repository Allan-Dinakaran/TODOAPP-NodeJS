const express = require ('express');
const mongoose = require('mongoose');
const connect_DB = require('./Database/db');
const task= require('./Routes/tasks');
const completed= require('./Routes/completed');

const app = express();

//middlewares
app.use(express.json());
app.use('/api/tasks/completed',completed);
app.use('/api/tasks',task);


//Database connection
connect_DB();

//Server connection
const PORT=3000;
app.listen(PORT,() => {
  console.log("Server Started");
});

