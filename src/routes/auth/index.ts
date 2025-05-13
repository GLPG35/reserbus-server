import { Hono } from 'hono'
import AuthController from '../../controllers/auth'

const auth = new Hono()

auth.get('/', AuthController.check)

auth.post('/', AuthController.login)

auth.get('/logout', AuthController.logout)

auth.post('/email', AuthController.checkEmail)

auth.post('/register', AuthController.createUser)

auth.post('/register/reservation', AuthController.createTripUser)

export default auth