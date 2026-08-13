<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <title>ModasDarek - Registro de Productos (JSP)</title>
</head>
<body>
    <h2>Formulario Registro de Productos - ModasDarek</h2>
    
    <!-- Formulario conectado al Servlet usando método POST -->
    <form action="ProductoServlet" method="POST">
        <label>Nombre del Producto:</label><br>
        <input type="text" name="nombre" required><br><br>
        
        <label>Precio:</label><br>
        <input type="number" name="precio" required><br><br>
        
        <button type="submit">Guardar Producto</button>
    </form>

    <hr>
    <!-- Consulta enviada al Servlet usando método GET -->
    <a href="ProductoServlet?accion=consultar">Consultar Lista de Productos (GET)</a>
</body>
</html>