import 'date-fns';
import { useState, useEffect } from 'react';
import {Container,AppBar,Box,TableContainer,Table,TableHead,TableRow,TableCell,TableBody,CircularProgress} from '@material-ui/core';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider,KeyboardDatePicker} from '@material-ui/pickers';

interface Vehicle {
    id?: number;
    make?: string;
    model?: string;
    description?: string;
    image?: string;
    km?: number;
    estimatedate?: Date;
    responsableName?: string;
    deliveryEstimatedDate?: Date;
}

function List() {

    const [loading, setLoading] = useState<boolean>(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [open, setOpen] = useState(false);
    const [responsableName, setResponsableName] = useState<string>('');
    const [itemSelected, setItemSelected] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<Date | null>();
    const [errors,setErrors] = useState({} as any);


    useEffect(() => {
        loadData()
    }, []);

    const loadData = () => {
        axios.get('https://us-central1-vehicles-stock.cloudfunctions.net/app/vehicles').then( response => {
            let data = response.data;
            setLoading(false);
            setVehicles(data);
        }).catch( error => {
            console.log("Hubo un error.",error)
        });
    }

    const handleClose = () => {
        setOpen(false);
    };

    const handleClick = (item: [string,Vehicle]) => {
        setOpen(true);
        setErrors({});
        setItemSelected(item[0]);
        setResponsableName(Object.prototype.hasOwnProperty.call(item[1], "responsableName") ? item[1].responsableName! : "");
        setSelectedDate(Object.prototype.hasOwnProperty.call(item[1], "deliveryEstimatedDate") ? item[1].deliveryEstimatedDate! : null)
    } 

    const validaForm = () => {      
        let errorMessages: any = {}

        if(responsableName===""){
            errorMessages.responsableName = "Responsable name required."
        }
        if(selectedDate === null){
            errorMessages.deliveryEstimatedDate = "Delivery estimated date required."
        }
        return errorMessages;
    }

    const handleSave = () => {
        let errors = validaForm();
        if(Object.keys(errors).length > 0){
            setErrors(errors);
        }else { 
            setLoading(true);
            const data = {
                responsableName: responsableName,
                deliveryEstimatedDate: selectedDate
            }
            axios.post(
                `https://us-central1-vehicles-stock.cloudfunctions.net/app/sendMaintenance/${itemSelected}`,
                data
            ).then( response => {
                loadData()
                setOpen(false);
            }).catch( error => {
                console.log("Hubo un error.",error);
                setOpen(false);
            });
        }
    }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <Container fixed>
        <AppBar position="static" >
           <Box textAlign="center" m={2}>List of vehicles</Box> 
        </AppBar>  
        <Box textAlign="center" m={5}>
        {
            loading === true && 
            <CircularProgress />
        }
        </Box>
        <TableContainer>
            <Table>
                <TableHead>
                <TableRow>
                    <TableCell align="center">ID</TableCell>
                    <TableCell align="center">Imagen</TableCell>
                    <TableCell align="center">Marca</TableCell>
                    <TableCell align="center">Submarca</TableCell>
                    <TableCell align="center">Descripción</TableCell>
                    <TableCell align="center">Fecha programada</TableCell>
                    <TableCell align="center">Km actual</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {Object.entries(vehicles).map( newData => {
                    return (
                    <TableRow key={newData[0]} onClick={()=> handleClick(newData)} hover={true} className={`${newData[1].responsableName !== undefined ? 'maintenance' : ''} `}>
                    <TableCell align="center" component="th" scope="row"> {newData[1].id}</TableCell>
                    <TableCell align="center"><img style={{objectFit: "contain",width: "100px"}} alt={newData[1].image} src={newData[1].image} /></TableCell>
                    <TableCell align="center">{newData[1].make}</TableCell>
                    <TableCell align="center">{newData[1].model}</TableCell>
                    <TableCell align="center">{newData[1].description}</TableCell>
                    <TableCell align="center">{newData[1].estimatedate}</TableCell>
                    <TableCell align="center">{newData[1].km}</TableCell>
                    </TableRow>)
                    })}
                </TableBody>
            </Table>
        </TableContainer>
        
         <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Maintenance</DialogTitle>
            <DialogContent>
            <DialogContentText>
                Enter the name of person responsable and the delivery estimated date, please.
            </DialogContentText>
                <form noValidate autoComplete="off">
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Responsable name"
                        type="text"
                        value={responsableName}
                        onChange={(event) => {setResponsableName(event.target.value)}}
                        fullWidth
                        error={errors.responsableName}
                    />
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="dd/MM/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Delivery estimated date"
                        value={selectedDate}
                        onChange={(date) => {setSelectedDate(date)}}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        error={errors.deliveryEstimatedDate}
                        />
                </form>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
                Send
            </Button>
            </DialogActions>
        </Dialog> 
        
    </Container>
    </MuiPickersUtilsProvider>
  );
}

export default List;