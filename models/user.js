const jwt = require('jsonwebtoken');

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
        // this.karma = user.Karma;
        this.isAdmin = user.isAdmin;
    }

    static async getLastID() {
        const resultRow = await db.execute(`SELECT max(id) AS id
                                            FROM user`);
        return resultRow[0][0]['id'];
    }

    static fetchAll() {
        return db.execute('SELECT * FROM user;');
    }

    static async deleteUser(id) {
        return db.execute(`delete
                           from user
                           where ID = ${id}`);
    }

    static async findById(id) {
        let resultRaw = await db.execute(`SELECT *
                                          FROM user
                                          WHERE id = ${id}`);
        if (resultRaw[0].length === 0)
            return null;
        return new User(resultRaw[0][0]);
    }

    static async findByEmail(email) {
        let resultRaw = await db.execute(`SELECT *
                                          FROM user
                                          WHERE email = '${email}'`);

        if (resultRaw[0].length === 0) {
            return null;
        }
        return new User(resultRaw[0][0]);
    }

    static async findByToken(token) {
        let resultRaw = await db.execute(`SELECT *
                                          from user
                                          where ID = (SELECT studentID FROM token WHERE token = '${token}')`);
        if (resultRaw[0].length === 0) {
            return null;
        }
        return new User(resultRaw[0][0]);
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

    saveProfilePicLink(link) {
        return db.execute(`UPDATE user
                           SET profilepic='${link}'
                           WHERE id = ${this.id}`)
    }

    updateName(name) {
        return db.execute(`UPDATE user
                           SET name='${name}'
                           WHERE id = ${this.id}`)
    }

    async getUpVoteCount() {
        const resultRow = await db.execute(`SELECT COUNT(*) AS c
                                            FROM vote
                                            WHERE userid = ${this.id}
                                              AND type = 1`);
        if (resultRow[0].length === 0)
            return 0;
        // console.log(resultRow[0][0])
        return resultRow[0][0]['c'];
    }

    async getDownVoteCount() {
        const resultRow = await db.execute(`SELECT COUNT(*) AS c
                                            FROM vote
                                            WHERE userid = ${this.id}
                                              AND type = 0`);
        if (resultRow[0].length === 0)
            return 0;
        return resultRow[0][0]['c'];
    }

    async getTotalDiscussionCount() {
        const resultRow = await db.execute(`SELECT COUNT(*) AS c
                                            FROM post
                                            WHERE userid = ${this.id}
                                              AND type like 'Discussion'`);
        if (resultRow[0].length === 0)
            return 0;
        return resultRow[0][0]['c'];
    }

    async getTotalAnswerCount() {
        const resultRow = await db.execute(`SELECT COUNT(*) AS c
                                            FROM answer
                                            WHERE userid = ${this.id}`);
        if (resultRow[0].length === 0)
            return 0;
        return resultRow[0][0]['c'];
    }

    async getTotalQuestionCount() {
        const resultRow = await db.execute(`SELECT COUNT(*) AS c
                                            FROM post
                                            WHERE userid = ${this.id}
                                              AND type like 'Question'`);
        if (resultRow[0].length === 0)
            return 0;
        return resultRow[0][0]['c'];
    }

    async getUserStatistics() {
        const upvoteCount = await this.getUpVoteCount();
        const downvoteCount = await this.getDownVoteCount();
        const totalDiscussion = await this.getTotalDiscussionCount();
        const totalQuestion = await this.getTotalQuestionCount();
        const totalAnswer = await this.getTotalAnswerCount();

        return {
            upvoteCount,
            downvoteCount,
            totalDiscussion,
            totalQuestion,
            totalAnswer,
        }
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

    static async getUserDetailsByBatchID(batchid) {
        let result = await db.execute(`SELECT Name as name, ProfilePic as image, ID as studentId, Karma as karma
                                       FROM user
                                       where BatchID = ${batchid}`)
        return result[0];
    }

    static async isPrivilegedUser(userid) {
        let result = await db.execute(`SELECT IsCR as CR
                                       FROM user
                                       WHERE ID = ${userid}`)

        return result[0][0];
    }

    static async isAdmin(userid) {
        let result = await db.execute(`SELECT isAdmin as ADMIN
                                       FROM user
                                       WHERE ID = ${userid}`)

        return result[0][0];
    }

    static async findLevelTerm(userid) {
        let response = await db.execute(`select Level, Term
                                         from user
                                         where ID = ${userid}`);
        return response[0][0];
    }

    static async isValidLevelTerm(level, term) {
        let response = await db.execute(`select ID
                                         from user
                                         where Level = ${level}
                                           AND Term = ${term};`);
        return response[0];
    }

    static async updateLevelTerm(userid, level, term) {
        await db.execute(`update user
                          set Level = ${level},
                              Term  = ${term}
                          where ID = ${userid};`);

    }

    static async updateCR(userid, iscr) {
        await db.execute(`update user
                          set IsCR = ${iscr}
                          where ID = ${userid};`);

    }

    static async addUser(user) {
        return db.execute(`INSERT INTO user(id, batchID, name,
                                            email, password, joiningDate)
                           VALUES (${user.id}, ${user.batchID},
                                   '${user.name}', '${user.email}',
                                   '${user.password}', '${user.joiningDate}')`);
    }

    static async getTopUser() {
        let response = await db.execute(`select userid as id, count(*) as c
                                         from vote
                                         where type = 1
                                         group by userid
                                         order by c desc`);
        return response[0];
    }
};
