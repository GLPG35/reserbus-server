import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { secureHeaders } from 'hono/secure-headers'
import errorHandler from './middleware/error'
import notFound from './middleware/notFound'
import api from './routes/api'
import auth from './routes/auth'
import { logger } from 'hono/logger'

const app = new Hono({ strict: false })

const corsOptions = {
	origin: process.env.CLIENT_URL as string,
	credentials: true
}

const jwtOptions = {
	secret: process.env.SECRET as string,
	cookie: 'jwtCookie'
}

app.use('/api/*', cors(corsOptions))
app.use('/auth/*', cors(corsOptions))

app.use(secureHeaders())

app.use('/api/*', jwt(jwtOptions))
app.get('/auth/*', jwt(jwtOptions))

app.onError(errorHandler)
app.notFound(notFound)
app.use(logger())

app.route('/api', api)
app.route('/auth', auth)

export default {
	port: process.env.PORT,
	fetch: app.fetch
}
