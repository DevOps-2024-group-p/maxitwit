const db = require('../db/database');

class UserService {
	async addMessage(userId, messageContent, currentDate) {
		const flagged = 0;
		const sql = 'INSERT INTO message (author_id, text, pub_date, flagged) VALUES (?, ?, ?, ?)';
		return new Promise((resolve, reject) => {
			db.getDb().run(sql, [userId, messageContent, currentDate, flagged], (err) => {
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
			db.getDb().all(sql, [id], (err, messages) => {
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
			db.getDb().all(sql, [userId, userId], (err, messages) => {
				if (err) {
					reject(err);
				} else {
					resolve(messages);
				}
			});
		});
	}

	async getPublicTimelineMessages(limit) {
		const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
                    FROM message
                    JOIN user ON message.author_id = user.user_id
                    WHERE message.flagged != 1
                    ORDER BY message.pub_date DESC
                    LIMIT ?`;
		return new Promise((resolve, reject) => {
			db.getDb().all(sql, [limit], (err, messages) => {
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
			db.getDb().get(sql, [username], (err, row) => {
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
			db.getDb().get(sql, [username], (err, row) => {
				if (err) {
					console.error(err.message);
					reject(err);
				}
				resolve(row);
			});
		});
	}

	async getUserIdByUsername(username) {
		const sql = `SELECT user_id FROM user 
                    WHERE user.username = ?`;
		return new Promise((resolve, reject) => {
			db.getDb().get(sql, [username], (err, id) => {
				if (err) {
					reject(err);
				} else {
					resolve(id);
				}
			});
		});
	}

	async getUserIdByEmail(email) {
		const sql = `SELECT user_id FROM user 
                    WHERE user.email = ?`;
		return new Promise((resolve, reject) => {
			db.getDb().get(sql, [email], (err, id) => {
				if (err) {
					reject(err);
				} else {
					resolve(id);
				}
			});
		});
	}

	async getUserIdByEmailIfExists(email) {
		const sql = `SELECT user_id FROM user 
                    WHERE user.email = ?`;
		return new Promise((resolve, reject) => {
			db.getDb().get(sql, [email], (err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			});
		});
	}

	async isFollowing(who_id, whom_id) {
		const sql = `SELECT * FROM follower 
                    WHERE who_id = ? AND whom_id = ?`;
		return new Promise((resolve, reject) => {
			db.getDb().get(sql, [who_id, whom_id], (err, row) => {
				if (err) {
					reject(err);
				}
				if (!row) {
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
	}

	async getAllFollowed(userId, limit) {
		const sql = `SELECT user.username FROM user
                    INNER JOIN follower ON follower.whom_id=user.user_id
                    WHERE follower.who_id=?
                    LIMIT ?`;
		return new Promise((resolve, reject) => {
			db.getDb().all(sql, [userId, limit], (err, followed) => {
				if (err) {
					reject(err);
				} else {
					resolve(followed);
				}
			});
		});
	}

	async followUser(userId, followedId) {
		const sql = 'INSERT INTO follower (who_id, whom_id) VALUES (?, ?)';
		return new Promise((resolve, reject) => {
			db.getDb().run(sql, [userId, followedId], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	}

	async unfollowUser(userId, followedId) {
		const sql = 'DELETE FROM follower WHERE who_id = ? AND whom_id = ?';
		return new Promise((resolve, reject) => {
			db.getDb().run(sql, [userId, followedId], (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(false);
				}
			});
		});
	}

	async registerUser(username, email, hash) {
		const sql = 'INSERT INTO user (username, email, pw_hash) VALUES (?, ?, ?)';
		return new Promise((resolve, reject) => {
			db.getDb().run(sql, [username, email, hash], (err) => {
				if (err) {
					console.error(err.message);
					reject(err);
				}
				resolve();
			});
		});
	}
}
module.exports = UserService;
