import { CreateReservation, DBReservation, UpdateReservation } from '../types'
import { connection } from './database/db'

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

	static getReservations = async (uid: string) => {
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
			WHERE reservation.userId = ?
			GROUP BY reservation.id;
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
			WHERE reservation.id = ?;
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
}

export default ReservationModel