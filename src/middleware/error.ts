import { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'

const errorHandler: ErrorHandler = (error, c) => {
	
	if (error instanceof HTTPException) {
		const { status } = error.getResponse()

		console.error(`Error ${status}: ${error.message}`)

		return c.json({ success: false, message: error.message }, status as ContentfulStatusCode)
	}

	console.error(`Error 500: ${error.message}`)
	
	return c.json({ success: false, message: error.message }, 500)
}

export default errorHandler