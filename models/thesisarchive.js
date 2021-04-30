const db = require('../db');
const User = require('../models/user');

module.exports = class Thesisarchive {
    static async findUsers(thesisID){
        let result= await db.execute(`SELECT o.UserID FROM thesisarchive t JOIN thesisowner o ON t.ID=o.ThesisID WHERE t.ID=${thesisID};`);
        return result[0];
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
        let c = row.length;
        let i;
        for(i=0;i<c;i++){
            if(row[i].UserID===userID){
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
    static async findCommentsByThesisID(id){
        let result= await  db.execute(`SELECT u.ID AS UID,u.Name,c.ID AS CID,c.Description,c.Date from (thesisarchive t join comment c on t.ID = c.ThesisID) JOIN user u on u.ID = c.UserID
where c.ThesisID=${id};`);
        return result[0];
    }
    static async findDetailsByThesisID(id){
        let result = await db.execute(`SELECT o.UserID,t.BatchID,t.Title,t.Authors,t.Abstract,t.Link FROM thesisarchive t JOIN thesisowner o ON t.ID=o.ThesisID WHERE t.id = ${id};`)
        return result[0];
    }
    static async getThesisTitleByBatchID(batchID){
        let result = await db.execute(`SELECT ID,Title FROM thesisarchive WHERE batchID = ${batchID};`);
        return result[0];
    }
    static async getMaxID(){
        let result = await db.execute(`SELECT MAX(ID) FROM thesisarchive;`);
        return result[0][0];
    }
};