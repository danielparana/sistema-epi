const bcrypt = require('bcryptjs');

bcrypt.hash('teste123', 8)
  .then(hash => console.log(hash));