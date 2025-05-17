/**
 * Controlador para autenticación de administradores
 */
const AdminManager = require('../models/AdminManager');

/**
 * Muestra la página de login
 */
exports.getLoginPage = (req, res) => {
  // Si ya hay una sesión activa, redirigir al dashboard
  if (req.session.adminLoggedIn) {
    return res.redirect('/admin/dashboard');
  }

  // Renderizar página de login con la opción standalone: true
  res.render('admin/login', {
    titulo: 'Iniciar sesión - Panel de Administración',
    error: req.query.error ? 'Credenciales incorrectas' : null,
    standalone: true // Esta opción evita que se utilice el layout principal
  });
};
/**
 * Procesa el formulario de login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar campos
    if (!username || !password) {
      return res.redirect('/admin/login?error=true');
    }

    // Autenticar al administrador
    const isValid = await AdminManager.authenticate(username, password);

    if (!isValid) {
      return res.redirect('/admin/login?error=true');
    }

    // Establecer sesión de administrador
    req.session.adminLoggedIn = true;
    req.session.adminData = AdminManager.getAdminData();

    // Redirigir al dashboard
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.redirect('/admin/login?error=true');
  }
};

/**
 * Cierra la sesión del administrador
 */
exports.logout = (req, res) => {
  // Destruir la sesión
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/admin/login');
  });
};