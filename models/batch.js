const db = require('../db');
module.exports = class Batch{
    static async getBatches(){
        let response = await db.execute(`SELECT ID FROM batch order by ID asc;`);
        return response[0];
    }
};