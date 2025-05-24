/**
 * Controlador para la gestión de servicios (front-end y administración)
 */
const Servicio = require('../models/Servicio');
const path = require('path');
const fs = require('fs');

/**
 * FUNCIONES PARA EL FRONT-END
 */

/**
 * Obtiene todos los servicios para mostrar en la página pública
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
      titulo: 'Error',
      mensaje: 'Error al cargar los servicios',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Obtiene un servicio por su ID para la página pública
 * @param {Object} req - Objeto request
 * @param {Object} res - Objeto response
 */
exports.getServicioById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).render('error', {
        titulo: 'Error',
        mensaje: 'ID de servicio inválido'
      });
    }
    
    // Obtener el servicio desde la base de datos
    const servicio = await Servicio.getById(id);
    
    if (!servicio) {
      return res.status(404).render('error', {
        titulo: 'Error',
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
      titulo: 'Error',
      mensaje: 'Error al cargar el servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Obtiene los servicios destacados para la página principal
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
      titulo: 'Error',
      mensaje: 'Error al cargar los servicios destacados',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * FUNCIONES PARA EL PANEL DE ADMINISTRACIÓN
 */

/**
 * Obtiene todos los servicios para la vista de administración
 */
exports.getAdminServicios = async (req, res) => {
    try {
        // Obtener todos los servicios
        const servicios = await Servicio.getAll();
        
        // Renderizar la vista con los servicios
        res.render('admin/servicios', {
            titulo: 'Gestión de Servicios',
            admin: req.session.adminData,
            servicios,
            current_page: { servicios: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar los servicios',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Muestra el formulario para crear un nuevo servicio
 */
exports.getCrearServicioForm = (req, res) => {
    try {
        res.render('admin/servicio-crear', {
            titulo: 'Crear Nuevo Servicio',
            admin: req.session.adminData,
            current_page: { servicios: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al cargar formulario de creación:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar el formulario',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Procesa la creación de un nuevo servicio
 */
exports.crearServicio = async (req, res) => {
    try {
        // Obtener datos del formulario
        const { nombre, descripcion, disponible } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !descripcion) {
            return res.render('admin/servicio-crear', {
                titulo: 'Crear Nuevo Servicio',
                admin: req.session.adminData,
                error: 'El nombre y la descripción del servicio son obligatorios',
                current_page: { servicios: true },
                standalone: true
            });
        }
        
        // Procesar imagen si se ha subido
        let imagenUrl = '/img/default-service.jpg'; // Imagen por defecto
        
        if (req.file) {
            // Si existe una carpeta para subir imágenes, usar esa ruta
            const uploadsDir = path.join(__dirname, '../../public/uploads');
            
            // Crear directorio si no existe
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // URL relativa para la base de datos
            imagenUrl = `/uploads/${req.file.filename}`;
        }
        
        // Crear objeto de servicio
        const servicioData = {
            nombre,
            descripcion,
            disponible: disponible === 'on' || disponible === true,
            imagen: imagenUrl
        };
        
        // Guardar servicio en la base de datos
        const servicioId = await Servicio.create(servicioData);
        
        if (!servicioId) {
            throw new Error('No se pudo crear el servicio');
        }
        
        // Guardar mensaje de éxito en la sesión y redirigir
        req.session.successMessage = 'Servicio creado correctamente';
        res.redirect('/admin/servicios');
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.render('admin/servicio-crear', {
            titulo: 'Crear Nuevo Servicio',
            admin: req.session.adminData,
            error: `Error al crear el servicio: ${error.message}`,
            current_page: { servicios: true },
            standalone: true
        });
    }
};

/**
 * Muestra el detalle de un servicio en el panel admin
 */
exports.getAdminServicioById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de servicio inválido'
            });
        }
        
        // Obtener servicio
        const servicio = await Servicio.getById(id);
        
        if (!servicio) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Servicio no encontrado'
            });
        }
        
        res.render('admin/servicio-detalle', {
            titulo: `Servicio: ${servicio.nombre}`,
            admin: req.session.adminData,
            servicio,
            current_page: { servicios: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al obtener servicio:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar el servicio',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Muestra el formulario para editar un servicio
 */
/**
 * Muestra el formulario para editar un servicio
 */
exports.getEditarServicioForm = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de servicio inválido'
            });
        }
        
        // Obtener servicio
        const servicio = await Servicio.getById(id);
        
        if (!servicio) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Servicio no encontrado'
            });
        }
        
        // Procesar el campo disponible para asegurar que sea booleano
        let disponible = false;
        
        // Manejar diferentes tipos de valores que pueden venir de la BD
        if (servicio.disponible === 1 || 
            servicio.disponible === '1' || 
            servicio.disponible === true || 
            servicio.disponible === 'true') {
            disponible = true;
        }
        
        // Crear objeto de servicio con disponible como booleano
        const servicioFormateado = {
            ...servicio,
            disponible: disponible
        };
        
        console.log(`Debug - Servicio ${id} disponible original:`, servicio.disponible);
        console.log(`Debug - Servicio ${id} disponible formateado:`, disponible);
        
        res.render('admin/servicio-editar', {
            titulo: 'Editar Servicio',
            admin: req.session.adminData,
            servicio: servicioFormateado,
            current_page: { servicios: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar el formulario de edición',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};
/**
 * Procesa la actualización de un servicio
 */
exports.editarServicio = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de servicio inválido'
            });
        }
        
        // Obtener servicio actual para usar su imagen si no se sube una nueva
        const servicioActual = await Servicio.getById(id);
        
        if (!servicioActual) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Servicio no encontrado'
            });
        }
        
        // Obtener datos del formulario
        const { nombre, descripcion, disponible } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !descripcion) {
            return res.render('admin/servicio-editar', {
                titulo: 'Editar Servicio',
                admin: req.session.adminData,
                servicio: servicioActual,
                error: 'El nombre y la descripción del servicio son obligatorios',
                current_page: { servicios: true },
                standalone: true
            });
        }
        
        // Procesar imagen si se ha subido una nueva
        let imagenUrl = servicioActual.imagen; // Mantener imagen actual por defecto
        
        if (req.file) {
            // Si existe una carpeta para subir imágenes, usar esa ruta
            const uploadsDir = path.join(__dirname, '../../public/uploads');
            
            // Crear directorio si no existe
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // URL relativa para la base de datos
            imagenUrl = `/uploads/${req.file.filename}`;
            
            // Eliminar imagen anterior si no es la predeterminada
            if (servicioActual.imagen && !servicioActual.imagen.includes('default-service.jpg')) {
                try {
                    const imagePath = path.join(__dirname, '../../public', servicioActual.imagen);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                } catch (err) {
                    console.error('Error al eliminar imagen anterior:', err);
                }
            }
        }
        
        // Crear objeto de servicio actualizado
        const servicioData = {
            nombre,
            descripcion,
            disponible: disponible === 'on' || disponible === true,
            imagen: imagenUrl
        };
        
        // Actualizar servicio en la base de datos
        const success = await Servicio.update(id, servicioData);
        
        if (!success) {
            throw new Error('No se pudo actualizar el servicio');
        }
        
        // Guardar mensaje de éxito en la sesión y redirigir
        req.session.successMessage = 'Servicio actualizado correctamente';
        res.redirect('/admin/servicios');
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        
        // Obtener servicio actual para mostrar el formulario nuevamente
        const servicioActual = await Servicio.getById(parseInt(req.params.id));
        
        res.render('admin/servicio-editar', {
            titulo: 'Editar Servicio',
            admin: req.session.adminData,
            servicio: servicioActual,
            error: `Error al actualizar el servicio: ${error.message}`,
            current_page: { servicios: true },
            standalone: true
        });
    }
};

