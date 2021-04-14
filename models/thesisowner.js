const db = require('../db');
module.exports = class Thesisowner {
    constructor(thesisowner) {
        this.id = thesisowner.ID;
        this.thesisID = thesisowner.ThesisID;
        this.userID = thesisowner.UserID;
    }
    static async create(thesisID,userID){
        await db.execute(`INSERT INTO thesisowner(ThesisID,UserID)
            VALUES(${thesisID},${userID})`);
    }

};