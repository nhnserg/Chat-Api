import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../user/user.model.js'
import { auth } from '../middleware/auth.js'

const authRouter = express.Router()

// Validation middleware
const validateRegistration = [
	body('username').trim().isLength({ min: 3 }).escape(),
	body('email').isEmail().normalizeEmail(),
	body('password').isLength({ min: 6 }),
]

const validateLogin = [
	body('email').isEmail().normalizeEmail(),
	body('password').exists(),
]

authRouter.post('/register', validateRegistration, async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { username, email, password } = req.body

		// Check if user already exists
		const existingUser = await User.findOne({
			$or: [{ email }, { username }],
		})

		if (existingUser) {
			return res.status(400).json({
				error: 'User with this email or username already exists',
			})
		}

		const user = new User({ username, email, password })
		await user.save()

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		})

		res.status(201).json({
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
			token,
		})
	} catch (error) {
		res.status(500).json({ error: 'Registration failed' })
	}
})

authRouter.post('/login', validateLogin, async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { email, password } = req.body
		const user = await User.findOne({ email })

		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		})

		user.lastActive = new Date()
		await user.save()

		res.json({
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
			token,
		})
	} catch (error) {
		res.status(500).json({ error: 'Login failed' })
	}
})

authRouter.get('/me', auth, async (req, res) => {
	try {
		res.json({
			user: {
				id: req.user._id,
				username: req.user.username,
				email: req.user.email,
				createdAt: req.user.createdAt,
				lastActive: req.user.lastActive,
			},
		})
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch profile' })
	}
})

export default authRouter
