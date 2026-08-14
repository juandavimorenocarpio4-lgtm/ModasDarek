const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'tienda_ropa_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ ERROR MYSQL:', err.message);
        console.error('💡 Verifica que MySQL esté activo y contraseña sea: 1234');
        process.exit(1);
    }
    console.log('✅ CONECTADO A BASE DE DATOS');
});

app.post('/api/login', (req, res) => {
    const { usuario, contrasena } = req.body;
    db.query('SELECT * FROM ADMINISTRADOR WHERE usuario = ? AND contrasena = ?', 
        [usuario, contrasena], (err, resultados) => {
            if (err) return res.status(500).json({ error: 'Error en servidor' });
            if (resultados.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
            res.json({ exito: true, usuario: resultados[0] });
        });
});

app.get('/api/categorias', (req, res) => {
    db.query('SELECT * FROM CATEGORIA WHERE estado = "activa" ORDER BY nombre', (err, datos) => {
        if (err) return res.status(500).json({ error: 'Error al cargar categorías' });
        res.json(datos);
    });
});

app.post('/api/categorias', (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es obligatorio' });
    db.query('INSERT INTO CATEGORIA (nombre, descripcion) VALUES (?, ?)', 
        [nombre.trim(), descripcion || ''], (err, result) => {
            if (err) return res.status(500).json({ error: 'Categoría ya existe' });
            res.status(201).json({ mensaje: 'Categoría registrada', id: result.insertId });
        });
});

app.get('/api/productos', (req, res) => {
    const { busqueda = '', categoria = '' } = req.query;
    let sql = `SELECT p.*, c.nombre AS nombre_categoria FROM PRODUCTO p JOIN CATEGORIA c ON p.id_categoria = c.id_categoria WHERE p.estado != 'inactivo'`;
    let params = [];
    if (busqueda) { sql += ' AND p.nombre LIKE ?'; params.push(`%${busqueda}%`); }
    if (categoria) { sql += ' AND p.id_categoria = ?'; params.push(categoria); }
    sql += ' ORDER BY p.nombre';
    db.query(sql, params, (err, datos) => {
        if (err) return res.status(500).json({ error: 'Error al cargar productos' });
        res.json(datos);
    });
});

app.post('/api/productos', (req, res) => {
    const { nombre, descripcion, precio, talla, color, stock, id_categoria } = req.body;
    if (!nombre || !precio || !talla || !color || stock === undefined || !id_categoria) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
    }
    if (precio <= 0) return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    if (stock < 0) return res.status(400).json({ error: 'El stock no puede ser negativo' });

    db.query(`INSERT INTO PRODUCTO (nombre, descripcion, precio, talla, color, stock, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [nombre.trim(), descripcion || '', precio, talla, color, stock, id_categoria], 
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al registrar producto' });
            res.status(201).json({ mensaje: 'Producto registrado', id: result.insertId });
        });
});

app.get('/api/clientes', (req, res) => {
    db.query('SELECT * FROM CLIENTE ORDER BY apellido, nombre', (err, datos) => {
        if (err) return res.status(500).json({ error: 'Error al cargar clientes' });
        res.json(datos);
    });
});

app.post('/api/clientes', (req, res) => {
    const { nombre, apellido, correo, telefono, direccion } = req.body;
    if (!nombre || !apellido || !correo) return res.status(400).json({ error: 'Nombre, apellido y correo obligatorios' });
    db.query(`INSERT INTO CLIENTE (nombre, apellido, correo, telefono, direccion) VALUES (?, ?, ?, ?, ?)`, 
        [nombre.trim(), apellido.trim(), correo.trim(), telefono || '', direccion || ''], 
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Correo ya registrado' });
            res.status(201).json({ mensaje: 'Cliente registrado', id: result.insertId });
        });
});

app.get('/api/ventas', (req, res) => {
    db.query(`SELECT v.*, CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre FROM VENTA v JOIN CLIENTE c ON v.id_cliente = c.id_cliente ORDER BY v.fecha DESC`, 
        (err, datos) => {
            if (err) return res.status(500).json({ error: 'Error al cargar ventas' });
            res.json(datos);
        });
});

app.get('/api/ventas/:id', (req, res) => {
    db.query(`SELECT dv.*, p.nombre FROM DETALLE_VENTA dv JOIN PRODUCTO p ON dv.id_producto = p.id_producto WHERE dv.id_venta = ?`, 
        [req.params.id], (err, datos) => {
            if (err) return res.status(500).json({ error: 'Error al cargar detalle' });
            res.json(datos);
        });
});

app.post('/api/ventas', (req, res) => {
    const { id_cliente, productos } = req.body;
    if (!id_cliente || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Cliente y productos obligatorios' });
    }

    let totalVenta = 0;
    const verificarStock = (i, callback) => {
        if (i >= productos.length) return callback(null, totalVenta);
        const prod = productos[i];
        db.query('SELECT nombre, precio, stock FROM PRODUCTO WHERE id_producto = ?', [prod.id_producto], (err, res) => {
            if (err || res.length === 0) return callback('Producto no encontrado');
            const { precio, stock, nombre } = res[0];
            if (prod.cantidad > stock) return callback(`Stock insuficiente: ${nombre} (disponible: ${stock})`);
            prod.precio_unitario = precio;
            prod.subtotal = precio * prod.cantidad;
            totalVenta += prod.subtotal;
            verificarStock(i + 1, callback);
        });
    };

    verificarStock(0, (err, total) => {
        if (err) return res.status(400).json({ error: err });
        db.query('INSERT INTO VENTA (id_cliente, total) VALUES (?, ?)', [id_cliente, total], (err, venta) => {
            if (err) return res.status(500).json({ error: 'No se pudo registrar la venta' });
            const idVenta = venta.insertId;
            let pendientes = productos.length;
            productos.forEach(prod => {
                db.query('INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', 
                    [idVenta, prod.id_producto, prod.cantidad, prod.precio_unitario], () => {
                    db.query('UPDATE PRODUCTO SET stock = stock - ? WHERE id_producto = ?', 
                        [prod.cantidad, prod.id_producto], () => {
                        if (--pendientes === 0) res.status(201).json({ mensaje: 'Venta registrada', id_venta: idVenta, total });
                    });
                });
            });
        });
    });
});

app.listen(3000, () => {
    console.log('========================================');
    console.log('✅ SERVIDOR EN http://localhost:3000');
    console.log('========================================');
});