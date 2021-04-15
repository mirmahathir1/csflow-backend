const db = require('../db');
module.exports = class Projectowner {
    static async create(projectID,userID){
        await db.execute(`INSERT INTO thesisowner(ProjectID,UserID)
            VALUES(${projectID},${userID})`);
    }

};