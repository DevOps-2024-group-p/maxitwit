const { exec } = require('child_process')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class Database {
  constructor () {
    if (!Database.instance) {
      Database.instance = this
    }
    return Database.instance
  }

  getDb () {
    return prisma
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
