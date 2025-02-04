import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css'; 
import BASE_URL from './config';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = () => {
        axios.get(`${BASE_URL}/clientes`)
            .then(response => setClientes(response.data))
            .catch(error => console.error(error));
    };

    const agregarCliente = () => {
        axios.post(`${BASE_URL}/clientes`, { nombre, telefono, email })
            .then(response => {
                setClientes([...clientes, { id: response.data.id, nombre, telefono, email }]);
                setNombre('');
                setTelefono('');
                setEmail('');
            })
            .catch(error => console.error(error));
    };

    const eliminarCliente = (id) => {
        axios.delete(`${BASE_URL}/clientes/${id}`)
            .then(() => {
                setClientes(clientes.filter(cliente => cliente.id !== id));
            })
            .catch(error => console.error(error));
    };

    const editarCliente = (cliente) => {
        setEditando(cliente);
        setNombre(cliente.nombre);
        setTelefono(cliente.telefono);
        setEmail(cliente.email);
    };

    const actualizarCliente = () => {
        axios.put(`${BASE_URL}/clientes/${editando.id}`, { nombre, telefono, email })
            .then(() => {
                fetchClientes();
                setEditando(null);
                setNombre('');
                setTelefono('');
                setEmail('');
            })
            .catch(error => console.error(error));
    };

    return (
        <div className="container">
            <h1>Clientes</h1>
            <Link to="/citas">Agendar Cita</Link>
            <div className="clientes-layout">
                <div className="clientes-lista">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map(cliente => (
                                <tr key={cliente.id}>
                                    <td>{cliente.nombre}</td>
                                    <td>{cliente.telefono}</td>
                                    <td>{cliente.email}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="edit" onClick={() => editarCliente(cliente)}>Editar</button>
                                            <button className="delete" onClick={() => eliminarCliente(cliente.id)}>Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="clientes-formulario">
                    <h2>{editando ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
                    <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {editando ? (
                        <button className="primary" onClick={actualizarCliente}>Actualizar Cliente</button>
                    ) : (
                        <button className="primary" onClick={agregarCliente}>Agregar Cliente</button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Citas() {
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [servicios, setServicios] = useState([]); 
    const [cliente_id, setClienteId] = useState('');
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [servicio, setServicio] = useState(''); 
    const [estado, setEstado] = useState('Pendiente');
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        fetchCitas();
        fetchClientes();
        fetchServicios();
    }, []);

    const fetchCitas = () => {
        axios.get(`${BASE_URL}/citas`)
            .then(response => setCitas(response.data))
            .catch(error => console.error(error));
    };

    const fetchClientes = () => {
        axios.get(`${BASE_URL}/clientes`)
            .then(response => setClientes(response.data))
            .catch(error => console.error(error));
    };

    const fetchServicios = () => {

        const serviciosEjemplo = [
            { id: 1, nombre: 'Corte de cabello' },
            { id: 2, nombre: 'Coloración' },
            { id: 3, nombre: 'Manicura' },
            { id: 4, nombre: 'Pedicura' },
        ];
        setServicios(serviciosEjemplo);
    };

    const agendarCita = () => {
        const citaData = {
            cliente_id: parseInt(cliente_id),
            fecha: fecha,
            hora: hora,
            servicio: servicio,
            estado: estado
        };

        console.log('Frontend - Datos antes de enviar:', citaData);

        axios.post(`${BASE_URL}/citas`, citaData)
            .then(response => {
                setCitas([...citas, { id: response.data.id, ...citaData }]);
                setClienteId('');
                setFecha('');
                setHora('');
                setServicio('');
                setEstado('Pendiente');
            })
            .catch(error => {
                console.error('Error completo:', error);
                alert('Error al agendar la cita: ' + (error.response?.data?.error || error.message));
            });
    };

    const eliminarCita = (id) => {
        axios.delete(`${BASE_URL}/citas/${id}`)
            .then(() => {
                setCitas(citas.filter(cita => cita.id !== id));
            })
            .catch(error => console.error(error));
    };

    const editarCita = (cita) => {
        setEditando(cita);
        setClienteId(cita.cliente_id);
        setFecha(cita.fecha.split('T')[0]);
        setHora(cita.hora);
        setServicio(cita.servicio);
        setEstado(cita.estado);
    };

    const actualizarCita = () => {
        const citaActualizada = {
            cliente_id: parseInt(cliente_id),
            fecha: fecha,
            hora: hora,
            servicio: servicio,
            estado: estado
        };

        axios.put(`${BASE_URL}/citas/${editando.id}`, citaActualizada)
            .then(() => {
                fetchCitas();
                setEditando(null);
                setClienteId('');
                setFecha('');
                setHora('');
                setServicio('');
                setEstado('Pendiente');
            })
            .catch(error => {
                console.error('Error al actualizar la cita:', error);
                alert('Error al actualizar la cita: ' + (error.response?.data?.error || error.message));
            });
    };

    const getNombreCliente = (cliente_id) => {
        const cliente = clientes.find(cliente => cliente.id === cliente_id);
        return cliente ? cliente.nombre : 'Cliente no encontrado';
    };

    return (
        <div className="container">
            <h1>Citas</h1>
            <div className="citas-layout">
                <div className="citas-lista">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Servicio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map(cita => {
                                const fechaFormateada = cita.fecha.split('T')[0];
                                return (
                                    <tr key={cita.id}>
                                        <td>{getNombreCliente(cita.cliente_id)}</td>
                                        <td>{fechaFormateada}</td>
                                        <td>{cita.hora}</td>
                                        <td>{cita.servicio}</td>
                                        <td>
                                            <span className={`estado ${cita.estado.toLowerCase()}`}>
                                                {cita.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button className="Cancelar">Marcar como completada</button>
                                                <button className="edit" onClick={() => editarCita(cita)}>Editar</button>
                                                <button className="delete" onClick={() => eliminarCita(cita.id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="citas-formulario">
                    <h2>{editando ? 'Editar Cita' : 'Agendar Cita'}</h2>
                    <select value={cliente_id} onChange={(e) => setClienteId(e.target.value)}>
                        <option value="">Seleccione un cliente</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                        ))}
                    </select>
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                    <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
                        <option value="">Seleccione un servicio</option>
                        {servicios.map(servicio => (
                            <option key={servicio.id} value={servicio.nombre}>{servicio.nombre}</option>
                        ))}
                    </select>
                    {editando ? (
                        <button className="primary" onClick={actualizarCita}>Actualizar Cita</button>
                    ) : (
                        <button className="primary" onClick={agendarCita}>Agendar Cita</button>
                    )}
                </div>
            </div>
            <Link to="/">Volver a Clientes</Link>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Clientes />} />
                <Route path="/citas" element={<Citas />} />
            </Routes>
        </Router>
    );
}

export default App;