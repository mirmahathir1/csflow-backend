const db = require('../db');
module.exports = class Projectowner {
    static async create(projectID,userID){
        await db.execute(`INSERT INTO projectowner(ProjectID,UserID)
            VALUES(${projectID},${userID});`);
    }

};