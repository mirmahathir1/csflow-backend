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
        let response = await db.execute(`select ID, PostID, AnswerID, UserID, Description, Date
                                         from comment
                                         where ID=${id}`);
        return response[0][0];
    }

    static async getCommentOfAPost(postId) {
        let response = await db.execute(`select userid as ownerID, description,
                                                cast(Date as char) as createdAt
                                                from comment
                                                where postid = ${postId}
                                                and answerid is null`);
        return response[0];
    }

    static async deleteComment(id) {
        await db.execute(`delete
                          from comment
                          where ID = ${id}`);
    }
};