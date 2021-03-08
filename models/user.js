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

    save() {
        return db.execute(
            'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
            [this.title, this.price, this.imageUrl, this.description]
        );
    }

    static deleteById(id) {}

    static fetchAll() {
        return db.execute('SELECT * FROM user;');
    }

    static async findById(id) {
        let resultRaw = await db.execute(`SELECT * FROM user WHERE id = ${id}`)
        let user = resultRaw[0];
        return user;
    }
};
