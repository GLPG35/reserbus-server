import { Context } from 'hono'
import UserModel from '../models/user'
import { getJWTUser } from '../utils/jwt'

class UserController {
	deleteUser = async (c: Context) => {
		const { id } = c.req.param()
		const payload = c.get('jwtPayload')
		const user = getJWTUser(payload)

		if (user.id == id) throw new Error('No puede eliminar su propio usuario')
		
		await UserModel.deleteUser(id)

		return c.json({ success: true })
	}
}

export default UserController