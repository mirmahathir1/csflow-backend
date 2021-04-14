const db = require('../db');
const User = require('../models/user');
const Thesisowner = require('../models/thesisowner');
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
        let row = await this.getThesisTitle(batchID);
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
        let row = await this.findDetails(id);
        if(row[0].length===0){
            return null;
        }

        let count = row[0].length;
        let i;
        let owners=[];
        for(i=0;i<count;i++){

            let userid = row[0][i].UserID;
            let row3 = await User.getUserDetails(userid);
            owners.push(row3[0][0]);

        }
        let row4 = await this.findComments(id);
        let B=row[0][0];
        let array=B.Authors.split(",");
        let Comments=[];
        let count2 = row4[0].length;
        let k;

        for(k=0;k<count2;k++){
            let B2=row4[0][k];

            let obj={
                id:B2.CID,
                comment:B2.Description,
                name:B2.Name,
                studentID:B2.UID,
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
    static async saveThesis(batchID,title,authors,abstract,link,owners){
        let i;
        for(i=0;i<owners.length;i++){
            let row2 = await User.isUser(owners[i]);
            if(row2[0].length===0){
                return null;
            }
        }
        let row = await this.getMaxID();

        let count = Object.values(row[0][0]);
        let id = count[0]+1;

        await this.create(id,batchID,title,authors,abstract,link);
        let k;
        //console.log("reached6.3");

        //console.log("reached7");
        for (k=0;k<owners.length;k++){
            await Thesisowner.create(id,owners[k]);
        }

        return 1;
    }
    static async EditThesis(id,batchID,title,authors,abstract,link,owners){
        let i;
        for(i=0;i<owners.length;i++){

            let row2 = await User.isUser(owners[i]);

            if(row2[0].length===0){
                return null;
            }
        }

        await this.update(id,batchID,title,authors,abstract,link);
        let k;

       /*for (k=0;k<owners.length;k++){
            await db.execute(`UPDATE thesisowner
            SET UserID=${owners[k]} WHERE ThesisID=${id};`);
        }*/

        return 1;
    }
    static async findUsers(thesisID){
        return db.execute(`SELECT o.UserID FROM thesisarchive t JOIN thesisowner o ON t.ID=o.ThesisID WHERE t.ID=${thesisID};`);
    }
    static async update(id,batchID,title,authors,abstract,link){
        await db.execute(`UPDATE thesisarchive
        SET BatchID=${batchID},Title='${title}',Authors='${authors}',Abstract='${abstract}',Link='${link}'
        WHERE ID=${id};`);
    }

    static async create(id,batchID,title,authors,abstract,link){
        await db.execute(`INSERT INTO thesisarchive(ID,BatchID,Title,Authors,Abstract,Link) 
            VALUES(${id},${batchID},'${title}','${authors}','${abstract}','${link}')`);
    }

    static async userAuthorization(thesisID,userID){
        let row = await this.findUsers(thesisID);
        let c = row[0].length;
        let i;
        for(i=0;i<c;i++){
            if(row[0][i].UserID===userID){
                return 1;
            }
        }

        return null;

    }
    static async findThesis(id){
        let row = await db.execute(`SELECT ID FROM thesisarchive WHERE ID=${id}`);

        if(row[0].length===0){
            return null;
        }
        return 1;
    }
    static async DeleteThesis(id){

        await db.execute(`DELETE FROM thesisarchive WHERE ID=${id}`);

    }
    static async findComments(id){
        return  db.execute(`SELECT u.ID AS UID,u.Name,c.ID AS CID,c.Description,c.Date from (thesisarchive t join comment c on t.ID = c.ThesisID) JOIN user u on u.ID = c.UserID
where c.ThesisID=${id};`);
    }
    static async findDetails(id){
        return db.execute(`SELECT o.UserID,t.Title,t.Authors,t.Abstract,t.Link FROM thesisarchive t JOIN thesisowner o ON t.ID=o.ThesisID WHERE t.id = ${id};`);
    }
    static async getThesisTitle(batchID){
        return db.execute(`SELECT ID,Title FROM thesisarchive WHERE batchID = ${batchID};`);
    }
    static async getMaxID(){
        return db.execute(`SELECT MAX(ID) FROM thesisarchive;`);
    }
};