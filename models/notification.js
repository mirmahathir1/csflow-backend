const db = require('../db');

module.exports = class Notification {
    static async getNotifications(userId) {
        let result = await db.execute(`SELECT *
                                       FROM notification
                                        WHERE userid=${userId};`);

        if(result[0])
            return result[0];
        else
            return null;
    }

    static async addNotification(userid, text, link) {
        return db.execute(`INSERT INTO notification(userid, text, link, date)
                           VALUES (${userid}, '${text}', '${link}', current_timestamp())`);
    }
};
