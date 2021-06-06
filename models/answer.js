const db = require('../db');

module.exports = class Answer {
    static async getPostID(id) {
        let response = await db.execute(`select PostID
                                         from answer
                                         where ID = ${id}`);
        return response[0];
    }

    static async getAnswerDetailsByPostId(postId) {
        let response = await db.execute(`select ID as answerId,
                                                PostID,
                                                UserID,
                                                Description,
                                                cast(Date as char) as createdAt,
                                             UpvoteCount, DownvoteCount
                                         from answer
                                         where postID=${postId}`);
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

};