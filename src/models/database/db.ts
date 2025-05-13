import mysql from 'mysql2/promise'

export const connection = await mysql.createConnection({
	host: process.env.DB_HOST,
	port: 3306,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
})