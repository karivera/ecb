import * as functions from 'firebase-functions'
import * as express from 'express'
import { getVehicles, setVehicle } from './controllers/vehicles.controller'

const cors = require("cors")
const app = express()

app.use(cors({ origin: true }))
app.get('/', (req, res) => res.status(200).send('Services'))
app.post('/sendMaintenance/:entryId', setVehicle)
app.get('/vehicles', getVehicles)
exports.app = functions.https.onRequest(app);