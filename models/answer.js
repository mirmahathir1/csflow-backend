const db = require('../db');

module.exports = class Answer {
    static async getPostID(id) {
        let response = await db.execute(`select PostID
                                         from answer
                                         where ID = ${id}`);
        return response[0];
    }

    static async getAnswerDetailsByPostId(postId) {
        let response = await db.execute(`select ID                 as answerId,
                                                PostID,
                                                UserID,
                                                Description,
                                                cast(Date as char) as createdAt,
                                                UpvoteCount,
                                                DownvoteCount
                                         from answer
                                         where postID = ${postId}`);
        return response[0];
    }

    static async getAnswerDetails(id) {
        let response = await db.execute(`select ID,
                                                PostID,
                                                UserID,
                                                Description, Date,
                                             UpvoteCount, DownvoteCount
                                         from answer
                                         where ID=${id}`);
        return response[0][0];
    }

    static async deleteAnswer(id) {
        await db.execute(`delete
                          from answer
                          where ID = ${id}`);
    }

    static async getCounterofAnswer(postid) {
        let result = await db.execute(`SELECT COUNT(ID)
                                       FROM answer
                                       where PostID = ${postid};`);
        return result[0][0];
    }

    static async getAnswerFiles(postID) {
        let response = await db.execute(`select link, type
                                         from resource
                                         where answerid = ${postID}`);
        return response[0];
    }

    static async isFollow(answerId, userId) {
        const result = await db.execute(`select 1 as exist
                                         from follow
                                         where answerId = ${answerId}
                                           and userid = ${userId}`);
        return result[0][0];
    }

    static async isReport(answerId, userId) {
        const result = await db.execute(`select 1 as exist
                                         from report
                                         where answerid = ${answerId}
                                           and userid = ${userId}
                                           and commentid is null`);
        return result[0][0];
    }

    static async createAnswer(postId, userId, description, identifier) {
        await db.execute(`insert into answer (PostID, identifier,
                                              UserID, description, date,
                                              upvotecount, downvotecount)
                          values (${postId}, '${identifier}',
                                  ${userId}, '${description}',
                                  current_timestamp(), 0, 0)`);
    }

    static async getAnswerIDByIdentifier(identifier) {
        let response = await db.execute(`select id
                                         from answer
                                         where identifier = '${identifier}'`);
        return response[0][0].id;
    }

    static async addAnswerResource(answerID, link, type) {
        await db.execute(`insert into resource(answerID, Link, Type)
                          values (${answerID}, '${link}', '${type}')`);
    }

    static async isAnswerExist(answerID) {
        const result = await db.execute(`select 1 as exist
                                         from answer
                                         where id = ${answerID}`);
        return result[0][0];
    }

    static async isAnswerOwner(answerID, ownerId) {
        const result = await db.execute(`select 1 as exist
                                         from answer
                                         where id = ${answerID}
                                           and userid = ${ownerId}`);
        return result[0][0];
    }

    static async getAnswerOwnerID(answerID) {
        const result = await db.execute(`select userId
                                         from answer
                                         where id = ${answerID}`);
        return result[0][0]['userId'];
    }

    static async updateAnswer(answerId, description) {
        await db.execute(`update answer
                          set Description = '${description}'
                          where id = ${answerId}`);
    }

    static async deleteAnswerResource(answerID) {
        await db.execute(`delete
                          from resource
                          where answerID = ${answerID}`);
    }

    static async deleteAnswer(answerID) {
        await db.execute(`delete
                          from answer
                          where ID = ${answerID}`);
    }


    static async addAnswerReport(answerID, userID) {
        await db.execute(`insert into report (answerID, UserID)
                          values (${answerID}, ${userID})`);
    }

    static async deleteAnswerReport(answerID, userID) {
        await db.execute(`delete
                          from report
                          where answerID = ${answerID}
                            and userID = ${userID}
                            and commentid is null`);
    }

    static async addAnswerFollow(answerID, userID) {
        await db.execute(`insert into follow (answerID, UserID)
                          values (${answerID}, ${userID})`);
    }

    static async deleteAnswerFollow(answerID, userID) {
        await db.execute(`delete
                          from follow
                          where answerID = ${answerID}
                            and userID = ${userID}`);
    }

    static async isUpVoted(answerId, userId) {
        let result = await db.execute(`select 1 as exist
                                         from vote
                                         where type = 1
                                         and userid = ${userId}
                                         and answerId = ${answerId}`);
        return result[0][0];
    }

    static async isDownVoted(answerId, userId) {
        let result = await db.execute(`select 1 as exist
                                         from vote
                                         where type = 0
                                         and userid = ${userId}
                                         and answerId = ${answerId}`);
        return result[0][0];
    }

    static async getUpVoteCount(answerID) {
        const result = await db.execute(`select count(*) as c
                          from vote
                          where type = 1
                            and answerID = ${answerID}`);
        return result[0][0]['c'];
    }

    static async getDownVoteCount(answerID) {
        const result = await db.execute(`select count(*) as c
                          from vote
                          where type = 0
                            and answerID = ${answerID}`);
        return result[0][0]['c'];
    }

    static async addUpVote(answerID, userID) {
        await db.execute(`insert into vote (type, answerID, UserID)
                          values (1, ${answerID}, ${userID})`);
    }

    static async deleteUpVote(answerID, userID) {
        await db.execute(`delete
                          from vote
                          where type = 1
                            and answerID = ${answerID}
                            and userID = ${userID}`);
    }

    static async addDownVote(answerID, userID) {
        await db.execute(`insert into vote (type, answerID, UserID)
                          values (0, ${answerID}, ${userID})`);
    }

    static async deleteDownVote(answerID, userID) {
        await db.execute(`delete
                          from vote
                          where type = 0
                            and answerID = ${answerID}
                            and userID = ${userID}`);
    }
};
