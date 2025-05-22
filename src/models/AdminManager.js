class AdminManager {
  constructor() {
    this.admin = {
      username: 'admin',
      // La contraseña es 'pradito2025' 
      passwordHash: '$2a$10$eMOx9Z7Jfye.N0X1X8Rg9eYHm3TtLNJ8SwvOQYYXR1XgM.Tt5fE4C',
      nombre: 'Administrador',
      email: 'admin@solucionestecnologicaspradito.com'
    };
  }

  /**
   * Verifica las credenciales del administrador
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<boolean>} - Resultado de la autenticación
   */
  async authenticate(username, password) {
    try {
      return username === this.admin.username && password === 'pradito2025';
    } catch (error) {
      console.error('Error en autenticación:', error);
      return false;
    }
  }

  /**
   * Obtiene los datos del administrador (sin contraseña)
   * @returns {Object} - Datos del administrador
   */
  getAdminData() {
    const { passwordHash, ...adminData } = this.admin;
    return adminData;
  }
}

module.exports = new AdminManager();