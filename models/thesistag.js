const db = require('../db');
module.exports = class ThesisTag{
    static async getTopics(){
        let response = await db.execute(`select TagName from thesispredefinedtag`);
        return response[0];
    }
};