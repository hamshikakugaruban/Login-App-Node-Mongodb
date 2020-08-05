const express = require("express");
const {check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
    async(req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
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
                    id:user.id
                }
            }
            jwt.sign(payload,"randomSting",{expiresIn:10000},
            (err,token) => {
                if(err) throw err;
                res.status(200).json({
                    token
                })
            })
        }
        catch(err){
            console.log(err.message);
            res.status(500).send("Error in saving");
        }
    }
)

module.exports = router;