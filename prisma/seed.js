const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main () {
  const seedUsers = [
    {
      username: 'Jon Snow',
      email: 'jon.snow@got.com',
      message: {
        create: {
          text: 'Winter is coming',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    },
    {
      username: 'Daenerys Targaryen',
      email: 'daenerys.targaryen@got.com',
      message: {
        create: {
          text: 'Dracarys',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    },
    {
      username: 'Tyrion Lannister',
      email: 'tyrion.lannister@got.com',
      message: {
        create: {
          text: 'I drink and I know things',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    },
    {
      username: 'Arya Stark',
      email: 'arya.stark@got.com',
      message: {
        create: {
          text: 'A girl has no name',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    },
    {
      username: 'Sansa Stark',
      email: 'sansa.stark@got.com',
      message: {
        create: {
          text: 'The lone wolf dies, but the pack survives',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    },
    {
      username: 'Cersei Lannister',
      email: 'cersei.lannister@got.com',
      message: {
        create: {
          text: 'When you play the game of thrones, you win or you die',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    },
    {
      username: 'Bran Stark',
      email: 'bran.stark@got.com',
      message: {
        create: {
          text: 'Chaos isn\'t a pit. Chaos is a ladder.',
          flagged: 0,
          pub_date: 1711350992
        }
      },
      pw_hash: '1234'
    }
  ]

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
  }

  console.log(seedUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
