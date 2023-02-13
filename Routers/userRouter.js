const router = require('express').Router();
const subscribers = require('../Models/user');
// const { signUp, verifyOtp } = require('../Controllers/userController');

// router.route('/signUp').post(signUp); // POST /user/signUp

// router.route('/verifyOtp').post(verifyOtp); // POST /user/verifyOtp

router.get('/', async (req, res) => {
    
    try {
        const subscribers = await new subscribers.find();
        console.log(subscribers);
        res.json(subscribers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const subscriber = new subscribers({
        name: req.body.name,
    });
    try {
        const newSubscriber = await subscriber.save();
        res.status(201).json(newSubscriber);    
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;