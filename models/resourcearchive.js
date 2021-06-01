const db = require("../db");
const Batch = require('../models/batch');

module.exports = class Resourcearchive {
    static async getResourcesByBatchID(batch_no){
       let result = await db.execute(`SELECT Level,Term,Link FROM resourcearchive WHERE BatchID = ${batch_no};`);
       return result[0];
    }
    static async getResourcesByLevelTerm(level,term,batchid){
        let result = await db.execute(`SELECT Link FROM resourcearchive WHERE Level = ${level} AND Term = ${term} AND BatchID=${batchid};`);
        return result[0];
    }
    static async createDriveLink(batchid,level,term,link){
        await db.execute(`insert into resourcearchive(BatchID,Level,Term,Link) 
                        values(${batchid},${level},${term},'${link}') ;`);
    }
    static async updateDriveLink(level,term,link){
        await db.execute(`update resourcearchive set Link='${link}' WHERE Level = ${level} AND Term = ${term};`);
    }
    static async deleteDriveLink(level,term){
        await db.execute(`delete from resourcearchive WHERE Level = ${level} AND Term = ${term}`);
    }
};