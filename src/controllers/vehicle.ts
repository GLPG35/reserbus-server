import { Context } from 'hono'
import VehicleModel from '../models/vehicle'

class VehicleController {
	static getVehicles = async (c: Context) => {
		const { id } = c.get('jwtPayload')
		
		const vehicles = await VehicleModel.getVehicles(id)

		return c.json({ data: vehicles, success: true })
	}

	static addVehicle = async (c: Context) => {
		const { id } = c.get('jwtPayload')
		const { type, capacity, availableTime } = await c.req.json()

		const newVehicle = await VehicleModel.addVehicle(id, { type, capacity, availableTime })

		return c.json({ data: newVehicle, success: true })
	}
}

export default VehicleController