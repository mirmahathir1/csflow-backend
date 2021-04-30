const jwt = require('jsonwebtoken');

const db = require('../db');

module.exports = class TempUser {
    static async getTempUserByToken(token) {
        let result = await db.execute(`SELECT *
                                       FROM tempuser
                                        WHERE token='${token}';`);

        if(result[0][0])
            return result[0][0];
        else
            return null;
    }

    static async saveUserTemporarily(name, email, password, token) {
        return db.execute(`INSERT INTO tempuser(email, name, password, token)
                           VALUES ('${email}', '${name}', '${password}', '${token}')`);
    }

    static async deleteTempAccountByEmail(email) {
        return db.execute(`DELETE
                           FROM tempuser
                           WHERE email = '${email}'`);
    }

    static getAllTempUser() {
        return db.execute(`SELECT *
                           FROM tempuser;`);
    }
};
