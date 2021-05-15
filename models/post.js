const db = require('../db');
module.exports = class Post{
    static async getPostDetails(postid){
        let response = await db.execute(`select ID,UserID,Type,Title,Date,level,term,courseName,UpvoteCount,DownvoteCount
                            from post where ID=${postid}`);
        return response[0][0];
    }
    static async getCourseNumberofPost(postid){
        let response = await db.execute(`select courseName from post where ID=${postid}`);
        return response[0];
    }
    static async getPostTags(postid){
        let response = await db.execute(`select Name from posttag where PostID=${postid}`);
        return response[0];
    }
};