import { Response } from 'express';
import { db } from '../config/firebase';

type EntryType = {
    responsableName: string,
    deliveryEstimatedDate: Date
  }
  
  type Request = {
    body: EntryType,
    params: { entryId: number }
  }

  const setVehicle = async (req: Request, res: Response) => {
    const { body: { responsableName, deliveryEstimatedDate}, params: { entryId } } = req
    try {
      console.log("Entro a funcioón");
      console.log("El parametro es ",entryId);
      console.log("El body es ", req.body);
      const vehicle = db.ref('vehicles/' + entryId);
      const vehicleObject = {
        responsableName,
        deliveryEstimatedDate
      }
  
      vehicle.update(vehicleObject)
  
      res.status(200).send({
        status: 'success',
        message: 'entry added successfully',
        data: vehicleObject
      })
    } catch(error) {
        console.log("Error en setVehicle ",error)
        res.status(500).json(error.message)
    }
  }

  const getVehicles = async (req: Request,res: Response) => {
    console.log("Entro a los servicios");
    try {
        let data = await db.ref('vehicles/').once('value', snapshot => {
            console.log("Data de firebase ",snapshot.val());
            return snapshot.val();
        });
        console.log("Var Data ", data);
        res.status(200).send(data)
    } catch(error) {
        console.log("Error ",error);
        res.status(500).json(error.message)
    }
  }


  
  export { setVehicle , getVehicles}