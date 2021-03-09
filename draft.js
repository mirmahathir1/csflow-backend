const bcrypt = require('bcryptjs');
bcrypt.genSalt(10, (err,salt) => {
    bcrypt.hash("test1234", salt,(err, hash) => {
        console.log("HASH VALUE: ",hash);
    })
});