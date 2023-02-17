const router = require('express').Router();
const Token = require('../Models/token');
const jwt = require('jsonwebtoken');
const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
const verifyRefreshToken = require('../utils/verifyRefreshToken');


router.route('/').post(async (req, res) => {
    verifyRefreshToken(req.body.refreshToken)
        .then((paylod) => {
            const dataDetails = {_id: paylod._id};
            const accessToken = jwt.sign(dataDetails, jwtPublicKey, {expiresIn: '15m'});
            res.status(200).json({error: false, message: "Token generated successfully", accessToken});
        })
        .catch((err) => {
            res.status(400).json(err);
        })

});

router.route('/').delete(async (req, res) => {
    try {
        userToken  = await Token.findOne({token: req.body.refreshToken});
        if(!userToken) return res.status(200).json({error: false, message: "Logout successful"});
        await userToken.remove();
        res.status(200).json({error: false, message: "Logout successful"});
    }
    catch (err) {
        res.status(400).json({error: true, message: err.message});
    }
});

module.exports = router;
