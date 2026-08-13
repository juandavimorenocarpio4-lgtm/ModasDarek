import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ProductoServlet")
public class ProductoServlet extends HttpServlet {

    // Método GET para procesar parámetros de consulta
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        String accion = request.getParameter("accion");
        
        out.println("<h3>Respuesta Servlet (Método GET)</h3>");
        out.println("<p>Acción procesada: " + accion + "</p>");
    }

    // Método POST para recibir datos de formularios
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        String nombre = request.getParameter("nombre");
        String precio = request.getParameter("precio");
        
        out.println("<h3>Producto Registrado en Servlet (Método POST)</h3>");
        out.println("<p>Producto: " + nombre + "</p>");
        out.println("<p>Precio: $" + precio + "</p>");
    }
}