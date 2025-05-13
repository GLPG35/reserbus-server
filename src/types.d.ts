import { RowDataPacket } from 'mysql2';

interface DBUser extends RowDataPacket {
	id: string,
	name: string,
	lastname: string,
	email: string,
	ci: number,
	password: string
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

interface User {
	id: string,
	name: string,
	lastname: string,
	email: string,
	ci: number
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
	tel: string
}

interface CreateReservation {
	origin: string,
	destination: string,
	stops?: string[],
	date: string,
	busType: string
}

interface UpdateReservation {
	origin?: string,
	destination?: string,
	stops?: string[],
	date?: string,
	busType?: string
}

interface TripUser extends CreateReservation {
	user: CreateUser
}