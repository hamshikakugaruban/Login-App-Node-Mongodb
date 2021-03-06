const express = require("express");
const {check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const conf = require('../conf')
const router = express.Router();

const User = require("../model/User");

router.post(
    "/signup", [
        check("username","enter a valid username").not().isEmpty(),
        check("email","entter a valid email").isEmail(),
        check("password","enter a valid password").isLength({
            min:6
        })
    ],
    async(req,res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(401).json({
                errors:errors.array()
            })
        }

        const {username,email,password} = req.body;
        try{
            let user = await User.findOne({
                email
            })
            if(user){
                return res.status(400).json({
                    msg:"user already exist"
                })
            }
            user = new User({
                username,email,password
            })
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password,salt)
            await user.save();

            const payload = {
                user:{
                    id:user.id,
                    name:user.username,
                    email:email
                }
            }
            jwt.sign(payload,conf.secret,{expiresIn:86400},
            (err,token) => {
                if(err) throw err;
                res.status(200).json({
                    token,email,username,password
                })
            })
        }
        catch(err){
            console.log(err.message);
            res.status(500).send("Error in saving");
        }
    }
)


router.post(
    "/signin",[
        check("email","enter the valid email").isEmail(),
        check("password","enter a valid password").isLength({
            min:6
        })
    ],
    async(req,res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array()
            })
        }
        const{email,password} = req.body;
        try{
            let user = await User.findOne({
                email
            })
            if(!user)
                return res.status(400).json({
                    message:"user not exist"
                })

                const isMatch = await bcrypt.compare(password,user.password);
                if(!isMatch)
                    return res.status(400).json({
                        message:"incorrect password"
                    })
                const payload = {user : {
                    id:user.id
                }
            };
            jwt.sign(payload,"randomeString",{
                expiresIn:3600
            },(err,token) =>{
                if(err) throw err;
                res.status(200).json({
                    token
                })
            })
        }
        catch(err){
            console.log(err);
            res.status(500).json({
                message:"server error"
            })
        }
    }
)

router.get("/me",function(req,res){
    var token= req.headers['x-access-token'];
    if(!token)
        return res.status(401).send({
            auth:false,message:'No token provided.'
        })
    jwt.verify(token,conf.secret,function(err,decoded){
        if(err)
            return res.status(500).send({
                auth:false,message:'Failed to authenticate token.'
            })
        res.status(200).send(decoded)
    })
    
})

module.exports = router;