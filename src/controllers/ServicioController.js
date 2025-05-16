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
 * Controlador para la gestión de servicios
 */
const Servicio = require('../models/Servicio');

/**
 * Obtiene todos los servicios
 * @param {Object} req - Objeto request
 * @param {Object} res - Objeto response
 */
exports.getAllServicios = async (req, res) => {
  try {
    // Obtener servicios desde la base de datos
    const servicios = await Servicio.getAll();
    
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
    
    // Obtener el servicio desde la base de datos
    const servicio = await Servicio.getById(id);
    
    if (!servicio) {
      return res.status(404).render('error', {
        mensaje: 'Servicio no encontrado'
      });
    }
    
    // Obtener servicios relacionados (excluyendo el actual)
    const serviciosRelacionados = await Servicio.getAll(4);
    const relacionados = serviciosRelacionados.filter(s => s.id !== id).slice(0, 3);
    
    res.render('servicio-detalle', {
      servicio,
      relacionados,
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
    // Obtener servicios destacados desde la base de datos
    const servicios = await Servicio.getFeatured(3);
    
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