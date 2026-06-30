const express = require('express');
const config = require('config');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../Database/user');

router.get('/register', (req, res) => {
    res.status(200).json({ 
        message: "Registration Endpoint Active.", 
        instructions: "Send a POST request with 'username', 'email', and 'password' to create an account." 
    });
});

router.get('/login', (req, res) => {
    res.status(200).json({ 
        message: "Login Endpoint Active.", 
        instructions: "Send a POST request with your credentials to receive your JWT access token." 
    });
});

router.get('/forgot-password', (req, res) => {
    res.status(200).json({ 
        message: "Forgot - Password?", 
        instructions: "Send a POST request with 'email', and 'password' to create a new password." 
    });
});

router.post('/register',async (req,res)=>{
    try{
        const username=req.body.username;
        const password=req.body.password;
        const email=req.body.email;

        const user_check=await user.findOne({username: username});
        const email_check=await user.findOne({email :email});

        if (user_check) return res.status(400).send("User already exits");
        if (email_check) return res.status(400).send("Email already exits");

        const salt=await bcrypt.genSalt(10);
        const hashedpass= await bcrypt.hash(password,salt);

        const newuser = new user({
            username: username,
            password: hashedpass,
            email: email
        });

        await newuser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login',async(req,res)=>{
    try{
        const username=req.body.username;
        const password=req.body.password;
        const email=req.body.email;

        const foundUser = await user.findOne({ username: username });
        if (!foundUser) return res.status(400).send("Invalid username or password");

        const pass_compare=await bcrypt.compare(password,foundUser.password);
        if (!pass_compare) return res.status(400).send("Invalid username or password");

        const token=jwt.sign(
            { id: foundUser._id},
            process.env.JWT_SECRET || "temporary_development_secret_key",
            { expiresIn: '2h' });

        res.status(200).json({
            message: "Login successful!",
            token: token
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await user.findOne({ username: username });
    if (!foundUser) {
      return res.status(404).json({ message: "No account with that email exists." });
    }

    const salt = await bcrypt.genSalt(10);
    foundUser.password = await bcrypt.hash(password, salt);

    await foundUser.save();

    res.status(200).json({ message: "Password updated successfully! Go ahead and log in." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports=router;