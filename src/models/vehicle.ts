import { AddVehicle, DBVehicle } from '../types'
import { connection } from './database/db'
import UserModel from './user'

class VehicleModel {
	static getVehicles = async (id: string) => {
		await UserModel.validateAdmin(id)
		
		const [vehicles] = await connection.execute<DBVehicle[]>(`
			SELECT id, type, capacity, availableTime, createdAt
			FROM vehicle
			WHERE disabled = false
		`)

		return vehicles
	}

	static getVehicle = async (id: string) => {
		const [vehicle] = await connection.execute<DBVehicle[]>(`
			SELECT id, type, capacity, availableTime, createdAt
			FROM vehicle
			WHERE id = ?
		`, [id])

		if (vehicle.length < 1) throw new Error('Vehículo no encontrado')

		return vehicle[0]
	}

	static addVehicle = async (uid: string, vehicle: AddVehicle) => {
		await UserModel.validateAdmin(uid)
		
		const id = Bun.randomUUIDv7()
		const { type, capacity, availableTime } = vehicle

		await connection.execute(`
			INSERT INTO vehicle (id, type, capacity, availableTime)
			VALUES (?, ?, ?, ?)
		`, [id, type, capacity, availableTime])

		const newVehicle = await this.getVehicle(id)

		return newVehicle
	}
}

export default VehicleModel