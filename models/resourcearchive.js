const db = require("../db");
const Batch = require('../models/batch');

module.exports = class Resourcearchive {
    static async getResourcesByBatchID(batch_no){
       let result = await db.execute(`SELECT Level,Term,Link FROM resourcearchive WHERE BatchID = ${batch_no};`);
       return result[0];
    }
};