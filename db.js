// npm i mysql2
const mysql = require("mysql2/promise")

const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'escola', // corrigir a senha
    database: '2tri3dsc' // colocar o nome do seu BD
})

module.exports = Object.freeze({
    pool: pool
})