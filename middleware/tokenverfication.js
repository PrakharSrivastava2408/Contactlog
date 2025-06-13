const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req,res,next)=>{
    let token = req.headers.authorization || req.headers.Authorization;  
    if(token && token.startsWith("Bearer")){
        token = token.split(" ")[1];
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err){
                return res.status(401).json({ msg: "Unauthorized" });
            }
            req.user = decoded.user;
            next();
        });
    }
}

module.exports = authenticate;