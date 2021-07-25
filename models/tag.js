const db = require('../db');

module.exports = class Tag {
    static async getCourseTags(batchid) {
        let response = await db.execute(`select p.ID, Type, Name
                                         from predefinedtag p
                                                  join
                                              coursedetail c on p.ID = c.CourseTagID
                                         where c.BatchID = ${batchid}`);
        return response[0];
    }

    static async getRelatedTags(courseTagID) {
        let response = await db.execute(`select p.ID, Type, Name
                                         from predefinedtag p
                                                  join relatedtag r on p.ID = r.TagID
                                         where r.CourseTagID = ${courseTagID}`);

        return response[0];
    }

    static async getRequestedTags(id) {
        let response = await db.execute(`select CourseTagID, Type, Name
                                         from requestedtag
                                         where ID = ${id}`);
        return response[0];
    }

    static async addTag(id, type, name) {
        await db.execute(`insert into predefinedtag(ID, Type, Name)
                          values (${id}, '${type}', '${name}')`);
    }

    static async addRelatedTag(courseTagid, tagid) {
        await db.execute(`insert into relatedtag(CourseTagID, TagID)
                          values (${courseTagid}, ${tagid})`);
    }

    static async deleteTag(tagid) {
        await db.execute(`delete
                          from predefinedtag
                          where ID = ${tagid}`);
    }

    static async findTagbyID(tagid) {
        let response = await db.execute(`select ID
                                         from predefinedtag
                                         where ID = ${tagid}`);
        return response[0];
    }

    static async findCourseTag(tagid) {
        let response = await db.execute(`select CourseTagID
                                         from relatedtag
                                         where TagID = ${tagid}`);
        return response[0];
    }

    static async updateTags(id, type, name) {
        await db.execute(`update predefinedtag
                          set Type='${type}',
                              NAME ='${name}'
                          where ID = ${id}`);
    }

    static async findRequestedTags() {
        let response = await db.execute(`select ID, RequesterID, CourseTagID, Type, Name
                                         from requestedtag`);
        return response[0];
    }

    static async findRequestedTagbyID(tagid) {
        let response = await db.execute(`select ID
                                         from requestedtag
                                         where ID = ${tagid}`);
        return response[0];
    }

    static async deleteRequestedTag(id) {
        await db.execute(`delete
                          from requestedtag
                          where ID = ${id}`);
    }

    static async updateRequestedTag(id, type, name) {
        await db.execute(`update requestedtag
                          set Type='${type}',
                              NAME ='${name}'
                          where ID = ${id}`);
    }

    static async updateRelatedTags(tagid, coursetagid) {
        await db.execute(`update relatedtag
                          set CourseTagID=${coursetagid}
                          where TagID = ${tagid}`);
    }

    static async getTagType(name) {
        let response = await db.execute(`select Type
                                         from predefinedtag
                                         where Name LIKE "${name}"`);
        return response[0];
    }

    static async getMaxID() {
        let result = await db.execute(`SELECT MAX(ID)
                                       FROM predefinedtag;`);
        return result[0][0];
    }


    static async findCourseIDByName(name) {
        const result = await db.execute(`select id
                                         from predefinedtag
                                         where Name = '${name}'
                                           and Type = 'course'`);
        return result[0][0];
    }

    static async isTagExist(name, type) {
        const result = await db.execute(`select 1
                                         from predefinedtag
                                         where Name = '${name}'
                                           and Type = '${type}'`);
        return result[0][0];
    }

    static async isRequestedTagExist(name, type) {
        const result = await db.execute(`select 1
                                         from requestedtag
                                         where Name = '${name}'
                                           and Type = '${type}'`);
        return result[0][0];
    }

    static async addRequestedTag(requesterID, courseTagID, type, name) {
        await db.execute(`insert into requestedtag(RequesterID, CourseTagID, Type, Name)
                          values (${requesterID}, ${courseTagID}, '${type}', '${name}')`);
    }

    static async getAllCourseTag() {
        const result = await db.execute(`
            select DISTINCT CourseNo as courseId, Title as name,Level,Term
            from coursedetail
            where CourseTagID = any (
                select ID
                from predefinedtag
                where Type = 'course'
            )
        `);

        return result[0];
    }

    static async getBooksByCourse(courseID) {
        const result = await db.execute(`select Name
                                         from predefinedtag
                                         where Type = 'book'
                                           and id in
                                               (select tagid
                                                from relatedtag
                                                where coursetagID = ${courseID})`);
        return result[0];
    }

    static async getTopicsByCourse(courseID) {
        const result = await db.execute(`select Name
                                         from predefinedtag
                                         where Type = 'topic'
                                           and id in
                                               (select tagid
                                                from relatedtag
                                                where coursetagID = ${courseID})`);
        return result[0];
    }

    static async isExist(tag, tagType) {
        const result = await db.execute(`select 1 as exist
                                         from predefinedtag
                                         where Type = '${tagType}'
                                           and name = '${tag}'`);
        return result[0][0];
    }

};
