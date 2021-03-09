const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const {  validationResult } = require('express-validator');

const {ErrorHandler} = require('../error');

let handlePOSTLogIn = async (req, res,next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // return res.status(400).json({ message: errors });
            throw new ErrorHandler(400, errors)

        }

        let id = req.body.id;
        let password = req.body.password;
        let user = await User.findById(req.body.id);

        if(!user){
            // return res.status(401).send({
            //     status: 'ERROR',
            //     message: 'Incorrect id / password'
            // });

            throw new ErrorHandler(401, 'Incorrect id / password')

        }

        let matched = await bcrypt.compare(password, user.password);

        if (matched) {
            let token = await jwt.sign({
                _id: id.toString(),
                auth:'auth'
            }, process.env.BCRYPT_SALT).toString();

            await user.saveToken(token);

            return res.status(201).send({token});
        } else {
            throw new ErrorHandler(401, 'Incorrect id / password')
        }
    } catch (e) {
        next(e);
    }
};

// let handleAuthentication = async (req, res, next) => {
//     try {
//         let token = req.header('x-auth');
//         let decodedDonor = await jwt.verify(token, process.env.BCRYPT_SALT);
//         let donorQueryResult = await donorInterface.findDonorByQuery({_id: decodedDonor._id}, {});
//
//         if (donorQueryResult.status === 'OK') {
//             let donor = donorQueryResult.data;
//             res.locals.middlewareResponse = {
//                 donor,
//                 token
//             };
//             return next();
//         } else {
//             return res.status(401).send({
//                 status: 'ERROR',
//                 message: 'Authentication failed. Invalid authentication token.'
//             });
//         }
//
//     } catch (e) {
//         return res.status(500).send({
//             status: 'EXCEPTION',
//             message: e.message
//         })
//     }
// };
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
    // handleAuthentication,
    // handlePOSTLogOut
}
