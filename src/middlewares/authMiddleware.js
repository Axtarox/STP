/**
 * Middleware de autenticación para proteger rutas del panel de administración
 * Nota: Este es un middleware temporal básico hasta implementar la autenticación completa
 */

/**
 * Verifica si el usuario está autenticado como administrador
 * En esta versión inicial, permite el acceso a todas las rutas mientras
 * se implementa el sistema de autenticación completo
 */
exports.isAdmin = (req, res, next) => {
  // TEMP: Por ahora permitimos el acceso a todas las rutas admin
  // TODO: Implementar verificación real de autenticación
  next();
  
  // Cuando se implemente la autenticación, se usará código como este:
  /*
  if (req.session && req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    req.flash('error', 'Acceso no autorizado');
    res.redirect('/login');
  }
  */
};