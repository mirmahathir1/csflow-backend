const db = require("../db");


module.exports = class Resourcearchive {
    constructor(resourcearchive) {
        this.id = resourcearchive.ID;
        this.batchID = resourcearchive.BatchID;
        this.level = resourcearchive.Level;
        this.term = resourcearchive.Term;
        this.link = resourcearchive.Link;
    }

static async fetchAll() {
    let Array=[];
    let row2 = await db.execute(`SELECT ID FROM batch;`);
    let batches=[];
    let j;
    for(j=0;j<row2[0].length;j++){
        batches.push(Object.values(row2[0][j]));
    }

    let k;
    for(k=0;k<batches.length;k++){
        let batch_no = batches[k][0]

        let row = await db.execute(`SELECT Level,Term,Link FROM resourcearchive WHERE BatchID = ${batch_no};`);

        let c = row[0].length;
        if(row[0].length===0){
            return null;
        }

        let i;
        let resources=[];

        for(i=0;i<c;i++){
            resources.push(row[0][i]);

        }
        let objects={
            batch:batch_no,
            resources:resources
        };
        Array.push(objects);

    }
    return Array;
}
};