const jwtSecretKey = process.env.JWT_PRIVATE_KEY;
const jwt = require("jsonwebtoken");
const Token   = require("../Models/token");

const generateToken = async (user) => {
  try {
    const paylod = {
      _id: user._id,
      name: user.name,
    };
    const accessToken = jwt.sign(paylod, jwtSecretKey, { expiresIn: "15m" });
    const refreshToken = jwt.sign(paylod, jwtSecretKey, { expiresIn: "7d" });
    
    const userToken = await Users.findOneAndUpdate(
        { userId: user._id },
    );
    if(userToken) await userToken.remove()   
    const token = new  Token({
        token: refreshToken,
        userId: user._id,
    }).save();
    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

export default generateToken;