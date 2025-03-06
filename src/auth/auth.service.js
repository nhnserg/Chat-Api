import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { HttpError } from '../helpers/HttpError.js'
import dotenv from 'dotenv'
import { Token } from '../token/token.model.js'

dotenv.config()

export class AuthService {
	async registerUser({ username, email, password }) {
		const existingUser = await User.findOne({
			$or: [{ email }, { username }],
		})

		if (existingUser) {
			throw HttpError(409, 'User with this email or username already exists')
		}

		const user = new User({ username, email, password })
		await user.save()

		const tokens = this.generateToken(user._id)
		await this.saveRefreshToken(user._id, tokens.refreshToken)

		return {
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
			...tokens,
		}
	}

	async loginUser({ email, password }) {
		const user = await User.findOne({ email })
		if (!user || !(await user.comparePassword(password))) {
			throw HttpError(401, 'Invalid credentials')
		}

		user.lastActive = new Date()
		await user.save()

		const tokens = this.generateToken(user._id)
		await this.saveRefreshToken(user._id, tokens.refreshToken)

		return {
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
			...tokens,
		}
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			throw HttpError(401, 'Refresh token is missing')
		}

		const tokenData = await Token.findOne({ refreshToken })
		if (!tokenData) {
			throw HttpError(403, 'Invalid refresh token')
		}

		let userData
		try {
			userData = jwt.verify(refreshToken, process.env.KEY_ACCESS)
		} catch (error) {
			throw HttpError(403, 'Invalid refresh token')
		}

		const user = await User.findById(userData.userId)
		if (!user) {
			throw HttpError(404, 'User not found')
		}
		const tokens = this.generateToken(user._id)
		await this.saveRefreshToken(user._id, tokens.refreshToken)

		return {
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
			...tokens,
		}
	}
	async logout(refreshToken) {
		await Token.findOneAndDelete({ refreshToken })
	}

	async getUserProfile(user) {
		return {
			id: user._id,
			username: user.username,
			email: user.email,
			createdAt: user.createdAt,
			lastActive: user.lastActive,
		}
	}

	generateTokens(userId) {
		const accessToken = jwt.sign({ userId }, process.env.KEY_ACCESS, {
			expiresIn: '15m',
		})
		const refreshToken = jwt.sign({ userId }, process.env.KEY_REFRESH, {
			expiresIn: '7d',
		})

		return { accessToken, refreshToken }
	}

	// Сохранение refresh-токена в базе
	async saveRefreshToken(userId, refreshToken) {
		await Token.findOneAndUpdate(
			{ userId },
			{ refreshToken },
			{ upsert: true, new: true }
		)
	}
}
