/**
 * Controlador para la gestión de servicios
 */

// Servicios de ejemplo
const serviciosEjemplo = [
  {
    id: 1,
    nombre: 'Mantenimiento de Computadores',
    descripcion: 'Servicio completo de mantenimiento preventivo y correctivo para computadores de escritorio y portátiles.',
    imagen: '/img/service-maintenance.jpg'
  },
  {
    id: 2,
    nombre: 'Reparación de Equipos',
    descripcion: 'Reparamos todo tipo de equipos informáticos con garantía y personal certificado.',
    imagen: '/img/service-repair.jpg'
  },
  {
    id: 3,
    nombre: 'Instalación de Redes',
    descripcion: 'Diseño e implementación de redes para hogares y empresas, cableado estructurado e inalámbrico.',
    imagen: '/img/service-network.jpg'
  },
  {
    id: 4,
    nombre: 'Desarrollo de Software',
    descripcion: 'Creamos soluciones de software personalizadas para empresas y negocios.',
    imagen: '/img/service-software.jpg'
  },
  {
    id: 5,
    nombre: 'Respaldo y Recuperación de Datos',
    descripcion: 'Recuperamos información de dispositivos dañados y configuramos sistemas de respaldo.',
    imagen: '/img/service-backup.jpg'
  }
];

/**
 * Controladores para páginas públicas
 */

/**
 * Obtiene todos los servicios
 * @param {Object} req - Objeto request
 * @param {Object} res - Objeto response
 */
exports.getAllServicios = async (req, res) => {
  try {
    // En producción, aquí se obtendrían los servicios de la base de datos
    const servicios = serviciosEjemplo;
    
    res.render('servicios', {
      servicios,
      titulo: 'Nuestros Servicios'
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar los servicios',
      error
    });
  }
};

/**
 * Obtiene un servicio por su ID
 * @param {Object} req - Objeto request
 * @param {Object} res - Objeto response
 */
exports.getServicioById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).render('error', {
        mensaje: 'ID de servicio inválido'
      });
    }
    
    // En producción, aquí se obtendría el servicio de la base de datos
    const servicio = serviciosEjemplo.find(s => s.id === id);
    
    if (!servicio) {
      return res.status(404).render('error', {
        mensaje: 'Servicio no encontrado'
      });
    }
    
    res.render('servicio-detalle', {
      servicio,
      titulo: `Servicio: ${servicio.nombre}`
    });
  } catch (error) {
    console.error(`Error al obtener servicio ${req.params.id}:`, error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar el servicio',
      error
    });
  }
};

/**
 * Obtiene los servicios destacados
 * @param {Object} req - Objeto request
 * @param {Object} res - Objeto response
 */
exports.getServiciosDestacados = async (req, res) => {
  try {
    // En producción, aquí se obtendrían los servicios destacados de la base de datos
    const servicios = serviciosEjemplo.slice(0, 3);
    
    res.render('servicios-destacados', {
      servicios,
      titulo: 'Servicios Destacados'
    });
  } catch (error) {
    console.error('Error al obtener servicios destacados:', error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar los servicios destacados',
      error
    });
  }
};