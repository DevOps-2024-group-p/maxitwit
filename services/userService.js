const sqlite3 = require('sqlite3').verbose();

class UserService {
    constructor() {
        this.db = new sqlite3.Database('./db/minitwit.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Added db connection from user service');
            }
        });
    }

    async addMessage(userId, messageContent, currentDate) {
        const flagged = 0;
        const sql = `INSERT INTO message (author_id, text, pub_date, flagged) VALUES (?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(sql, [userId, messageContent, currentDate, flagged], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async getMessagesByUserId(id) {
        const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
                    FROM message
                    JOIN user ON message.author_id = user.user_id
                    WHERE message.flagged != 1 AND message.author_id = ?
                    ORDER BY message.pub_date DESC
                    LIMIT 50`;
        return new Promise((resolve, reject) => {
            this.db.all(sql, [id], (err, messages) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
                }
            });
        });
    }

    async getMessagesFromUserAndFollowedUsers(userId) {
        const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
                    FROM message
                    JOIN user ON message.author_id = user.user_id
                    JOIN follower ON user.user_id = follower.who_id
                    WHERE message.flagged != 1 AND (follower.whom_id = message.author_id OR message.author_id = ?)
                    ORDER BY message.pub_date DESC
                    LIMIT 50`;
        return new Promise((resolve, reject) => {
            this.db.all(sql, [userId], (err, messages) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
                }
            });
        });
    }

    async getPublicTimelineMessages() {
        const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
                    FROM message
                    JOIN user ON message.author_id = user.user_id
                    WHERE message.flagged != 1
                    ORDER BY message.pub_date DESC
                    LIMIT 50`;
        return new Promise((resolve, reject) => {
            this.db.all(sql, [], (err, messages) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
                }
            });
        });
    }

    async getUserIdByUsername(username) {
        const sql = `SELECT user_id FROM user 
                    JOIN message m 
                    ON m.author_id = user.user_id 
                    WHERE user.username = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.user_id : null);
                }
            });
        });
    }
}

module.exports = UserService;