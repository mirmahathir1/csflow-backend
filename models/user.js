const jwt = require('jsonwebtoken');
const dateTime = require('node-datetime');

const db = require('../db');

module.exports = class User {
    constructor(user) {
        this.id = user.ID;
        this.batchID = user.BatchID;
        this.name = user.Name;
        this.email = user.Email;
        this.password = user.Password;
        this.profilePic = user.ProfilePic;
        this.joiningDate = user.JoiningDate;
        this.level = user.Level;
        this.term = user.Term;
        this.session = user.Session;
        this.isCR = user.IsCR;
    }

    static fetchAll() {
        return db.execute('SELECT * FROM user;');
    }

    static async findById(id) {
        let resultRaw = await db.execute(`SELECT *
                                          FROM user
                                          WHERE id = ${id}`)
        if (resultRaw[0].length === 0) {
            return null;
        }
        let user = new User(resultRaw[0][0]);

        return user;
    }

    static async findByEmail(email) {
        let resultRaw = await db.execute(`SELECT *
                                          FROM user
                                          WHERE email = '${email}'`);

        if (resultRaw[0].length === 0) {
            return null;
        }
        let user = new User(resultRaw[0][0]);
        return user;
    }

    static async findByToken(token) {
        let resultRaw = await db.execute(`SELECT *
                                          from user
                                          where ID = (SELECT studentID FROM token WHERE token = '${token}')`);
        if (resultRaw[0].length === 0) {
            return null;
        }
        let user = new User(resultRaw[0][0]);
        return user;
    }

    deleteToken(token) {
        return db.execute(`DELETE
                           FROM token
                           where token = '${token}'`);
    }

    deleteAllTokens() {
        return db.execute(`DELETE
                           FROM token
                           WHERE studentID = ${this.id}`);
    }

    saveToken(token) {
        return db.execute(`INSERT INTO token(studentID, token)
                           VALUES (${this.id}, '${token}');`);
    }

    changePassword(newPassword) {
        return db.execute(`UPDATE user
                           SET password='${newPassword}'
                           WHERE id = ${this.id}`)
    }

    deleteMe() {
        return db.execute(`DELETE
                           FROM user
                           WHERE id = ${this.id}`);
    }

    static async isUser(id) {
        let row = await db.execute(`SELECT ID
                                    FROM user
                                    where ID = ${id}`);
        return row[0].length !== 0;
    }

    static async getUserDetailsByUserID(userid) {
        let result = await db.execute(`SELECT Name, ProfilePic, ID, Karma
                                       FROM user
                                       where ID = ${userid}`)
        return result[0][0];
    }

    static async addUser(tempUser) {
        const dt = dateTime.create();
        const formatted = dt.format('Y-m-d H:M:S');
        // console.log(formatted);

        const user = {
            id: tempUser.Email.substring(0, 7),
            batchID: tempUser.Email.substring(0, 2),
            name: tempUser.Name,
            email: tempUser.Email,
            password: tempUser.Password,
            joiningDate: formatted,
        };

        return db.execute(`INSERT INTO user(id, batchID, name,
                                            email, password, joiningDate)
                           VALUES (${user.id}, ${user.batchID},
                                   '${user.name}', '${user.email}',
                                   '${user.password}', '${user.joiningDate}')`);
    }
};
