const express = require('express')
const {registerUser, login, logout} = require('../seguridad/authService')
const { authenticateJWT } = require('../seguridad/auth')


const router = express.Router()

router.post('/api/register', registerUser)
router.post('/api/login', login)
router.post('/api/logout', authenticateJWT, logout)

module.exports = router

