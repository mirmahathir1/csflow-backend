const db = require('../db');
module.exports = class Comment{
    static async getPostID(id){
        let response = await db.execute(`select PostID from comment where ID=${id}`);
        return response[0];
    }
    static async getAnswerID(id){
        let response = await db.execute(`select AnswerID from comment where ID=${id}`);
        return response[0];
    }
    static async getCommentDetails(id){
        let response = await db.execute(`select ID,PostID,AnswerID,UserID,Description,Date
                            from comment where ID=${id}`);
        return response[0][0];
    }
};