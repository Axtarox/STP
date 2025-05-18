const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
require('dotenv').config();

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 4000;

// Importar la conexión a la base de datos y la función de prueba
const { pool, testConnection, dbConfig } = require('./config/database');

// Importar middleware de renderizado HTML y debugging
const renderViewMiddleware = require('./middlewares/renderViewMiddleware');
const dbDebugMiddleware = require('./middlewares/dbDebugMiddleware');

/**
 * Configuración de middleware
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'pradito_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(methodOverride('_method'));

/**
 * Servir archivos estáticos (HTML, CSS, JS)
 */
app.use(express.static(path.join(__dirname, '..', 'public')));

/**
 * Middleware para depuración de base de datos
 */
app.use(dbDebugMiddleware);

/**
 * Middleware para renderizar vistas HTML
 */
app.use(renderViewMiddleware);
// Middleware para adjuntar datos del administrador a todas las vistas
app.use(require('./middlewares/authMiddleware').attachAdminData);
/**
 * Variables globales (usadas desde scripts o apis)
 */
app.use(async (req, res, next) => {
  try {
    if (req.session.user) {
      res.locals.user = req.session.user;
    }

    try {
      // Obtener categorías de la base de datos
      const Categoria = require('./models/Categoria');
      const categorias = await Categoria.getAll();
      res.locals.categorias = categorias;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // Definir categorías por defecto en caso de error
      res.locals.categorias = [
        { id: 1, nombre: 'Computadores' },
        { id: 2, nombre: 'Periféricos' },
        { id: 3, nombre: 'Accesorios' },
        { id: 4, nombre: 'Redes' },
        { id: 5, nombre: 'Software' }
      ];
    }

    // Obtener contador del carrito desde la sesión o localStorage
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;

    next();
  } catch (error) {
    console.error('Error en middleware global:', error);
    next();
  }
});
/**
 * Importar rutas
 */
const homeRoutes = require('./routes/home');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const serviciosRoutes = require('./routes/servicios');
const carritoRoutes = require('./routes/carrito');
const pedidosRoutes = require('./routes/pedidos');
const contactoRoutes = require('./routes/contacto');
const adminRoutes = require('./routes/admin');

/**
 * Configurar rutas
 */
app.use('/', homeRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/carrito', carritoRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/contactanos', contactoRoutes);
app.use('/admin', adminRoutes);
/**
 * Ruta Quiénes Somos
 */
app.get('/quienes-somos', (req, res) => {
  res.render('quienes-somos', { titulo: 'Quiénes Somos' });
});

/**
 * Ruta Contactanos
 */
app.get('/contactanos', (req, res) => {
  res.render('contacto', { titulo: 'Contáctanos' });
});

/**
 * Rutas para el formulario de contacto
 */
app.use('/contactanos', contactoRoutes);

/**
 * Manejador de rutas no encontradas
 */
app.use((req, res) => {
  res.status(404).render('error', { 
    titulo: 'Página no encontrada',
    mensaje: 'La página que buscas no existe' 
  });
});

/**
 * Iniciar servidor
 */
async function iniciarServidor() {
  try {
    const dbConnected = await testConnection();

    if (dbConnected) {
      // La base de datos está conectada
      console.log(`✅ Base de datos conectada en ${dbConfig?.host || 'localhost'}:${dbConfig?.port || '3306'}`);
      
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo con base de datos en http://localhost:${PORT}`);
      });
    } else {
      console.log('⚠️ No se pudo conectar a la base de datos. Iniciando en modo sin base de datos...');
      
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo sin base de datos en http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();