const db = require('../db');
module.exports = class Batch{
    constructor(batch) {
        this.id=batch.ID;
        this.batchname=batch.name;
    }
    static async findBatchList(){
        let row = await this.getBatchID();

        let array=[];
        let c = row[0].length;
        let i;
        if(c===0){
            return null;
        }
        for(i=0;i<c;i++){
            array.push(row[0][i].ID);
        }

        return array;
    }
    static async getBatchID(){
        return db.execute(`SELECT ID FROM batch;`);
    }
};