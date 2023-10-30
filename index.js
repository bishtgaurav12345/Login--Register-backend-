const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
require('./db');
const User = require('./MODOLES/user.model');
const  bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());


app.get('/',(req,res)=>{
    res.send('api is working');
})

app.get('/users', async (req, resp) => {
    try {
      const users = await User.find();
      resp.status(200).json({
        users
      });
    } catch (error) {
      resp.status(500).json({ error: 'An error occurred while fetching users' });
    }
  });
  

function authorizationToken(req,resp,next){
    const token = req.headers.authorization
    const {id} = req.body;
    if(!token){
        resp.status(401).json({
            message:"auth error"
        })
    }

    try{
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(decodedToken.id !== id){
            resp.status(200).json({
                message:"access granted"
            })
        }
        next();

    }
    catch(err){
        console.log(err);
        resp.status(500).json({
            message:"invalid token"
        })
    }
}

app.post("/register", async (req,resp)=>{
    try{
    const {name,age,email,password} = req.body;
    const existingUser = await User.findOne({email});

    if(existingUser){
        resp.json({
            message:"user is already register .... please login"
        })
    }
    const salt  = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password,salt);
    console.log("salt",salt);
    console.log("hased pass ", hashedpass);
    const newUser = new User ({
        name,
        email,
        password:hashedpass,
        age
    });
    newUser.save();
    resp.status(201).json({
        newUser,
        message:"user register succesfully"
    });}catch(err){
        resp.status(500).json({
            message:err.message
        })
    }

})

app.post("/login", async(req,resp)=>{
    const {email,password}=  req.body;
    const existingUser = await User.findOne({email});

    if(!existingUser){
       return  resp.json({
            message:"invalid email"
        })
    }

    const isPasswordCorrect = bcrypt.compare(password, existingUser.password);
    if(!isPasswordCorrect){
       return  resp.json({
            message:"wrong password"
        })
    }
    const Token = jwt.sign({id:existingUser._id},process.env.JWT_SECRET_KEY,{expiresIn:'1h'})
    resp.status(201).json({
        Token,
        message:"user logged in successfully"
    })
})

app.get('/userProfile',authorizationToken,(req,resp)=>{
    const {id} = req.body;
    const user = User.findOne({id});
    user.password =undefined;
    resp.status(200).json({
        user,
    });
})


app.listen(6000,()=>{
    console.log(`server is running at 6000`);
})