import { Context } from 'hono'

const notFound = (c: Context) => {
	return c.json({ success: false, message: 'Route not found. Check your URL.' }, 404)
}

export default notFound