/**
 * Elimina un servicio
 */
exports.eliminarServicio = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de servicio inválido'
            });
        }
        
        // Obtener servicio para eliminar su imagen
        const servicio = await Servicio.getById(id);
        
        if (!servicio) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Servicio no encontrado'
            });
        }
        
        // Eliminar imagen si no es la predeterminada
        if (servicio.imagen && !servicio.imagen.includes('default-service.jpg')) {
            try {
                const imgPath = path.join(__dirname, '../../public', servicio.imagen);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }
        
        // Eliminar servicio de la base de datos
        const success = await Servicio.delete(id);
        
        if (!success) {
            throw new Error('No se pudo eliminar el servicio');
        }
        
        // Guardar mensaje de éxito en la sesión y redirigir
        req.session.successMessage = 'Servicio eliminado correctamente';
        res.redirect('/admin/servicios');
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: `Error al eliminar el servicio: ${error.message}`,
            error: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
};

exports.getAdminServicios = async (req, res) => {
    try {
        // Obtener TODOS los servicios (disponibles y no disponibles) para el admin
        const servicios = await Servicio.getAllForAdmin();
        
        // Formatear disponibilidad para asegurar consistencia
        const serviciosFormateados = servicios.map(servicio => {
            // Convertir el campo disponible a booleano de forma robusta
            let disponible = false;
            
            // Manejar diferentes tipos de valores de disponible
            if (servicio.disponible === 1 || 
                servicio.disponible === '1' || 
                servicio.disponible === true || 
                servicio.disponible === 'true') {
                disponible = true;
            }
            
            return {
                ...servicio,
                disponible: disponible  // Asegurar que sea booleano
            };
        });
        
        // Renderizar la vista con todos los servicios
        res.render('admin/servicios', {
            titulo: 'Gestión de Servicios',
            admin: req.session.adminData,
            servicios: serviciosFormateados,
            current_page: { servicios: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al obtener servicios para admin:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar los servicios',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};