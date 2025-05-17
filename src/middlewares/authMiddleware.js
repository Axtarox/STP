/**
 * Middleware de autenticación mejorado para proteger rutas del panel de administración
 */

/**
 * Verifica si el usuario está autenticado como administrador
 */
exports.isAdmin = (req, res, next) => {
  // Verificar si hay una sesión de administrador activa
  if (req.session && req.session.adminLoggedIn) {
    next();
  } else {
    // Redirigir a la página de login
    res.redirect('/admin/login');
  }
};

/**
 * Middleware para adjuntar datos del administrador a las vistas
 */
exports.attachAdminData = (req, res, next) => {
  if (req.session && req.session.adminLoggedIn) {
    res.locals.adminLoggedIn = true;
    res.locals.adminData = req.session.adminData;
  }
  next();
};