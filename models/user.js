const db = require('../db');

module.exports = class User {
    constructor(user) {
        this.id = user.ID;
        this.batchID = user.BatchID;
        this.name = user.Name;
        this.email = user.Email;
        this.password = user.Password;
        this.profilePic = user.ProfilePic;
        this.joiningDate = user.JoiningDate;
        this.level = user.Level;
        this.term = user.Term;
        this.session = user.Session;
        this.isCR = user.IsCR;
    }

    // save() {
    //     return db.execute(
    //         'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
    //         [this.title, this.price, this.imageUrl, this.description]
    //     );
    // }

    // static deleteById(id) {}

    static fetchAll() {
        return db.execute('SELECT * FROM user;');
    }

    static async findById(id) {
        let resultRaw = await db.execute(`SELECT * FROM user WHERE id = ${id}`)

        if(resultRaw[0].length===0){
            return null;
        }

        let user = new User(resultRaw[0][0]);

        return user;
    }

    static async findByToken(token){
        let resultRaw = await db.execute(`SELECT * from user where ID=(SELECT studentID FROM token WHERE token = '${token}')`);

        // console.log(`SELECT * from user where ID=(SELECT studentID FROM token WHERE token = '${token}')`);
        if(resultRaw[0].length===0){
            return null;
        }

        let user = new User(resultRaw[0][0]);

        return user;
    }

    saveToken(token){
        return db.execute(`INSERT INTO token(studentID,token) VALUES(${this.id},'${token}');`);
    }
};
