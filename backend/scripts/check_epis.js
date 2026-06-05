const prisma = require('../src/prisma/client')

async function main(){
  const epis = await prisma.epi.findMany()
  console.log(JSON.stringify(epis, null, 2))
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
