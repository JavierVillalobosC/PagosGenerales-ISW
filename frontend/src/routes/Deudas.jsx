import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/root.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';



function Deudas() {
    const [openForm, setOpenForm] = React.useState(false);
    const [rows, setRows] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [editingRow, setEditingRow] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [services, setServices] = React.useState([]);
    const [debtStates, setDebtStates] = React.useState([]);
    const { register, handleSubmit } = useForm();


    const handleEditClick = (row) => {
        console.log("row", row);
        const initialdate = row.initialdate && !isNaN(new Date(row.initialdate)) ? new Date(row.initialdate).toISOString().split('T')[0] : '';
        const finaldate = row.finaldate && !isNaN(new Date(row.finaldate)) ? new Date(row.finaldate).toISOString().split('T')[0] : '';

        setEditingRow({
            ...row,
            _id: row._id,
            initialdate,
            finaldate,
        });
        setOpen(true);
    };

    const handleOpenForm = () => {
        setOpenForm(true);
      };

      const handleCloseForm = () => {
        setOpenForm(false);
      };

      const onSubmitcreate = () => {
        const data = {...editingRow}
        axios.post('/deudas', data)
          .then((response) => {
            console.log(response);
            setOpenForm(false);
            // Aquí puedes actualizar tus datos de deudas (rows) si es necesario
          })
          .catch((error) => {
            console.error('Hubo un error al crear la deuda: ', error);
          });
      };

      const handleAddInterest = () => {
        // Aquí puedes hacer una llamada a la API para agregar intereses a las deudas de los usuarios
        // Por ejemplo:
        axios.put('/interes/')
            .then((response) => {
                console.log(response);
                // Aquí puedes actualizar tus datos de deudas (rows) si es necesario
            })
            .catch((error) => {
                console.error('Hubo un error al agregar intereses: ', error);
            });
    };

    const handleUpdate = () => {

        if (!editingRow.id) {
            console.error('No se ha seleccionado ninguna fila para editar');
            return;
        }

        const updatedRow = {
            ...editingRow,
            userId: users.find(user => user.username === editingRow.username).id,
            serviceId: services.find(service => service.name === editingRow.service).id,
            estadoId: debtStates.find(debtState => debtState.name === editingRow.estado).id,
        };

        axios.put(`/deudas/${editingRow.id}`, updatedRow)
        .then((response) => {
            console.log(response); // Imprime la respuesta de la API

            // Actualizar la lista de deudas después de la actualización
            axios.get('/deudas')
                .then((response) => {
                    setRows(response.data);
                })
                .catch((error) => {
                    console.error('Hubo un error al obtener las deudas: ', error);
                });
        })
        .catch((error) => {
            console.error('Hubo un error al actualizar la deuda: ', error);
        });
};

      const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'username', headerName: 'Usuario', width: 130 },
        { field: 'amount', headerName: 'Monto Deuda (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
        { field: 'valor_cuota', headerName: 'Valor Cuota (CLP)', width: 150, valueFormatter: (params) => `$${params.value}` },
        { field: 'initialdate', headerName: 'Fecha Inicio', width: 130, valueFormatter: (params) => new Date(params.value).toLocaleDateString('es-CL') },
        { field: 'finaldate', headerName: 'Fecha Final', width: 130, valueFormatter: (params) => new Date(params.value).toLocaleDateString('es-CL') },
        { field: 'service', headerName: 'Servicio', width: 130 },
        { field: 'estado', headerName: 'Estado', width: 130 },
        { field: 'interestApplied', headerName: 'Interés Aplicado', width: 150 },
        { field: 'blacklisted', headerName: 'En lista negra', width: 130 },
        // add more columns as needed
        {
            field: 'edit',
            headerName: 'Editar',
            flex: 1,
            renderCell: (params) => (
              <IconButton
                color="primary"
                onClick={() => handleEditClick(params.row)}
              >
                <EditIcon />
              </IconButton>
            ),
          },
    ];

    React.useEffect(() => {

        axios.get('/users')
            .then((response) => {
                const usersData = response.data.data;
                setUsers(usersData);
            })
            .catch((error) => {
                console.error('Hubo un error al obtener los datos de los usuarios: ', error);
            });

        axios.get('/categorias')
            .then((response) => {
                const servicesData = response.data.data;
                setServices(servicesData);
            })
            .catch((error) => {
                console.error('Hubo un error al obtener los datos de los servicios: ', error);
            });

        axios.get('/debstates')
            .then((response) => {
                const debtStatesData = response.data.data;
                setDebtStates(debtStatesData);
            })
            .catch((error) => {
                console.error('Hubo un error al obtener los datos de los estados de deuda: ', error);
            });


        axios.get('/deudas')
            .then((response) => {
                const debts = response.data.data;
                const servicePromises = debts.map(debt =>
                    axios.get(`/categorias/${debt.idService}`)
                );
                const statePromises = debts.map(debt =>
                    axios.get(`/debstates/${debt.estado}`)
                );

                Promise.all([...servicePromises, ...statePromises])
                    .then(responses => {
                        const serviceResponses = responses.slice(0, debts.length);
                        const stateResponses = responses.slice(debts.length);
                        const rows = debts.map((debt, index) => {
                            const serviceResponse = serviceResponses[index];
                            const stateResponse = stateResponses[index];
                            const serviceName = serviceResponse.data && serviceResponse.data.data && serviceResponse.data.data.name ? serviceResponse.data.data.name : 'Nombre no disponible';
                            const stateName = stateResponse.data && stateResponse.data.data && stateResponse.data.data.name ? stateResponse.data.data.name : 'Nombre no disponible';
                            const initialdate = new Date(debt.initialdate).toISOString().split('T')[0];
                            const finaldate = new Date(debt.finaldate).toISOString().split('T')[0];
                            return {
                                id: debt.id,
                                username: debt.user.username,
                                amount: debt.amount,
                                valor_cuota: debt.valorcuota,
                                initialdate,
                                finaldate,
                                service: serviceName,
                                estado: stateName,
                                interestApplied: debt.interestApplied ? 'Sí' : 'No',
                                blacklisted: debt.user.blacklisted ? 'Sí' : 'No',
                                // add more fields as needed
                            };
                        });

                        setRows(rows);
                    });
            })
            .catch((error) => {
                console.error('Hubo un error al obtener los datos de las deudas: ', error);
            });
    }, []);

    console.log("editingRow", editingRow);

    return (
        <div style={{ backgroundColor: 'white',
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'  }}>
            <IconButton color="primary" onClick={handleOpenForm}>
      <AddIcon />
    </IconButton>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                checkboxSelection
            />
            <Dialog open={openForm} onClose={handleCloseForm}>
    <DialogTitle>Crear Deuda</DialogTitle>
    <form onSubmit={handleSubmit(onSubmitcreate)}>
      <DialogContent>
      <FormLabel component="legend">Usuario</FormLabel>
                <FormControl fullWidth>
                <Select
                    autoFocus
                    margin="dense"
                    id="username"
                    value={editingRow ? editingRow.username : ''}
                    onChange={(event) => setEditingRow({ ...editingRow, username: event.target.value })}
                >
        {users.map((user) => (
    <MenuItem key={user.username} value={user.username}>
        {user.username}
    </MenuItem>
))}
    </Select>
</FormControl>
<FormLabel component="legend">Monto Deuda (CLP)</FormLabel>
<FormControl fullWidth>
                    <TextField
                        margin="dense"
                        id="amount"
                        type="number"
                        fullWidth
                        value={editingRow ? editingRow.amount : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, amount: event.target.value })}
                    />
                    </FormControl>
                    <FormLabel component="legend">Fecha Inicial</FormLabel>
<FormControl fullWidth>
                    <TextField
                        id="initialdate"
                        type="date"
                        defaultValue={editingRow ? editingRow.initialdate : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, initialdate: event.target.value })}
                        InputLabelProps={{
                          shrink: true,
                        }}
                    />
                    </FormControl>
                    <FormLabel component="legend">Fecha Final</FormLabel>
                    <FormControl fullWidth>
                    <TextField
                        id="finaldate"
                        type="date"
                        defaultValue={editingRow ? editingRow.finaldate : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, finaldate: event.target.value })}
                        InputLabelProps={{
                          shrink: true,
                        }}
                    />
                    </FormControl>
                    <FormLabel component="legend">Servicio</FormLabel>
                    <FormControl fullWidth>
                    <Select
                        margin="dense"
                        id="service"
                        value={editingRow ? editingRow.service : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, service: event.target.value })}
                    >
                        {services.map((service) => (
    <MenuItem key={service.name} value={service.name}>
        {service.name}
    </MenuItem>
))}
                    </Select>
                    </FormControl>
                    <FormLabel component="legend">Estado</FormLabel>
