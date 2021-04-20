const db = require('../db');
const User = require('../models/user');

module.exports = class Projectarchive {
    static async findProjectList(batchID, courseID) {
        let result = await db.execute(`SELECT p.ID, p.Title
                                       FROM coursedetail c
                                                JOIN projectarchive p ON c.ID = p.CourseID
                                       WHERE p.BatchID = ${batchID}
                                         AND p.CourseID = ${courseID};`);

        return result[0];
    }

    static async findUsers(projectID) {
        let result = await db.execute(`SELECT o.UserID
                                       FROM projectarchive t
                                                JOIN projectowner o ON t.ID = o.ProjectID
                                       WHERE t.ID = ${projectID};`);
        return result[0];
    }

    static async update(id, courseID, batchID, title, description, videolink, codelink) {
        await db.execute(`UPDATE projectarchive
                          SET CourseID=${courseID},
                              BatchID=${batchID},
                              Title='${title}',
                              VideoLink='${videolink}',
                              Description='${description}',
                              CodeLink='${codelink}'
                          WHERE ID = ${id};`);
    }

    static async create(id, courseID, batchID, title, description, videolink, codelink) {
        await db.execute(`INSERT INTO projectarchive(ID, CourseID, BatchID, Title, Description, VideoLink, CodeLink)
                          VALUES (${id}, ${courseID}, ${batchID}, '${title}', '${description}', '${videolink}',
                                  '${codelink}');`);
    }

    static async userAuthorization(projectID, userID) {
        let result = await this.findUsers(projectID);
        let c = result.length;
        let i;
        for (i = 0; i < c; i++) {
            if (result[i].UserID === userID) {
                return 1;
            }
        }
        return null;
    }

    static async findProject(id) {
        let result = await db.execute(`SELECT ID
                                       FROM projectarchive
                                       WHERE ID = ${id}`);
        return result[0];

    }

    static async DeleteProject(id) {
        await db.execute(`DELETE
                          FROM projectarchive
                          WHERE ID = ${id}`);
    }

    static async findCommentsByProjectID(id) {
        let result = await db.execute(`SELECT u.ID AS UID, u.Name, c.ID AS CID, c.Description, c.Date
                                       from (projectarchive t join comment c on t.ID = c.ProjectID)
                                                JOIN user u on u.ID = c.UserID
                                       where c.ProjectID = ${id};`);
        return result[0];
    }

    static async findDetailsByProjectID(id) {
        let result = await db.execute(`SELECT o.UserID,t.BatchID, t.Title, t.Description, t.VideoLink, t.CodeLink
                                       FROM projectarchive t
                                                JOIN projectowner o ON t.ID = o.ProjectID
                                       WHERE t.id = ${id};`)
        return result[0];
    }

    static async getMaxID() {
        let result = await db.execute(`SELECT MAX(ID)
                                       FROM projectarchive;`);
        return result[0][0];
    }
};