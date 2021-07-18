const db = require('../db');
module.exports = class Projectowner {
    static async create(projectID,userID){
        await db.execute(`INSERT INTO projectowner(ProjectID,UserID)
            VALUES(${projectID},${userID});`);
    }

    static async DeleteProjectOwner(id){
        await db.execute(`DELETE FROM projectowner WHERE ProjectID=${id}`);
    }
    static async getOwners(id){
        let result = await db.execute(`select UserID from projectowner where ProjectID=${id}`);
        return result[0];
    }
    static async DeleteProjectOwners(id,userid){
        await db.execute(`DELETE FROM projectowner WHERE ProjectID=${id} and UserID=${userid}`);
    }

};