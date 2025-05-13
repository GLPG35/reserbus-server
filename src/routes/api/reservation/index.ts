import { Hono } from 'hono'
import ReservationController from '../../../controllers/reservation'

const reservation = new Hono()

reservation.get('/', ReservationController.getReservations)

reservation.post('/', ReservationController.createReservation)

reservation.get('/:id', ReservationController.getReservation)

reservation.patch('/:id', ReservationController.updateReservation)

reservation.delete('/:id', ReservationController.deleteReservation)

export default reservation