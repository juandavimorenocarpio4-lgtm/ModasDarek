// ==========================================================
// PROYECTO: ModasDarek - Backend Servidor REST
// ACTIVIDAD: GA7-220501096-AA3-EV01
// DESCRIPCIÓN: Implementación de framework Express.js,
// conexión a MySQL y documentación mediante comentarios.
// ==========================================================

// Importación de módulos y frameworks
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Inicialización de la aplicación Express
const app = express();

// Configuración de middlewares
app.use(cors()); // Habilita solicitudes de origen cruzado
app.use(express.json()); // Parsea solicitudes entrantes con JSON
app.use(express.static('./')); // Servidor de archivos estáticos (index.html)

// ==========================================================
// 1. CONFIGURACIÓN Y INTEGRACIÓN DE BASE DE DATOS (MYSQL)
// ==========================================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'modasdarek_db'
});

// Verificación de estado de conexión al motor de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos MySQL:', err);
    } else {
        console.log('Conexión a MySQL establecida correctamente.');
    }
});

// ==========================================================
// 2. RUTAS Y LÓGICA DE NEGOCIO (OPERACIONES CRUD)
// ==========================================================

// RUTA 1: Consultar lista completa de productos (READ - GET)
app.get('/api/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// RUTA 2: Registrar un nuevo producto (CREATE - POST)
app.post('/api/productos', (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    const sql = 'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)';
    db.query(sql, [nombre, descripcion, precio], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Producto creado con éxito', id: result.insertId });
    });
});

// RUTA 3: Actualizar la información de un producto (UPDATE - PUT)
app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    const sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?';
    db.query(sql, [nombre, descripcion, precio, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Producto actualizado con éxito' });
    });
});

// RUTA 4: Eliminar un registro de producto (DELETE - DELETE)
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ mensaje: 'Producto eliminado con éxito' });
    });
});

// ==========================================================
// 3. INICIALIZACIÓN DEL SERVIDOR WEB
// ==========================================================
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});