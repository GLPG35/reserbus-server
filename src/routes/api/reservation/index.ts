import { Hono } from 'hono'
import ReservationController from '../../../controllers/reservation'

const reservation = new Hono()

reservation.get('/', ReservationController.getReservations)

reservation.get('/all', ReservationController.getAllReservations)

reservation.get('/:id', ReservationController.getReservation)

reservation.post('/', ReservationController.createReservation)

reservation.post('/payment/:id', ReservationController.makePayment)

reservation.patch('/confirm/:id', ReservationController.confirmReservation)

reservation.patch('/:id', ReservationController.updateReservation)

reservation.delete('/:id', ReservationController.deleteReservation)


export default reservation