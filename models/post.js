const db = require('../db');

module.exports = class Post {

    static async getPostDetails(postid) {
        let response = await db.execute(`select ID,
                                                userID,
                                                type,
                                                title,
                                                starredanswerid as acceptedAnswer,
                                                cast(date as char) as date, level,
                                             term, courseName as course,
                                             book, topic,
                                             upvoteCount, downvoteCount
                                         from post
                                         where ID=${postid}`);
        return response[0][0];
    }

    static async getCourseNumberofPost(postid) {
        let response = await db.execute(`select courseName
                                         from post
                                         where ID = ${postid}`);
        return response[0];
    }

    static async getPostTags(postid) {
        let response = await db.execute(`select Name
                                         from posttag
                                         where PostID = ${postid}`);
        return response[0];
    }

    static async deletePost(postid) {
        await db.execute(`delete
                          from post
                          where ID = ${postid}`);
    }

    static async createPost(userid, type, title, description,
                            upvoteCount, downvoteCount,
                            level, term, courseName,
                            book, topic, identifier) {
        await db.execute(`insert into post(UserID, Type, Title,
                                           Description, Date, UpvoteCount, DownvoteCount,
                                           level, term, courseName, book, topic, identifier)
                          values (${userid}, '${type}', '${title}',
                                  '${description}', current_timestamp(), ${upvoteCount},
                                  ${downvoteCount}, ${level}, ${term},
                                  '${courseName}', '${book}', '${topic}', '${identifier}')`);
    }

    static async getPostIDByIdentifier(identifier) {
        let response = await db.execute(`select id
                                         from post
                                         where identifier = '${identifier}'`);
        return response[0][0].id;
    }

    static async addPostTag(postID, tag) {
        await db.execute(`insert into posttag(PostID, Name)
                          values (${postID}, '${tag}')`);
    }

    static async addPostResource(postID, link, type) {
        await db.execute(`insert into resource(PostID, Link, Type)
                          values (${postID}, '${link}', '${type}')`);
    }

    static async getPostFiles(postID) {
        let response = await db.execute(`select link, type
                                         from resource
                                         where postid = ${postID}
                                           and answerid is null`);
        return response[0];
    }

    static async isFollow(postId, userId) {
        const result = await db.execute(`select 1 as exist
                                         from follow
                                         where postid = ${postId}
                                           and userid = ${userId}`);
        return result[0][0];
    }

    static async isReport(postId, userId) {
        const result = await db.execute(`select 1 as exist
                                         from report
                                         where postid = ${postId}
                                           and userid = ${userId}
                                           and answerId is null 
                                           and commentid is null`);
        return result[0][0];
    }
};