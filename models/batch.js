const db = require('../db');
module.exports = class Batch {
    static async getBatches() {
        let response = await db.execute(`SELECT ID
                                         FROM batch
                                         order by ID asc;`);
        return response[0];
    }

    static async getLevelTerm(batch) {
        let response = await db.execute(`SELECT level, term
                                         FROM batch
                                         WHERE name like '%${batch}%';`);
        return response[0][0];
    }

    static async updateLevelTerm(batchid, level, term) {
        await db.execute(`update batch
                          set Level = ${level},
                              Term  = ${term}
                          where ID = ${batchid};`);

    }
};
