const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../db');

module.exports = class TempUser {
    static async getTempUserByToken(token) {
        let result = await db.execute(`SELECT *
                                       FROM tempuser
                                        WHERE token='${token}';`);

        return result[0][0];
    }

    static async saveUserTemporarily(name, email, password, token) {
        await TempUser.deleteAllTimeExceedAccount();
        await TempUser.deleteTempAccountByEmail(email);
        // const encyptedPassword = await bcrypt.encrypt()
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        return db.execute(`INSERT INTO tempuser(email, name, password, token)
                           VALUES ('${email}', '${name}', '${hash}', '${token}')`);
    }

    static async deleteTempAccountByEmail(email) {
        return db.execute(`DELETE
                           FROM tempuser
                           WHERE email = '${email}'`);
    }

    static async deleteAllTimeExceedAccount() {
        let result = await db.execute(`SELECT *
                                       FROM tempuser;`);

        for (let i = 0; i < result[0].length; i++) {
            const row = result[0][i];
            try {
                const res = await jwt.verify(row.Token, process.env.BCRYPT_SALT);
                const expireDate = new Date(res.exp * 1000);
                if (expireDate < (new Date()))
                    await TempUser.deleteTempAccountByEmail(row.Email);
            } catch (e) {
                await TempUser.deleteTempAccountByEmail(row.Email);
            }
        }
        return result;
    }
};
