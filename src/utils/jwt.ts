import { JWTPayload } from 'hono/utils/jwt/types';
import { User } from '../types';
import { sign } from 'hono/jwt';

export const getJWTUser = (payload: JWTPayload) => {
	const { exp, ...user } = payload

	return user
}

export const createToken = async (user: User) => {
	const { id, name, lastname, email, ci } = user

	const days = 7
	const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days
	
	const payload: JWTPayload = {
		id,
		name,
		lastname,
		email,
		ci,
		exp
	}

	const secret = process.env.SECRET as string
	const token = await sign(payload, secret)

	return {
		id,
		name,
		lastname,
		email,
		ci,
		token
	}
}