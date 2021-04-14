const db = require('../db');
module.exports = class Batch{
    constructor(batch) {
        this.id=batch.ID;
        this.batchname=batch.name;
    }
    static async findBatchList(){
        let row = await db.execute(`SELECT ID FROM batch;`);
        let array=[];
        let c = row[0].length;
        let i;
        for(i=0;i<c;i++){
            array.push(row[0][i].ID);
        }

        return array;
    }
};