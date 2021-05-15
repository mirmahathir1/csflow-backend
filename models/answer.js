const db = require('../db');
module.exports = class Answer{
    static async getPostID(id){
        let response = await db.execute(`select PostID from answer where ID=${id}`);
        return response[0];
    }
    static async getAnswerDetails(id){
        let response = await db.execute(`select ID,PostID,UserID,Description,Date,UpvoteCount,DownvoteCount
                            from answer where ID=${id}`);
        return response[0][0];
    }
};