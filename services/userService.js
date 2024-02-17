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
                    JOIN user on message.author_id = user.user_id
                    WHERE message.flagged = 0 
                    AND (
                        user.user_id = ?
                        OR user.user_id IN (
                            SELECT whom_id FROM follower
                            WHERE who_id = ?))
                    ORDER BY message.pub_date DESC
                    LIMIT 50`;
        return new Promise((resolve, reject) => {
            this.db.all(sql, [userId, userId], (err, messages) => {
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

    async getUserIdByUsernameIfExists(username) {
        const sql = `SELECT user_id FROM user 
                    WHERE user.username = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserByUsername(username) {
        const sql = 'SELECT * FROM user WHERE username = ?';
        return new Promise((reject, resolve) => {
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(row);
            })
        })
    }

    async getUserIdByUsername(username) {
        const sql = `SELECT user_id FROM user 
                    WHERE user.username = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.user_id);
                }
            });
        });
    }

    async getUserIdByEmail(email) {
        const sql = `SELECT user_id FROM user 
                    WHERE user.email = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.user_id);
                }
            });
        });
    }

    async getUserIdByEmailIfExists(email) {
        const sql = `SELECT user_id FROM user 
                    WHERE user.email = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async isFollowing(userId, followedId) {
        const sql = `SELECT * FROM follower 
                    WHERE who_id = ? AND whom_id = ?`;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [userId, followedId], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (!row) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }

    async getFollowed(userId) {
        const sql = `select distinct f.whom_id
                     from follower f
                    where follower.who_id = ?`
        return new Promise((resolve, reject) => {
            this.db.all(sql, [userId], (err, followed) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(followed);
                }
            })
        })

    }

    async followUser(userId, followedId) {
        const sql = `INSERT INTO follower (who_id, whom_id) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(sql, [userId, followedId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    async unfollowUser(userId, followedId) {
        const sql = `DELETE FROM follower WHERE who_id = ? AND whom_id = ?`;
        return new Promise((resolve, reject) => {
            this.db.run(sql, [userId, followedId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(false);
                }
            });
        });
    }

    async registerUser(username, email, hash) {
        const sql = `INSERT INTO user (username, email, pw_hash) VALUES (?, ?, ?)`;
        return new Promise((resolve, reject) => {
            this.db.run(sql, [username, email, hash], (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve();
            });
        })
    }

}
module.exports = UserService;
