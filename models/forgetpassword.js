const jwt = require('jsonwebtoken');

const db = require('../db');

module.exports = class ForgetPassword {
    static async getEmailByToken(token) {
        let result = await db.execute(`SELECT email
                                       FROM ForgetPassword
                                       WHERE token = '${token}';`);

        if(result[0][0])
            return result[0][0].email;
        else
            return null;
    }

    static async saveToken(email, token) {
        await ForgetPassword.deleteAllTimeExceed();
        await ForgetPassword.deleteByEmail(email);

        return db.execute(`INSERT INTO ForgetPassword(email, token)
                           VALUES ('${email}', '${token}')`);
    }

    static async deleteByEmail(email) {
        return db.execute(`DELETE
                           FROM ForgetPassword
                           WHERE email = '${email}'`);
    }

    static async deleteAllTimeExceed() {
        const result = await db.execute(`SELECT *
                                       FROM ForgetPassword;`);

        for (let i = 0; i < result[0].length; i++) {
            const row = result[0][i];
            try {
                const res = await jwt.verify(row.Token, process.env.BCRYPT_SALT);
                const expireDate = new Date(res.exp * 1000);
                if (expireDate < (new Date()))
                    await ForgetPassword.deleteByEmail(row.Email);
            } catch (e) {
                await ForgetPassword.deleteByEmail(row.Email);
            }
        }
        return result;
    }
};
