const db = require('../db');

module.exports = class Thesisarchive {
    constructor(thesisarchive) {
        this.id = thesisarchive.ID;
        this.batchID = thesisarchive.BatchID;
        this.title = thesisarchive.Title;
        this.authors = thesisarchive.Authors;
        this.abstract = thesisarchive.Abstract;
        this.link = thesisarchive.Link;
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
    static async getThesisDetailsById(id){
        let row = await db.execute(`SELECT Title,Authors,Abstract,Link FROM thesisarchive WHERE id = ${id}`);
        if(row[0].length===0){
            return null;
        }
        let row2 = await db.execute(`SELECT UserID FROM thesisowner where ThesisID = ${id}`);
        let count = row2[0].length;
        let i;
        let owners=[];
        for(i=0;i<count;i++){
            let userid = Object.values(row2[0][i]);
            let row3 = await db.execute(`SELECT Name,ProfilePic,ID,Karma FROM user where ID=${userid}`);
            owners.push(row3[0][0]);

        }
        let row4 = await db.execute(`SELECT u.ID,u.Name,c.ThesisID,c.Description,c.Date from (thesisarchive t join comment c on t.ID = c.ThesisID) JOIN user u on u.ID = c.UserID
where c.ThesisID=${id}`);
        let B=row[0][0];
        let array=B.Authors.split(",");
        let Comments=[];
        let count2 = row4[0].length;
        let k;

        for(k=0;k<count2;k++){
            let B2=row4[0][k];
            let obj={
                id:B2.ThesisID,
                comment:B2.Description,
                name:B2.Name,
                studentID:B2.ID,
                timestamp:B2.Date
            }
            Comments.push(obj);
        }
        let Details={
            title:B.Title,
            writers:array,
            description:B.Abstract,
            owners:owners,
            comments:Comments
        };

        return Details;
    }
};