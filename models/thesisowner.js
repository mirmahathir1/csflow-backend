const db = require('../db');
module.exports = class Thesisowner {
    static async create(thesisID,userID){
        await db.execute(`INSERT INTO thesisowner(ThesisID,UserID)
            VALUES(${thesisID},${userID})`);
    }

    static async DeleteThesisOwner(id){
        await db.execute(`DELETE FROM thesisowner WHERE ThesisID=${id}`);
    }

};