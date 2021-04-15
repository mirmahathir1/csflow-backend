const db = require('../db');
module.exports = class Coursedetails {
    static async findCourses(batchID) {
        let result = await db.execute(`SELECT c.CourseNo, c.Title
                                       FROM coursedetail c
                                                JOIN projectarchive p ON c.ID = p.CourseID
                                       WHERE p.BatchID = ${batchID};`);

        return result[0];
    }
    static async getCourseID(courseNumber){
        let result = await db.execute(`SELECT ID FROM coursedetail
            WHERE CourseNo LIKE '${courseNumber}';`);
        return result[0];
    }
};