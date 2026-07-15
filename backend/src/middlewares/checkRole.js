function checkRole(rolesAllowed) {
  return (req, res, next) => {
    const { role } = req.user

    if (!role) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    if (!rolesAllowed.includes(role)) {
      return res.status(403).json({ error: 'Permissão insuficiente' })
    }

    return next()
  }
}

module.exports = checkRole