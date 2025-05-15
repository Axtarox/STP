/**
 * Controlador de Categorías (categoriaController.js)
 */

// Categorías de ejemplo
const categoriasEjemplo = [
  { id: 1, nombre: 'Computadores' },
  { id: 2, nombre: 'Periféricos' },
  { id: 3, nombre: 'Accesorios' },
  { id: 4, nombre: 'Redes' },
  { id: 5, nombre: 'Software' }
];

/**
 * Controladores para páginas públicas
 */

/**
 * Obtiene todas las categorías
 */
exports.getAllCategorias = async (req, res) => {
  try {
    // En producción, aquí se obtendrían las categorías de la base de datos
    const categorias = categoriasEjemplo;
    
    res.render('categorias', {
      titulo: 'Categorías de Productos',
      categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar las categorías',
      error
    });
  }
};

/**
 * Obtiene una categoría por su ID
 */
exports.getCategoriaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).render('error', {
        mensaje: 'ID de categoría inválido'
      });
    }
    
    // En producción, aquí se obtendría la categoría de la base de datos
    const categoria = categoriasEjemplo.find(c => c.id === id);
    
    if (!categoria) {
      return res.status(404).render('error', {
        mensaje: 'Categoría no encontrada'
      });
    }
    
    res.render('categoria-detalle', {
      categoria,
      titulo: `Categoría: ${categoria.nombre}`
    });
  } catch (error) {
    console.error(`Error al obtener categoría ${req.params.id}:`, error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar la categoría',
      error
    });
  }
};