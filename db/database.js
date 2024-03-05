const sqlite3 = require('sqlite3').verbose()

const { exec } = require('child_process')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class Database {
  constructor () {
    if (!Database.instance) {
      this.db = new sqlite3.Database('./db/minitwit.db')
      Database.instance = this
    }
    return Database.instance
  }

  getDb () {
    return this.db
  }

  async initSchema () {
    exec('npx prisma migrate reset --force', (error) => {
      if (error) {
        console.log(`error: ${error.message}`)
      }
    })

    await prisma.$connect()
  }
}

module.exports = new Database()
