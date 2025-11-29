import jwt from "jsonwebtoken";

export const generateToken=(res,user,message)=>{
    const token=jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'365d'});
    res.cookie("token",token,{httpOnly:true,sameSite:"strict",maxAge:24*60*60*1000});
    return res.status(200).json({
        success:true,
        message,
        user,
        token
    })
}