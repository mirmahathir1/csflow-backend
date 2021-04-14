const db = require('../db');
module.exports = class Batch{
    static async getBatches(){
        let response = await db.execute(`SELECT ID FROM batch;`);
        return response[0];
    }
};