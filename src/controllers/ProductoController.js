/**
 * Controlador mejorado de Productos (ProductoController.js)
 */
const path = require('path');
const { formatPrice } = require('../helpers/formatHelper');
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

/**
 * Controladores para páginas públicas
 */

/**
 * Obtiene todos los productos
 */
exports.getAllProductos = async (req, res) => {
    try {
        // Obtener los productos de la base de datos
        const productos = await Producto.getAll();
        
        // Formatear los precios para visualización
        const productosFormateados = productos.map(producto => ({
            ...producto,
            precio: formatPrice(producto.precio)
        }));
        
        // Obtener todas las categorías para el filtro
        const categorias = await Categoria.getAll();
        
        // Agregar función de formateo para la vista
        res.locals.formatPrice = formatPrice;
        
        res.render('productos', {
            productos: productosFormateados,
            categorias,
            titulo: 'Nuestros Productos'
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar los productos',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Obtiene un producto por su ID
 */
/**
 * Obtiene un producto por su ID
 */
/**
 * Obtiene un producto por su ID
 */
exports.getProductoById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        
        if (isNaN(id)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de producto inválido'
            });
        }
        
        // Obtener el producto desde la base de datos
        const producto = await Producto.getById(id);
        
        if (!producto) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Producto no encontrado'
            });
        }
        
        console.log('Producto obtenido:', producto);
        
        // Extraer características y limpiar la lista
        let caracteristicasList = [];
        if (producto.caracteristicas) {
            // Más opciones de separación para las características
            caracteristicasList = producto.caracteristicas
                .split(/\n|\r|\r\n|-|•|\\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }
        
        console.log('Lista de características procesada:', caracteristicasList);
        
        // Garantizar que todos los campos existan y tengan valores predeterminados
        const productData = {
            id: producto.id,
            nombre: producto.nombre || 'Producto sin nombre',
            precio: typeof producto.precio === 'number' 
                ? producto.precio.toLocaleString('es-CO') 
                : '0',
            descripcion: producto.descripcion || 'Sin descripción disponible',
            imagen: producto.imagen || '/img/default-product.jpg',
            categoria_id: producto.categoria_id || 1,
            categoria_nombre: producto.categoria_nombre || 'Sin categoría',
            condicion: producto.condicion || 'Nuevo',
            cantidad_disponible: producto.cantidad_disponible || 0,
            disponible: producto.disponible !== undefined ? Boolean(producto.disponible) : true
        };
        
        console.log('Datos del producto a renderizar:', productData);
        console.log('Cantidad de características:', caracteristicasList.length);
        
        // Renderizar vista con datos simplificados
        return res.render('producto-detalle', {
            titulo: producto.nombre || 'Detalle de Producto',
            isProductoDetalle: true,
            producto: productData,
            caracteristicasList: caracteristicasList
        });
    } catch (error) {
        console.error('Error en getProductoById:', error);
        return res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar el producto',
            error: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
};

/**
 * Obtiene productos por categoría
 */
exports.getProductosByCategoria = async (req, res) => {
    try {
        const categoriaId = parseInt(req.params.id, 10);
        
        if (isNaN(categoriaId)) {
            return res.status(400).render('error', {
                titulo: 'Error',
                mensaje: 'ID de categoría inválido'
            });
        }
        
        // Obtener la categoría seleccionada
        const categoria = await Categoria.getById(categoriaId);
        
        if (!categoria) {
            return res.status(404).render('error', {
                titulo: 'Error',
                mensaje: 'Categoría no encontrada'
            });
        }
        
        // Obtener productos por categoría
        const productos = await Producto.getByCategoria(categoriaId);
        
        // Formatear precios para visualización
        const productosFormateados = productos.map(producto => ({
            ...producto,
            precio: formatPrice(producto.precio)
        }));
        
        // Obtener todas las categorías para el filtro
        const categorias = await Categoria.getAll();
        
        // Marcar la categoría seleccionada
        const categoriasConSeleccion = categorias.map(cat => ({
            ...cat,
            selected: cat.id === categoriaId
        }));
        
        // Agregar función de formateo para la vista
        res.locals.formatPrice = formatPrice;
        
        res.render('productos-categoria', {
            productos: productosFormateados,
            categoria,
            categorias: categoriasConSeleccion,
            titulo: `Productos: ${categoria.nombre}`
        });
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar los productos por categoría',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Busca productos
 */
exports.searchProductos = async (req, res) => {
    try {
        const query = req.query.q || '';
        
        if (!query.trim()) {
            return res.redirect('/productos');
        }
        
        // Buscar productos que coincidan con la consulta
        const productos = await Producto.search(query);
        
        // Formatear precios para visualización
        const productosFormateados = productos.map(producto => ({
            ...producto,
            precio: formatPrice(producto.precio)
        }));
        
        // Obtener todas las categorías para el filtro
        const categorias = await Categoria.getAll();
        
        // Agregar función de formateo para la vista
        res.locals.formatPrice = formatPrice;
        
        res.render('productos-busqueda', {
            productos: productosFormateados,
            categorias,
            query,
            titulo: `Resultados para: ${query}`
        });
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al buscar productos',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

/**
 * Muestra productos destacados
 */
exports.getProductosDestacados = async (req, res) => {
    try {
        // Obtener los productos destacados
        const productos = await Producto.getFeatured(8);
        
        // Formatear precios para visualización
        const productosFormateados = productos.map(producto => ({
            ...producto,
            precio: formatPrice(producto.precio)
        }));
        
        // Agregar función de formateo para la vista
        res.locals.formatPrice = formatPrice;
        
        res.render('productos-destacados', {
            productos: productosFormateados,
            titulo: 'Productos Destacados'
        });
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        res.status(500).render('error', {
            titulo: 'Error',
            mensaje: 'Error al cargar los productos destacados',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};