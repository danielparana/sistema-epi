const bcrypt = require('bcryptjs')

async function gerarHash() {
  const hash = await bcrypt.hash('epiSenai123', 10)
  console.log(hash)
}

gerarHash()