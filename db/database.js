const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
	constructor() {
		if (!Database.instance) {
			this.db = new sqlite3.Database('./db/minitwit.db');
			Database.instance = this;
		}
		return Database.instance;
	}

	getDb() {
		return this.db;
	}

	async initSchema() {
		const sqlFilePath = path.join(__dirname, 'schema.sql');
		const sql = fs.readFileSync(sqlFilePath, 'utf8');
		return new Promise((resolve, reject) => {
			this.db.exec(sql, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

module.exports = new Database();
