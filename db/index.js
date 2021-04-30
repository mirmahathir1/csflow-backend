const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOSTNAME,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

const database = pool.promise();

const dbLogger = {}
dbLogger.execute = async (query)=>{
    console.log("SQL: ",query.replace(/[ \n]+/g,' '));
    return database.execute(query);
}

module.exports = dbLogger;