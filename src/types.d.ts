import { RowDataPacket } from 'mysql2';

interface DBUser extends RowDataPacket {
	id: string,
	name: string,
	lastname: string,
	email: string,
	ci: number,
	password: string,
	role: 'user'|'admin'
}

interface DBReservation extends RowDataPacket {
	id: string,
	routeId: string,
	vehicleId: null|string,
	vehicleType: 'bus'|'microbus'|'minibus',
	createdAt: string,
	tripDate: string,
	status: 'pendiente'|'confirmada'|'cancelada',
	amount: null|number,
	origin: string,
	destination: string,
	duration: null|number,
	stops: null|string
}

interface DBVehicle extends RowDataPacket {
	id: string,
	type: 'bus'|'microbus'|'minibus',
	capacity: number,
	availableTime: string,
	createdAt: string
}

interface DBPaymentMethod extends RowDataPacket {
	id: string,
	reservationId: string,
	methodId: string,
	amount: number,
	createdAt: string
}

interface DBPaymentMethodId extends RowDataPacket {
	id: string
}

interface User {
	id: string,
	name: string,
	lastname: string,
	email: string,
	ci: number,
	role: 'user'|'admin'
}

interface UserWithToken extends User {
	token: string
}

interface CreateUser {
	name: string,
	lastname: string,
	email: string,
	ci: number,
	password: string,
	tel: string,
	role?: 'user'|'admin'
}

interface CreateReservation {
	origin: string,
	destination: string,
	stops?: string[],
	date: string,
	busType: string
}

interface ConfirmReservation {
	duration: number,
	vehicleId: string,
	amount: number
}

interface UpdateReservation {
	origin?: string,
	destination?: string,
	stops?: string[],
	date?: string,
	busType?: string
}

interface RouteId extends RowDataPacket {
	routeId: string
}

interface TripUser extends CreateReservation {
	user: CreateUser
}

interface AddVehicle {
	type: 'bus'|'minibus'|'microbus',
	capacity: string,
	availableTime: string
}