/**
 * Controlador CategoriaController.js - Administrar categorías en panel admin
 */
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');
const { formatPrice } = require('../helpers/formatHelper');

/**
 * Mostrar listado de todas las categorías en panel admin
 */
exports.getAdminCategorias = async (req, res) => {
    try {
        // Obtener todas las categorías
        const categorias = await Categoria.getAll();
        
        // Para cada categoría, obtener la cantidad de productos
        const categoriasConDetalles = await Promise.all(categorias.map(async (categoria) => {
            // Contar productos por categoría
            const productCount = await Categoria.hasProducts(categoria.id) ? 
                (await Producto.getByCategoria(categoria.id)).length : 0;
            
            return {
                ...categoria,
                productCount
            };
        }));
        
        // Renderizar la vista con los datos
        res.render('admin/categorias', {
            titulo: 'Gestión de Categorías',
            admin: req.session.adminData,
            categorias: categoriasConDetalles,
            current_page: { categorias: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar las categorías',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Mostrar formulario para crear una nueva categoría
 */
exports.getCrearCategoriaForm = (req, res) => {
    try {
        res.render('admin/categoria-crear', {
            titulo: 'Crear Nueva Categoría',
            admin: req.session.adminData,
            current_page: { categorias: true },
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
 * Procesar la creación de una nueva categoría
 */
exports.crearCategoria = async (req, res) => {
    try {
        // Obtener datos del formulario
        const { nombre } = req.body;
        
        // Validar campos requeridos
        if (!nombre || nombre.trim() === '') {
            return res.render('admin/categoria-crear', {
                titulo: 'Crear Nueva Categoría',
                admin: req.session.adminData,
                error: 'El nombre de la categoría es obligatorio',
                current_page: { categorias: true },
                standalone: true
            });
        }
        
        // Crear nueva categoría (solo con el nombre)
        const categoriaId = await Categoria.create(nombre);
        
        if (!categoriaId) {
            throw new Error('No se pudo crear la categoría');
        }
        
        // Guardar mensaje de éxito en la sesión y redirigir
        req.session.successMessage = 'Categoría creada correctamente';
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.render('admin/categoria-crear', {
            titulo: 'Crear Nueva Categoría',
            admin: req.session.adminData,
            error: `Error al crear la categoría: ${error.message}`,
            current_page: { categorias: true },
            standalone: true
        });
    }
};

/**
 * Mostrar el detalle de una categoría
 */
exports.getCategoriaById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de categoría inválido'
            });
        }
        
        // Obtener categoría
        const categoria = await Categoria.getById(id);
        
        if (!categoria) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Categoría no encontrada'
            });
        }
        
        // Obtener productos de esta categoría
        const productos = await Producto.getByCategoria(id);
        
        // Formatear precios para visualización
        const productosFormateados = productos.map(producto => ({
            ...producto,
            precio: formatPrice(producto.precio)
        }));
        
        res.render('admin/categoria-detalle', {
            titulo: `Categoría: ${categoria.nombre}`,
            admin: req.session.adminData,
            categoria,
            productos: productosFormateados,
            current_page: { categorias: true },
            standalone: true
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar la categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Mostrar formulario para editar una categoría
 */
exports.getEditarCategoriaForm = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de categoría inválido'
            });
        }
        
        // Obtener categoría
        const categoria = await Categoria.getById(id);
        
        if (!categoria) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Categoría no encontrada'
            });
        }
        
        // Contar productos para mostrar advertencia
        const tieneProductos = await Categoria.hasProducts(id);
        let productsCount = 0;
        
        if (tieneProductos) {
            const productos = await Producto.getByCategoria(id);
            productsCount = productos.length;
        }
        
        res.render('admin/categoria-editar', {
            titulo: 'Editar Categoría',
            admin: req.session.adminData,
            categoria,
            productsCount,
            current_page: { categorias: true },
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
 * Procesar la actualización de una categoría
 */
exports.editarCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de categoría inválido'
            });
        }
        
        // Obtener datos del formulario
        const { nombre } = req.body;
        
        // Validar campos requeridos
        if (!nombre || nombre.trim() === '') {
            // Obtener categoría para volver a mostrar el formulario
            const categoria = await Categoria.getById(id);
            
            return res.render('admin/categoria-editar', {
                titulo: 'Editar Categoría',
                admin: req.session.adminData,
                categoria,
                error: 'El nombre de la categoría es obligatorio',
                current_page: { categorias: true },
                standalone: true
            });
        }
        
        // Actualizar categoría (solo el nombre)
        const success = await Categoria.update(id, nombre);
        
        if (!success) {
            throw new Error('No se pudo actualizar la categoría');
        }
        
        // Guardar mensaje de éxito en la sesión y redirigir
        req.session.successMessage = 'Categoría actualizada correctamente';
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        
        // Obtener categoría para volver a mostrar el formulario
        const categoria = await Categoria.getById(parseInt(req.params.id));
        
        res.render('admin/categoria-editar', {
            titulo: 'Editar Categoría',
            admin: req.session.adminData,
            categoria,
            error: `Error al actualizar la categoría: ${error.message}`,
            current_page: { categorias: true },
            standalone: true
        });
    }
};

/**
 * Eliminar una categoría
 */
exports.eliminarCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de categoría inválido'
            });
        }
        
        // Verificar si tiene productos asociados
        const tieneProductos = await Categoria.hasProducts(id);
        
        if (tieneProductos) {
            // Redirigir con mensaje de advertencia 
            req.session.error = 'No se puede eliminar la categoría porque tiene productos asociados. Cambie primero la categoría de estos productos.';
            return res.redirect('/admin/categorias');
        }
        
        // Eliminar categoría
        const success = await Categoria.delete(id);
        
        if (!success) {
            throw new Error('No se pudo eliminar la categoría');
        }
        
        // Guardar mensaje de éxito en la sesión y redirigir
        req.session.successMessage = 'Categoría eliminada correctamente';
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        req.session.error = `Error al eliminar la categoría: ${error.message}`;
        res.redirect('/admin/categorias');
    }
};