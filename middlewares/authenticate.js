const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const {validationResult} = require('express-validator');


let handlePOSTLogIn = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({status:'ERROR',statusCode:400,message: "Missing fields in request body"});
        }

        let id = req.body.id;
        let password = req.body.password;
        let user = await User.findById(req.body.id);

        if (!user) {
            return res.status(401).send({status:'ERROR',statusCode:401,message: 'Incorrect id / password'});
        }

        let matched = await bcrypt.compare(password, user.password);

        if (matched) {

            let token = jwt.sign({id:user.id}, process.env.BCRYPT_SALT);

            await user.saveToken(token);

            return res.status(201).send({token});
        } else {
            return res.status(401).send({status:'ERROR',statusCode:401,message:'Incorrect id / password'});


        }
    } catch (e) {
        return res.status(500).send({message: e.message});
    }
};

let handleAuthentication = async (req, res, next) => {
    let decodedUser;
    let token
    try {
        token = req.header('x-auth');
        decodedUser = await jwt.verify(token, process.env.BCRYPT_SALT);
    }catch (e){
        return res.status(401).send({message: "Malformed JWT token"});
    }

    try {
        let user = await User.findByToken(token);

        if (!user) {
            return res.status(401).send({message: 'Invalid User'})
        }

        res.locals.middlewareResponse = {
            user,
            token
        };
        return next();


    } catch (e) {
        return res.status(500).send({message: e.message});

    }
};
//
// let handlePOSTLogOut = async (req, res) => {
//     try {
//         let donor = res.locals.middlewareResponse.donor;
//         let token = res.locals.middlewareResponse.token;
//
//         await donorInterface.findDonorByIDAndUpdate(donor._id, {
//             $pull: {
//                 tokens: {token}
//             }
//         });
//
//         return res.status(200).send({
//             status: 'OK',
//             message: 'Logged out successfully'
//         });
//     } catch (e) {
//         return res.status(500).send({
//             status: 'ERROR',
//             message: e.message
//         });
//     }
// };

module.exports = {
    handlePOSTLogIn,
    handleAuthentication,
    // handlePOSTLogOut
}
