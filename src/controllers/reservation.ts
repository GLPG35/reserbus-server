import { Context } from 'hono'
import ReservationModel from '../models/reservation'

class ReservationController {
	static getReservations = async (c: Context) => {
		const { id } = c.get('jwtPayload')

		const reservations = await ReservationModel.getReservations(id)

		return c.json({ data: reservations, success: true })
	}

	static getAllReservations = async(c: Context) => {
		const { id } = c.get('jwtPayload')

		const reservations = await ReservationModel.getReservations(id, true)

		return c.json({ data: reservations, success: true })
	}
	
	static createReservation = async (c: Context) => {
		const { id } = c.get('jwtPayload')
		const { origin, destination, stops, busType, date } = await c.req.json()
		
		const rid = await ReservationModel.createReservation(id, { origin, destination, stops, busType, date })
		
		return c.json({ success: true, rid })
	}

	static getReservation = async (c: Context) => {
		const { id } = c.req.param()

		const reservation = await ReservationModel.getReservation(id)
		
		return c.json({ data: reservation, success: true })
	}

	static confirmReservation = async (c: Context) => {
		const { id: uid } = c.get('jwtPayload')
		const { id } = c.req.param()
		const { duration, vehicleId, amount } = await c.req.json()

		await ReservationModel.confirmReservation(uid, id, { duration, vehicleId, amount })

		return c.json({ success: true })
	}

	static updateReservation = async (c: Context) => {
		const { id } = c.req.param()
		const { origin, destination, stops, busType, date } = await c.req.json()

		await ReservationModel.updateReservation(id, { origin, destination, stops, busType, date })

		return c.json({ success: true })
	}

	static deleteReservation = async (c: Context) => {
		const { id } = c.req.param()

		await ReservationModel.deleteReservation(id)

		return c.json({ success: true })
	}

	static makePayment = async (c: Context) => {
		const { id } = c.req.param()

		await ReservationModel.makePayment(id)

		return c.json({ success: true })
	}
}

export default ReservationController