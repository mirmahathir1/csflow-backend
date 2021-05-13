const db = require('../db');
module.exports = class Tag{
    static async getCourseTags(batchid){
        let response = await db.execute(`select p.ID,Type,Name from predefinedtag p join
                    coursedetail c on p.ID = c.CourseTagID where c.BatchID=${batchid}`);
        return response[0];
    }

    static async getRelatedTags(courseTagID){
        let response = await db.execute(`select p.ID,Type,Name from predefinedtag p join relatedtag r on p.ID = r.TagID
                    where r.CourseTagID=${courseTagID}`);

        return response[0];
    }
     static async getRequestedTags(id){
        let response = await db.execute(`select CourseTagID,Type,Name from requestedtag where
                            ID=${id}` );
        return response[0];
     }
     static async addTag(id,type,name){
        await db.execute(`insert into predefinedtag(ID,Type,Name) values (${id},'${type}','${name}')`);
     }
     static async addRelatedTag(courseTagid,tagid){
        await db.execute(`insert into relatedtag(CourseTagID,TagID) values (${courseTagid},${tagid})`);
     }
     static async deleteTag(tagid){
        await db.execute(`delete from predefinedtag where ID=${tagid}`);
     }
     static async findTagbyID(tagid){
        let response = await db.execute(`select ID from predefinedtag where ID=${tagid}`);
        return response[0];
     }
     static async findCourseTag(tagid){
         let response = await db.execute(`select CourseTagID from relatedtag where TagID=${tagid}`);
         return response[0];
     }
     static async updateTags(id,type,name){
        await db.execute(`update predefinedtag set Type='${type}',NAME ='${name}'
                        where ID=${id}`);
     }
    static async getMaxID(){
        let result = await db.execute(`SELECT MAX(ID) FROM predefinedtag;`);
        return result[0][0];
    }
};