const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization

  console.log("Authorization:", authHeader)
  console.log("JWT_SECRET:", process.env.JWT_SECRET)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token não informado ou formato inválido'
    })
  }

  const token = authHeader.replace('Bearer ', '').trim()

   console.log("Token recebido:", token)

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    console.log("Token decodificado:", decoded)

    req.user = decoded

    return next()

  } catch (error) {

    console.log(error)

    return res.status(401).json({
      error: 'Token inválido'
    })

  }

}

module.exports = authMiddleware