import { trycatch } from '../helpers/trycatch.js'
import { AuthService } from './auth.service.js'

export class AuthController {
	constructor() {
		this.authService = new AuthService()
	}

	register = trycatch(async (req, res) => {
		const { name, email, password } = req.body

		const user = await this.authService.registerUser({ name, email, password })

		res.status(201).json({ user })
	})

	login = trycatch(async (req, res) => {
		const { email, password } = req.body

		const user = await this.authService.loginUser({ email, password })

		res.status(200).json({ user })
	})

	logout = trycatch(async (req, res) => {
		const { refreshToken } = req.body
		await this.authService.logoutUser(refreshToken)

		res.status(200).json({ message: 'Logout successful' })
	})

	getProfile = trycatch(async (req, res) => {
		const profile = await this.authService.getUserProfile(req.user)
		res.json({ user: profile })
	})

	refresh = trycatch(async (req, res) => {
		const { refreshToken } = req.body
		const user = await this.authService.refreshTokens(refreshToken)

		res.status(200).json({ user })
	})
}
