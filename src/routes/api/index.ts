import { Hono } from 'hono'
import reservation from './reservation'
import vehicle from './vehicle'

const api = new Hono()

api.route('/reservation', reservation)

api.route('/vehicle', vehicle)

export default api