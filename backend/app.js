const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});

// Rutas para clientes
// GET para obtener todos los clientes
app.get('/clientes', (req, res) => {
    connection.query('SELECT * FROM Clientes', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST para crear un nuevo cliente
app.post('/clientes', (req, res) => {
    const { nombre, telefono, email } = req.body;
    connection.query(
        'INSERT INTO Clientes (nombre, telefono, email) VALUES (?, ?, ?)',
        [nombre, telefono, email],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: results.insertId });
        }
    );
});

// DELETE para eliminar un cliente por su ID
app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM Clientes WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cliente eliminado correctamente' });
    });
});

// PUT para actualizar un cliente por su ID
app.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, email } = req.body;
    connection.query(
        'UPDATE Clientes SET nombre = ?, telefono = ?, email = ? WHERE id = ?',
        [nombre, telefono, email, id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Cliente actualizado correctamente' });
        }
    );
});

// Rutas para citas
app.post('/citas', (req, res) => {
    console.log('Backend - Body completo recibido:', req.body);
    const { cliente_id, fecha, hora, servicio } = req.body;

    // Validaciones adicionales
    if (!cliente_id || !fecha || !hora || !servicio) {
        console.log('Campos faltantes:', { cliente_id, fecha, hora, servicio });
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Asegurarse de que el servicio no exceda los 30 caracteres
    if (servicio.length > 30) {
        return res.status(400).json({ error: 'El nombre del servicio es demasiado largo' });
    }

    const citaData = {
        cliente_id: parseInt(cliente_id),
        fecha,
        hora,
        servicio,
        estado: 'Pendiente'
    };

    console.log('Datos a insertar:', citaData);

    connection.query(
        'INSERT INTO citas (cliente_id, fecha, hora, servicio, estado) VALUES (?, ?, ?, ?, ?)',
        [citaData.cliente_id, citaData.fecha, citaData.hora, citaData.servicio, citaData.estado],
        (err, results) => {
            if (err) {
                console.error('Error SQL específico:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Inserción exitosa:', results);
            res.json({ id: results.insertId });
        }
    );
});

// GET para obtener todas las citas
app.get('/citas', (req, res) => {
    connection.query('SELECT * FROM Citas', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Formatear la fecha y hora antes de enviar la respuesta
        const citasFormateadas = results.map(cita => ({
            ...cita,
            fecha: new Date(cita.fecha).toISOString().split('T')[0],
            hora: cita.hora
        }));

        res.json(citasFormateadas);
    });
});

// GET para obtener una cita por su ID
app.get('/citas/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM Citas WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // Formatear la fecha antes de enviar la respuesta
        const citaFormateada = {
            ...results[0],
            fecha: new Date(results[0].fecha).toISOString().split('T')[0]
        };

        res.json(citaFormateada);
    });
});

// DELETE para eliminar una cita por su ID
app.delete('/citas/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM Citas WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cita eliminada correctamente' });
    });
});

// PUT para actualizar una cita por su ID
app.put('/citas/:id', (req, res) => {
    const { id } = req.params;
    const { cliente_id, fecha, hora, estado, servicio } = req.body;

    console.log('Datos recibidos en el backend:', req.body);

    connection.query(
        'UPDATE Citas SET cliente_id = ?, fecha = ?, hora = ?, estado = ?, servicio = ? WHERE id = ?',
        [cliente_id, fecha, hora, estado, servicio, id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Cita actualizada correctamente' });
        }
    );
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});