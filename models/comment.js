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
        let response = await db.execute(`select id as commentId,
                                                userid as ownerID,
                                                description,
                                                cast(Date as char) as createdAt
                                         from comment
                                         where postid = ${postId}
                                           and answerid is null`);
        return response[0];
    }

    static async getCommentOfAnAnswer(answerId) {
        let response = await db.execute(`select id as commentId,
                                                userid as ownerID,
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
};