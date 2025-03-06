import jwt from 'jsonwebtoken'
import { User } from '../user/user.model.js'

export const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '')

		if (!token) {
			return res.status(401).json({ error: 'Authentication required' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findById(decoded.userId)

		if (!user) {
			return res.status(401).json({ error: 'User not found' })
		}

		req.user = user
		req.token = token
		next()
	} catch (error) {
		res.status(401).json({ error: 'Please authenticate' })
	}
}

export const wsAuth = async token => {
	try {
		if (!token) return null

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findById(decoded.userId)
		return user
	} catch (error) {
		return null
	}
}
