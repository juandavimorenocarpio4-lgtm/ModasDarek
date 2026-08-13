const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Sirve el archivo index.html

// 1. CONEXIÓN A BASE DE DATOS (Ítem 1)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'modasdarek_db'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión a MySQL establecida correctamente.');
    }
});

// 2. APLICAR EL CRUD (Ítem 2)

// READ (Consultar productos)
app.get('/api/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// CREATE (Crear producto)
app.post('/api/productos', (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    const sql = 'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)';
    db.query(sql, [nombre, descripcion, precio], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Producto creado con éxito', id: result.insertId });
    });
});

// UPDATE (Actualizar producto)
app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    const sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?';
    db.query(sql, [nombre, descripcion, precio, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Producto actualizado con éxito' });
    });
});

// DELETE (Eliminar producto)
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Producto eliminado con éxito' });
    });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});