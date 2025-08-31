import jwt from "jsonwebtoken";

const isAuthenticated= async(req,res,next)=>{
    try{
      const token = 
    req.cookies?.token ||           // from cookies
    req.headers?.authorization?.replace('Bearer ', '') || // from headers
    req.body?.token ||             // from body
    null;

        if(!token){
            return res.status(401).json({
                success:false,
                message:"User not authenticated",
            })
        }
        const decode= jwt.verify(token,process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                success:false,
                message:"Invalid token",
            })
        }
        req.id=decode.userId;
        next();
    }catch(err){
        console.log(err);
    }
}
export default isAuthenticated;