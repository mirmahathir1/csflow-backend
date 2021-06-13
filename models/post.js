const db = require('../db');

module.exports = class Post {

    static async getPostDetails(postid) {
        let response = await db.execute(`select ID,
                                                userID,
                                                type,
                                                title,
                                                starredanswerid    as acceptedAnswer,
                                                cast(date as char) as createdAt,
                                                level,
                                                term,
                                                courseName         as course,
                                                book,
                                                topic,
                                                upvoteCount,
                                                downvoteCount
                                         from post
                                         where ID = ${postid}`);
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

    static async deletePost(postID) {
        await db.execute(`delete
                          from post
                          where ID = ${postID}`);
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

    static async updatePost(postid, type, title, description,
                            level, term, courseName,
                            book, topic) {
        await db.execute(`update post
                          set Type        = '${type}',
                              Title       = '${title}',
                              Description = '${description}',
                              level       = ${level},
                              term        = ${term},
                              courseName  = '${courseName}',
                              book        = '${book}',
                              topic       = '${topic}'
                          where id = ${postid}`);
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

    static async deletePostTag(postID) {
        await db.execute(`delete
                          from posttag
                          where postid = ${postID}`);
    }

    static async addPostReport(postID, userID) {
        await db.execute(`insert into report (PostID, UserID)
                          values (${postID}, ${userID})`);
    }

    static async deletePostReport(postID, userID) {
        await db.execute(`delete
                          from report
                          where postid = ${postID}
                            and userID = ${userID}
                            and answerid is null
                            and commentid is null`);
    }

    static async addPostFollow(postID, userID) {
        await db.execute(`insert into follow (PostID, UserID)
                          values (${postID}, ${userID})`);
    }

    static async deletePostFollow(postID, userID) {
        await db.execute(`delete
                          from follow
                          where postid = ${postID}
                            and userID = ${userID}
                            and answerid is null`);
    }

    static async addPostResource(postID, link, type) {
        await db.execute(`insert into resource(PostID, Link, Type)
                          values (${postID}, '${link}', '${type}')`);
    }

    static async deletePostResource(postID) {
        await db.execute(`delete
                          from resource
                          where PostID = ${postID}
                            and answerId is null`);
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
                                           and answerId is null
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

    static async isPostExist(postId) {
        const result = await db.execute(`select 1 as exist
                                         from post
                                         where id = ${postId}`);
        return result[0][0];
    }

    static async isPostOwner(postId, ownerId) {
        const result = await db.execute(`select 1 as exist
                                         from post
                                         where id = ${postId}
                                           and userid = ${ownerId}`);
        return result[0][0];
    }

    static async isQuestionTypePost(postID) {
        const result = await db.execute(`select 1 as exist
                                         from post
                                         where id = ${postID}
                                           and lower(type) = 'question'`);
        return result[0][0];
    }

    static async searchPost(condition, condition2) {
        let response = await db.execute(`select id
                                         from post
                                         where ${condition}
                                         union
                                         select postid as id
                                         from posttag
                                         where ${condition2}`);
        return response[0];
    }

    static async topPost() {
        let response = await db.execute(`select id
                                         from post
                                         order by upvotecount desc`);
        return response[0];
    }

    static async relevantPost(level, term) {
        let response = await db.execute(`select id
                                         from post
                                         where level = ${level}
                                           and term = ${term}
                                         order by upvotecount desc`);
        return response[0];
    }

    static async unansweredPost() {
        let response = await db.execute(`select id
                                         from post
                                         where id in (
                                             select distinct postid
                                             from answer
                                         )
                                         order by upvotecount desc`);
        return response[0];
    }

    static async userPost(userId) {
        let response = await db.execute(`select id
                                         from post
                                         where userid = ${userId}
                                         order by upvotecount desc`);
        return response[0];
    }
};