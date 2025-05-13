import { Hono } from 'hono'
import reservation from './reservation'

const api = new Hono()

api.route('/reservation', reservation)

export default api