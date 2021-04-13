const db = require('../db');

module.exports = class Thesisarchive {
    constructor(thesisarchive) {
        this.id = thesisarchive.ID;
        this.batchID = thesisarchive.BatchID;
        this.title = thesisarchive.Title;
        this.authors = thesisarchive.Authors;
    }
    static async findByBatchID(batchID){
        let row = await db.execute(`SELECT ID,Title FROM thesisarchive WHERE batchID = ${batchID}`);
        let Array = [];

        let count;
        count = row[0].length;
        if(row[0].length===0){
            return null;
        }
        let i;
        for(i=0;i<count;i++){
            Array.push(row[0][i]);
        }

        return Array;
    }
};