import { ConfirmReservation, CreateReservation, DBPaymentMethodId, DBReservation, RouteId, UpdateReservation } from '../types'
import { connection } from './database/db'
import UserModel from './user'

class ReservationModel {
	private static createRoute = async (origin: string, destination: string) => {
		const id = Bun.randomUUIDv7()

		await connection.execute(`
			INSERT INTO route (id, origin, destination)
			VALUES (?, ?, ?)
		`, [id, origin, destination])

		return id
	}

	private static createStops = (routeId: string, stops: string[]) => {
		stops.forEach(stop => {
			const id = Bun.randomUUIDv7()
			
			connection.execute(`
				INSERT INTO stop (id, routeId, name)
				VALUES (?, ?, ?)
			`, [id, routeId, stop])
		})
	}

	static getReservations = async (uid: string, all = false) => {
		const role = await UserModel.getRole(uid)
		
		const [result] = await connection.execute<DBReservation[]>(`
			SELECT reservation.id, reservation.routeId,
			reservation.vehicleId, reservation.vehicleType,
			reservation.createdAt, reservation.tripDate,
			reservation.status, reservation.amount,
			route.origin, route.destination,
			route.duration, GROUP_CONCAT(stop.id, ';', stop.name) AS stops
			FROM reservation
			INNER JOIN route
			ON (reservation.routeId = route.id)
			LEFT JOIN stop
			ON (route.id = stop.routeId)
			${role === 'admin' && all ? '' : 'WHERE reservation.userId = ?'}
			GROUP BY reservation.id
			ORDER BY reservation.createdAt DESC
		`, [uid])

		const reservations = result.map(reservation => {
			const { stops } = reservation
			const parseStops = stops ? stops.split(',').map(stop => ({ id: stop.split(';')[0], name: stop.split(';')[1] })) : undefined

			return {
				...reservation,
				stops: parseStops
			}
		})

		return reservations
	}
	
	static createReservation = async (uid: string, reservation: CreateReservation) => {
		const { origin, destination, stops, busType, date } = reservation
		const id = Bun.randomUUIDv7()

		const routeId = await this.createRoute(origin, destination)
		if (stops) this.createStops(routeId, stops)

		await connection.execute(`
			INSERT INTO reservation (id, userId, routeId, vehicleType, tripDate)
			VALUES (?, ?, ?, ?, ?)
		`, [id, uid, routeId, busType, date])

		return id
	}

	static getReservation = async (id: string) => {
		const [result] = await connection.execute<DBReservation[]>(`
			SELECT reservation.id, reservation.routeId,
			reservation.vehicleId, reservation.vehicleType,
			reservation.createdAt, reservation.tripDate,
			reservation.status, reservation.amount,
			route.origin, route.destination,
			route.duration, GROUP_CONCAT(stop.id, ';', stop.name) AS stops
			FROM reservation
			INNER JOIN route
			ON (reservation.routeId = route.id)
			LEFT JOIN stop
			ON (route.id = stop.routeId)
			WHERE reservation.id = ?
			GROUP BY reservation.id
		`, [id])

		if (result.length < 1) throw new Error('Reserva no encontrada')

		const [reservation] = result
		const { stops } = reservation
		const parseStops = stops ? stops.split(',').map(stop => ({ id: stop.split(';')[0], name: stop.split(';')[1] })) : undefined
		const parseReservation = {...reservation, stops: parseStops}

		return parseReservation
	}

	private static deleteStops = (stops: string[]) => {
		stops.forEach(id => {
			connection.execute(`
				DELETE FROM stop
				WHERE id = ?
			`, [id])
		})
	}

	private static getRouteId = async (id: string) => {
		const [result] = await connection.execute<RouteId[]>(`
			SELECT routeId FROM reservation
			WHERE id = ?
		`, [id])

		if (result.length < 1) throw new Error('Reserva no encontrada')

		return result[0].routeId
	}

	private static confirmRoute = async (rid: string, duration: number) => {
		return connection.execute(`
			UPDATE route
			SET duration = ?
			WHERE id = ?
		`, [duration, rid])
	}

	static confirmReservation = async (uid: string, id: string, data: ConfirmReservation) => {
		const { duration, vehicleId, amount } = data 

		await UserModel.validateAdmin(uid)

		const rid = await this.getRouteId(id)

		await this.confirmRoute(rid, duration)

		return connection.execute(`
			UPDATE reservation
			SET vehicleId = ?, amount = ?
		`, [vehicleId, amount])
	}

	private static updateRoute = async (routeId: string, origin?: string, destination?: string) => {
		const parseUpdate = [{ name: 'origin', value: origin }, { name: 'destination', value: destination }].filter(x => x.value !== undefined).map(x => `${x.name} = ${x.value}`).join(', ')

		return connection.execute(`
			UPDATE route
			SET ${parseUpdate}
			WHERE id = ?
		`, [routeId])
	}

	static updateReservation = async (id: string, data: UpdateReservation) => {
		const { origin, destination, stops, busType, date } = data

		const { routeId, stops: dbStops } = await this.getReservation(id)

		if (dbStops) {
			const parseStops = dbStops.map(stop => stop.id)
			
			if (stops) {
				this.deleteStops(parseStops)
			}
		}

		if (stops) this.createStops(routeId, stops)

		if (origin || destination) this.updateRoute(routeId, origin, destination)

		const parseUpdate = [{ name: 'busType', value: busType }, { name: 'date', value: date }].filter(x => x.value !== undefined).map(x => `${x.name} = ${x.value}`).join(', ')
		
		return connection.execute(`
			UPDATE reservation
			SET ${parseUpdate}
			WHERE id = ?
		`, [id])
	}

	static deleteReservation = async (id: string) => {
		return connection.execute(`
			DELETE FROM reservation
			WHERE id = ?
		`, [id])
	}

	private static getMethodId = async (method: 'credit'|'debit'|'transfer') => {
		const [result] = await connection.execute<DBPaymentMethodId[]>(`
			SELECT id FROM paymentmethod
			WHERE name = ?
		`, [method])

		if (result.length < 1) throw new Error('Método de pago no encontrado')

		const [{ id: methodId }] = result

		return methodId
	}

	private static createPayment = async (rid: string, method: 'credit'|'debit'|'transfer') => {
		const id = Bun.randomUUIDv7()

		const methodId = await this.getMethodId(method)
		const { amount } = await this.getReservation(id)
		
		await connection.execute(`
			INSERT INTO payment (id, reservationId, methodId, amount)
			VALUES (?, ?, ?, ?)
		`, [id, rid, methodId, amount])

		return id
	}

	static makePayment = async (id: string) => {
		// const pid = await this.createPayment(id, 'credit')

		return connection.execute(`
			UPDATE reservation
			SET status = 'confirmada'
			WHERE id = ?
		`, [id])
	}
}

export default ReservationModel