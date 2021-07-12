const db = require('../db');
module.exports = class Comment {
    static async getPostID(id) {
        let response = await db.execute(`select PostID
                                         from comment
                                         where ID = ${id}`);
        return response[0];
    }

    static async getAnswerID(id) {
        let response = await db.execute(`select AnswerID
                                         from comment
                                         where ID = ${id}`);
        return response[0];
    }

    static async getCommentDetails(id) {
        let response = await db.execute(`select ID,
                                                PostID,
                                                AnswerID,
                                                UserID,
                                                Description, Date
                                         from comment
                                         where ID=${id}`);
        return response[0][0];
    }

    static async getCommentOfAPost(postId) {
        let response = await db.execute(`select id                 as commentId,
                                                userid             as ownerID,
                                                description,
                                                cast(Date as char) as createdAt
                                         from comment
                                         where postid = ${postId}
                                           and answerid is null`);
        return response[0];
    }

    static async getCommentOfAnAnswer(answerId) {
        let response = await db.execute(`select id                 as commentId,
                                                userid             as ownerID,
                                                description,
                                                cast(Date as char) as createdAt
                                         from comment
                                         where answerId = ${answerId}`);
        return response[0];
    }

    static async deleteComment(id) {
        await db.execute(`delete
                          from comment
                          where ID = ${id}`);
    }

    static async getCounterofComment(id) {
        let result = await db.execute(`SELECT COUNT(ID)
                                       FROM comment
                                       where AnswerID = ${id};`);
        return result[0][0];
    }

    static async isReport(commentId, userId) {
        const result = await db.execute(`select 1 as exist
                                         from report
                                         where commentId = ${commentId}
                                           and userid = ${userId}`);
        return result[0][0];
    }

    static async createPostComment(postId, userId, description, identifier) {
        await db.execute(`insert into comment (PostID, UserID,
                                               description, date, identifier)
                          values (${postId}, ${userId},
                                  '${description}', current_timestamp(),
                                  '${identifier}')`);
    }

    static async createAnswerComment(answerId, userId, description, identifier) {
        await db.execute(`insert into comment (answerId, UserID,
                                               description, date, identifier)
                          values (${answerId}, ${userId},
                                  '${description}', current_timestamp(),
                                  '${identifier}')`);
    }

    static async getCommentIDByIdentifier(identifier) {
        let response = await db.execute(`select id
                                         from comment
                                         where identifier = '${identifier}'`);
        return response[0][0].id;
    }

    static async isReport(commentId, userId) {
        const result = await db.execute(`select 1 as exist
                                         from report
                                         where commentid = ${commentId}
                                           and userid = ${userId}`);
        return result[0][0];
    }

    static async isCommentExist(commentID) {
        const result = await db.execute(`select 1 as exist
                                         from comment
                                         where id = ${commentID}`);
        return result[0][0];
    }

    static async isCommentOwner(commentID, ownerId) {
        const result = await db.execute(`select 1 as exist
                                         from comment
                                         where id = ${commentID}
                                           and userid = ${ownerId}`);
        return result[0][0];
    }

    static async updateComment(commentId, description) {
        await db.execute(`update comment
                          set Description = '${description}'
                          where id = ${commentId}`);
    }

    static async deleteComment(commentID) {
        await db.execute(`delete
                          from comment
                          where ID = ${commentID}`);
    }


    static async addCommentReport(commentID, userID) {
        await db.execute(`insert into report (commentID, UserID)
                          values (${commentID}, ${userID})`);
    }

    static async deleteCommentReport(commentID, userID) {
        await db.execute(`delete
                          from report
                          where commentID = ${commentID}
                            and userID = ${userID}`);
    }

};
