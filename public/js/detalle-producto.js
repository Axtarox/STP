/**
 * Funcionalidad específica para la página de detalle de producto
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando script de detalle de producto');
    
    // Botón de añadir al carrito
    const addToCartBtn = document.getElementById('btnAddToCart');
    
    if (addToCartBtn) {
        console.log('Botón de añadir al carrito encontrado');
        
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-nombre');
            const productPrice = this.getAttribute('data-precio');
            const productImg = this.getAttribute('data-imagen');
            
            console.log('Datos del producto:', {
                id: productId,
                nombre: productName,
                precio: productPrice,
                imagen: productImg
            });
            
            // Crear el objeto de producto
            const producto = {
                id: productId,
                nombre: productName,
                precio: parseFloat(productPrice.replace(/\./g, '').replace(/,/g, '.')) || 0,
                imagen: productImg,
                cantidad: 1
            };
            
            // Añadir al carrito
            addProductToCart(producto);
            
            // Mostrar confirmación
            alert(productName + ' ha sido añadido al carrito');
        });
    } else {
        console.log('Botón de añadir al carrito NO encontrado');
    }
});

/**
 * Añade un producto al carrito
 */
function addProductToCart(producto) {
    console.log('Añadiendo producto al carrito:', producto);
    
    // Obtener carrito actual del localStorage
    let carrito;
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [], total: 0 };
    } catch (e) {
        console.error('Error al parsear carrito:', e);
        carrito = { items: [], total: 0 };
    }
    
    // Verificar si el producto ya existe
    const index = carrito.items.findIndex(item => item.id === producto.id);
    
    if (index !== -1) {
        // Incrementar cantidad
        carrito.items[index].cantidad += 1;
        console.log('Incrementada cantidad del producto existente');
    } else {
        // Añadir nuevo producto
        carrito.items.push(producto);
        console.log('Añadido nuevo producto al carrito');
    }
    
    // Calcular total
    carrito.total = carrito.items.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
    
    // Guardar carrito
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Carrito guardado en localStorage:', carrito);
    
    // Actualizar contador
    updateCartCount();
}

/**
 * Actualiza el contador del carrito
 */
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [] };
        cartCount.textContent = carrito.items.length;
        console.log('Contador de carrito actualizado:', carrito.items.length);
    } catch (e) {
        console.error('Error al actualizar contador:', e);
    }
}