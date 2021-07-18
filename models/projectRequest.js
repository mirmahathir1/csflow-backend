const db = require('../db');

module.exports = class projectRequest {
    static async getRequestedUsers(projectId) {
        let result = await db.execute(`SELECT UserID
                                       FROM projectRequest
                                        WHERE ProjectID=${projectId};`);

        return result[0];

    }

    static async addRequest(projectId,requesterId,userId) {
        return db.execute(`INSERT INTO projectRequest(ProjectID,RequesterID,UserID)
                           VALUES (${projectId}, ${requesterId},${userId})`);
    }
    static async deleteRequest(id,userid){
        await db.execute(`DELETE FROM projectRequest WHERE ProjectID=${id} and UserID=${userid}`);
    }
    static async deleteProjectID(id){
        await db.execute(`DELETE FROM projectRequest WHERE ProjectID=${id}`);
    }
    static async getRequestedProject() {
        let result = await db.execute(`SELECT DISTINCT ProjectID
                                       FROM projectRequest;`);

        return result[0];

    }

};
