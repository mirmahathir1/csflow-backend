const db = require('../db');
module.exports = class Projectowner {
    static async create(projectID,userID){
        await db.execute(`INSERT INTO projectowner(ProjectID,UserID)
            VALUES(${projectID},${userID});`);
    }

    static async DeleteProjectOwner(id){
        await db.execute(`DELETE FROM projectowner WHERE ProjectID=${id}`);
    }

};