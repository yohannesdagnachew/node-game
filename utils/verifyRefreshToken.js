const Token = require("../Models/token");
const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_PRIVATE_KEY;

const verifyRefreshToken = async (refreshToken) => {
   
   return Promise((resolve, reject) => {
         Token.findOne({token: refreshToken}, (err, doc) => {
            if(!doc) 
                return reject({error: true, message: "Invalid token"});
            jwt.verify(refreshToken, jwtSecretKey, (err, paylod) => {
                if(err) return reject({error: true, message: "Invalid token"});
                resolve({
                    paylod,
                    error: false,
                    message: "Token verified successfully",
                });
            })
        })
   })
    
}

module.exports = verifyRefreshToken;

