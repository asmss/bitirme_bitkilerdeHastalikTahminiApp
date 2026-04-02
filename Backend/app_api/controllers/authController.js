const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.register = async(req,res)=>{
    const {username,email,password} = req.body;
    try {
        const user = await User.findOne({email:email});
        if(user){
            return res.status(400).json({message:"Bu email zaten kayıtlı"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await User.create({
            username,
            password:hashedPassword,
            email
        })
        sendTokenResponse(newUser, 201, res);
   } catch (error) {
       console.error(error);
       res.status(500).json({message:"Sunucu hatası"});
   }
  

}

exports.login = async(req,res)=>{
     const {email,password} = req.body;
     try {
        if(!email || !password){
            return res.status(400).json({succes:false,message:"Email ve parola gerekli"});
        }

           const user = await User.findOne({email:email}).select("+password");
           if(!user){
            return res.status(400).json({succes:false,message:"geçersiz email veya parola"})
           }
             const isMatch = await bcrypt.compare(password,user.password);
                if(!isMatch){
                    return res.status(400).json({succes:false,message:"geçersiz email veya parola"});
                }
                sendTokenResponse(user, 200, res);

     } catch (error) {
        console.error(error);
        res.status(500).json({succes:false,message:"Sunucu hatası"});
     }


}

const sendTokenResponse = (user,statusCode,res)=>{
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1d"});
res.status(statusCode).json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });}