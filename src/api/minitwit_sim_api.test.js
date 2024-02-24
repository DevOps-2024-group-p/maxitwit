const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const request = require('supertest')

const BASE_URL = 'http://127.0.0.1:4000/api'
const DATABASE = './tmp/minitwit.db'
const USERNAME = 'simulator'
const PWD = 'super_safe!'
const CREDENTIALS = Buffer.from(`${USERNAME}:${PWD}`).toString('base64')
const HEADERS = {
  Connection: 'close',
  'Content-Type': 'application/json',
  Authorization: `Basic ${CREDENTIALS}`
}

beforeAll(() => {
  // Create the database tables
  const db = new sqlite3.Database(DATABASE)
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  db.exec(schema)
  db.close()
})

afterEach(() => {
  // Clear the database after each test
  fs.unlinkSync(DATABASE)
  const db = new sqlite3.Database(DATABASE)
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  db.exec(schema)
  db.close()
})

describe('Express.js API Tests', () => {
  test('Register User', async () => {
    const response = await request(BASE_URL)
      .post('/register')
      .set(HEADERS)
      .send({ username: 'test', email: 'test@test', pwd: 'foo', latest: 1337 })

    expect(response.status).toBe(200)

    const latestResponse = await request(BASE_URL)
      .get('/latest')
      .set(HEADERS)

    expect(latestResponse.body.latest).toBe(1337)
  })

  // Add other tests similarly
})