<FormControl fullWidth>
    <Select
        id="estado"
        value={editingRow ? editingRow.estado : ''}
        onChange={(event) => setEditingRow({ ...editingRow, estado: event.target.value })}
    >
        {debtStates.map((debtState) => (
    <MenuItem key={debtState.name} value={debtState.name}>
        {debtState.name}
    </MenuItem>
))}
    </Select>
</FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseForm}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </DialogActions>
    </form>
</Dialog>


            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Editar Deuda</DialogTitle>
                <DialogContent>
                <FormLabel component="legend">Usuario</FormLabel>
                <FormControl fullWidth>
                <Select
                    autoFocus
                    margin="dense"
                    id="username"
                    value={editingRow ? editingRow.username : ''}
                    onChange={(event) => setEditingRow({ ...editingRow, username: event.target.value })}
                >
        {users.map((user) => (
    <MenuItem key={user.username} value={user.username}>
        {user.username}
    </MenuItem>
))}
    </Select>
</FormControl>
<FormLabel component="legend">Monto Deuda (CLP)</FormLabel>
<FormControl fullWidth>
                    <TextField
                        margin="dense"
                        id="amount"
                        type="number"
                        fullWidth
                        value={editingRow ? editingRow.amount : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, amount: event.target.value })}
                    />
                    </FormControl>
                    <FormLabel component="legend">Fecha Inicial</FormLabel>
