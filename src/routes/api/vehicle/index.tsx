import { Hono } from 'hono'
import VehicleController from '../../../controllers/vehicle'

const vehicle = new Hono()

vehicle.get('/', VehicleController.getVehicles)

vehicle.post('/', VehicleController.addVehicle)

export default vehicle