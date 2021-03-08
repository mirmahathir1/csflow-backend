const User = require('../models/user');


exports.signIn = async (req, res, next) => {
    let user = await User.findById(req.body.id);
    res.send(user);
};
