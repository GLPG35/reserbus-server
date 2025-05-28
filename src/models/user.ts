import { RowDataPacket } from 'mysql2'
import { CreateUser, DBUser, TripUser } from '../types'
import { createToken } from '../utils/jwt'
import { connection } from './database/db'
import ReservationModel from './reservation'

class UserModel {
	static checkEmail = async (email: string) => {
		const [result] = await connection.execute<RowDataPacket[]>(`
			SELECT email
			FROM user
			WHERE email = ?
		`, [email])

		return result.length > 0
	}
	
	static getUser = async (id: string) => {
		const [result] = await connection.execute(`
			SELECT id, name, lastname, email, ci, role
			FROM user
			WHERE id = ?
		`, [id])

		return result
	}

	static userExists = async (ci: number) => {
		const [result] = await connection.execute<RowDataPacket[]>(`
			SELECT ci
			FROM user
			WHERE ci = ?
		`, [ci])

		return result.length > 0
	}

	static getRole = async (id: string) => {
		const [result] = await connection.execute<DBUser[]>(`
			SELECT role
			FROM user
			WHERE id = ?
		`, [id])

		if (result.length < 1) throw new Error('Usuario no encontrado')

		return result[0].role
	}

	static validateAdmin = async (id: string) => {
		const role = await this.getRole(id)

		if (role !== 'admin') throw new Error('Usuario sin permisos suficientes')

		return
	}

	static authUser = async (email: string, password: string) => {
		const [[result]] = await connection.execute<DBUser[]>(`
			SELECT id, name, lastname, email, ci, cast(password as CHAR) as password, role
			FROM user
			WHERE email = ?
		`, [email])

		const { password: dbPassword, ...user } = result

		const verifyPassword = await Bun.password.verify(password, dbPassword, 'bcrypt')

		if (!verifyPassword) throw new Error('E-mail o contraseña incorrecta')

		const userWithToken = await createToken(user)

		return userWithToken
	}

	static createUser = async (user: CreateUser) => {
		const { name, lastname, ci, email, password, tel, role } = user
		const id = Bun.randomUUIDv7()

		const userExists = await this.userExists(ci)

		if (userExists) throw new Error('Esta cédula ya está registrada')

		const passwordHash = await Bun.password.hash(password, 'bcrypt')

		await connection.execute(`
			INSERT INTO user (id, ci, name, lastname, email, password${role ? ', role' : ''})
			VALUES (?, ?, ?, ?, ?, ?${role ? ', ?' : ''})
		`, role ? [id, ci, name, lastname, email, passwordHash, role] : [id, ci, name, lastname, email, passwordHash])

		await connection.execute(`
			INSERT INTO tel (id, number)
			VALUES (?, ?)
		`, [id, tel])

		const newUser = {
			id,
			ci,
			name,
			lastname,
			email,
			role: role ?? 'user'
		}

		return createToken(newUser)
	}

	static createTripUser = async (tripUser: TripUser) => {
		const { user, ...tripData } = tripUser
		const userWithToken = await this.createUser(user)

		const rid = await ReservationModel.createReservation(userWithToken.id, tripData)

		return {
			userWithToken,
			rid
		}
	}

	static deleteUser = async (id: string) => {
		return connection.execute(`
			INSERT INTO user (disabled)
			VALUES (true)
			WHERE id = ?
		`, [id])
	}
}

export default UserModel