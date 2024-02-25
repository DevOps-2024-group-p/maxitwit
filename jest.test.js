const request = require('supertest')
const app = require('./src/app')
const sqlite3 = require('sqlite3').verbose()

describe('Test the root path', () => {
  let db // Database connection object

  // Establish database connection before running the tests
  beforeAll(() => {
    // Establish connection to the SQLite database
    db = new sqlite3.Database('./db/minitwit.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error('Error connecting to database:', err.message)
      } else {
        console.log('Connected to the database')
      }
    })
  })

  // Close database connection after running the tests
  afterAll(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message)
      } else {
        console.log('Database connection closed')
      }
    })
  })

  test('It should response the GET method', () => {
    return request(app)
      .get('/public')
      .then(response => {
        expect(response.statusCode).toBe(200)
      })
  })
})
