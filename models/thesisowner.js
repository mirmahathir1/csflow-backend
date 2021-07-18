const db = require('../db');
module.exports = class Thesisowner {
    static async create(thesisID,userID){
        await db.execute(`INSERT INTO thesisowner(ThesisID,UserID)
            VALUES(${thesisID},${userID})`);
    }

    static async DeleteThesisOwner(id){
        await db.execute(`DELETE FROM thesisowner WHERE ThesisID=${id}`);
    }
    static async getOwners(id){
        let result = await db.execute(`select UserID from thesisowner where ThesisID=${id}`);
        return result[0];
    }
    static async DeleteThesisOwners(id,userid){
        await db.execute(`DELETE FROM thesisowner WHERE ThesisID=${id} and UserID=${userid}`);
    }

};