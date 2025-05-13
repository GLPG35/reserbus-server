import { Context } from 'hono'
import { getJWTUser } from '../utils/jwt'
import UserModel from '../models/user'
import { setCookie, deleteCookie } from 'hono/cookie'
import { UserWithToken } from '../types'

class AuthController {
	static check = (c: Context) => {
		const payload = c.get('jwtPayload')
		const user = getJWTUser(payload)
		
		return c.json({ user, success: true })
	}

	static checkEmail = async (c: Context) => {
		const { email } = await c.req.json()
		const exists = await UserModel.checkEmail(email)

		return c.json({ success: exists })
	}

	private static returnUser = (c: Context, userWithToken: UserWithToken, rid?: string) => {
		const { token, ...user } = userWithToken
		const date = new Date()
		date.setDate(date.getDate() + 7)

		setCookie(c, 'jwtCookie', token, {
			httpOnly: true,
			secure: true,
			expires: new Date(date.toUTCString()),
			sameSite: 'none',
			partitioned: true
		})

		return c.json({ user, success: true, rid })
	}

	static createUser = async (c: Context) => {
		const { ci, name, lastname, email, password, tel } = await c.req.json()
		const userWithToken = await UserModel.createUser({ ci, name, lastname, email, password, tel })
		
		return this.returnUser(c, userWithToken)
	}

	static createTripUser = async (c: Context) => {
		const { user, origin, destination, stops, date, busType } = await c.req.json()
		const { userWithToken, rid } = await UserModel.createTripUser({ user, origin, destination, stops, date, busType })

		return this.returnUser(c, userWithToken, rid)
	}
	
	static login = async (c: Context) => {
		const { email, password } = await c.req.json()
		const userWithToken = await UserModel.authUser(email, password)
		
		return this.returnUser(c, userWithToken)
	}

	static logout = (c: Context) => {
		deleteCookie(c, 'jwtCookie', {
			secure: true,
			httpOnly: true,
			sameSite: 'none',
			partitioned: true
		})

		return c.json({ success: true })
	}
}

export default AuthController