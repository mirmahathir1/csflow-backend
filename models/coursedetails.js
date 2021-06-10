const db = require('../db');
module.exports = class Coursedetails {
    static async findCourses(batchID) {
        let result = await db.execute(`SELECT DISTINCT c.CourseNo, c.Title
                                       FROM coursedetail c
                                                JOIN projectarchive p ON c.ID = p.CourseID
                                       WHERE p.BatchID = ${batchID};`);

        return result[0];
    }
    static async findCoursesofProjects() {
        let result = await db.execute(`SELECT DISTINCT c.CourseNo as courseId, c.Title as courseTitle
                                       FROM coursedetail c
                                                JOIN projectarchive p ON c.ID = p.CourseID;`);

        return result[0];
    }
    static async getCourseID(courseNumber){
        let result = await db.execute(`SELECT ID,CourseTagID,BatchID FROM coursedetail
            WHERE CourseNo LIKE '${courseNumber}';`);
        return result[0];
    }
    static async findCourseTitle(courseID) {
        let result = await db.execute(`SELECT c.CourseNo, c.Title
                                       FROM coursedetail c
                                           WHERE c.ID=${courseID};`);

        return result[0];
    }
    static async findBatchID(tagID){
        let result = await db.execute(`SELECT BatchID from coursedetail
                    where CourseTagID=${tagID}`);
        return result[0];
    }
    static async findCourseNumber(tagID){
        let result = await db.execute(`SELECT CourseNo from coursedetail
                    where CourseTagID=${tagID}`);
        return result[0][0];
    }
    static async updateCourseNumber(id,name){
        await db.execute(`update coursedetail set CourseNo='${name}'
                        where CourseTagID=${id}`);
    }
    static async fetchAllCourse(){
        let result = await db.execute(`SELECT DISTINCT CourseNo as courseId,Title as title,Level as level,Term as term  from coursedetail`);
        return result[0];
    }
    static async deleteCourse(courseNumber){
        await db.execute(`delete from coursedetail 
                        WHERE CourseNo LIKE '${courseNumber}'`);
    }
    static async createCourse(courseId,title,level,term,batchId,tagId){
        await db.execute(`insert into coursedetail(CourseNo,Title,Level,Term,CourseTagID,BatchID) 
                    values('${courseId}','${title}',${level},${term},${tagId},${batchId})`);
    }
    static async updateCourse(courseId,level,term,title){
        await db.execute(`update coursedetail set Title='${title}',Level=${level},Term=${term}
                        where CourseNo LIKE '${courseId}'`);
    }
};