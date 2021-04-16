const bcrypt = require('bcryptjs');


const run = async () => {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash("test1234", salt);
    console.log(hash);
}

run()