<FormControl fullWidth>
                    <TextField
                        id="initialdate"
                        type="date"
                        defaultValue={editingRow ? editingRow.initialdate : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, initialdate: event.target.value })}
                        InputLabelProps={{
                          shrink: true,
                        }}
                    />
                    </FormControl>
                    <FormLabel component="legend">Fecha Final</FormLabel>
                    <FormControl fullWidth>
                    <TextField
                        id="finaldate"
                        type="date"
                        defaultValue={editingRow ? editingRow.finaldate : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, finaldate: event.target.value })}
                        InputLabelProps={{
                          shrink: true,
                        }}
                    />
                    </FormControl>
                    <FormLabel component="legend">Servicio</FormLabel>
                    <FormControl fullWidth>
                    <Select
                        margin="dense"
                        id="service"
                        value={editingRow ? editingRow.service : ''}
                        onChange={(event) => setEditingRow({ ...editingRow, service: event.target.value })}
                    >
                        {services.map((service) => (
    <MenuItem key={service.name} value={service.name}>
        {service.name}
    </MenuItem>
))}
                    </Select>
                    </FormControl>
                    <FormLabel component="legend">Estado</FormLabel>
<FormControl fullWidth>
    <Select
        id="estado"
        value={editingRow ? editingRow.estado : ''}
        onChange={(event) => setEditingRow({ ...editingRow, estado: event.target.value })}
    >
        {debtStates.map((debtState) => (
    <MenuItem key={debtState.name} value={debtState.name}>
        {debtState.name}
    </MenuItem>
))}
    </Select>
</FormControl>
                    {/* Repite para cada campo que quieras editar */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        // Aquí puedes manejar la actualización de la deuda
                        handleUpdate();
                        setOpen(false);
                    }}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Deudas;