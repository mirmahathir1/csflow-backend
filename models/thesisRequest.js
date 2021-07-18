const db = require('../db');

module.exports = class thesisRequest {
    static async getRequestedUsers(thesisId) {
        let result = await db.execute(`SELECT UserID
                                       FROM thesisRequest
                                        WHERE ThesisID=${thesisId};`);

        return result[0];

    }

    static async addRequest(thesisId,requesterId,userId) {
        return db.execute(`INSERT INTO thesisRequest(ThesisID,RequesterID,UserID)
                           VALUES (${thesisId}, ${requesterId},${userId})`);
    }
    static async deleteRequest(id,userid){
        await db.execute(`DELETE FROM thesisRequest WHERE ThesisID=${id} and UserID=${userid}`);
    }
    static async deleteThesisID(id){
        await db.execute(`DELETE FROM thesisRequest WHERE ThesisID=${id}`);
    }
    static async getRequestedThesis() {
        let result = await db.execute(`SELECT DISTINCT ThesisID
                                       FROM thesisRequest;`);

        return result[0];

    }

};
