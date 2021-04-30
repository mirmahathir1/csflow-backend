const jwt = require('jsonwebtoken');

const db = require('../db');

module.exports = class ForgetPassword {
    static async getEmailByToken(token) {
        let result = await db.execute(`SELECT email
                                       FROM ForgetPassword
                                       WHERE token = '${token}';`);

        if (result[0][0]) return result[0][0].email;
        else return null;
    }

    static async saveToken(email, token) {
        return db.execute(`INSERT INTO ForgetPassword(email, token)
                           VALUES ('${email}', '${token}')`);
    }

    static async deleteByEmail(email) {
        return db.execute(`DELETE
                           FROM ForgetPassword
                           WHERE email = '${email}'`);
    }

    static async getAllAccount() {
        return db.execute(`SELECT *
                           FROM ForgetPassword;`);
    }
};
