const db = require('../db');
module.exports = class Report{
    static async getReportedPostID(){
        let response = await db.execute(`select PostID from report where PostID is not null `);
        return response[0];
    }
    static async deleteReport(id){
        await db.execute(`delete from report where PostID=${id}`);
    }
    static async isReportedPost(postid){
        let response = await db.execute(`select ID from report where PostID=${postid}`);
        return response[0];
    }
    static async getReportedAnswerID(){
        let response = await db.execute(`select AnswerID from report where AnswerID is not null `);
        return response[0];
    }
    static async deleteReportofAnswer(id){
        await db.execute(`delete from report where AnswerID=${id}`);
    }
    static async isReportedAnswer(id){
        let response = await db.execute(`select ID from report where AnswerID=${id}`);
        return response[0];
    }
    static async getReportedCommentID(){
        let response = await db.execute(`select CommentID from report where CommentID is not null `);
        return response[0];
    }
    static async deleteReportofComment(id){
        await db.execute(`delete from report where CommentID=${id}`);
    }
    static async isReportedComment(id){
        let response = await db.execute(`select ID from report where CommentID=${id}`);
        return response[0];
    }

};