
/**
 * Funcionalidad específica para la página de detalle de producto
 * con mensajes mejorados
 */
document.addEventListener('DOMContentLoaded', function() {
    // Botón de añadir al carrito
    const addToCartBtn = document.getElementById('btnAddToCart');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-nombre');
            const productPrice = this.getAttribute('data-precio');
            const productImg = this.getAttribute('data-imagen');
            
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
            
            // Mostrar confirmación con el toast mejorado
            showToast(productName + ' ha sido añadido al carrito');
            
            // Animar el icono del carrito para dar feedback visual
            animateCartIcon();
        });
    }
});

/**
 * Muestra una notificación tipo toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error)
 */
function showToast(mensaje, tipo = 'success') {
    // Buscar si ya existe un toast
    let toast = document.querySelector('.toast');
    
    // Si no existe, crear uno nuevo
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Añadir clases según el tipo
    toast.className = 'toast';
    if (tipo === 'success') {
        toast.classList.add('toast-success');
    } else if (tipo === 'error') {
        toast.classList.add('toast-error');
    }
    
    // Añadir icono según el tipo
    let icono = tipo === 'success' ? 
        '<i class="fas fa-check-circle"></i>' : 
        '<i class="fas fa-exclamation-circle"></i>';
    
    // Establecer el contenido
    toast.innerHTML = `${icono} <span>${mensaje}</span>`;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Anima el icono del carrito
 */
function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-icon-animate');
        
        setTimeout(function() {
            cartIcon.classList.remove('cart-icon-animate');
        }, 500);
    }
}

/**
 * Añade un producto al carrito
 */
function addProductToCart(producto) {
    // Obtener carrito actual del localStorage
    let carrito;
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [], total: 0 };
    } catch (e) {
        carrito = { items: [], total: 0 };
    }
    
    // Verificar si el producto ya existe
    const index = carrito.items.findIndex(item => item.id === producto.id);
    
    if (index !== -1) {
        // Incrementar cantidad
        carrito.items[index].cantidad += 1;
    } else {
        // Añadir nuevo producto
        carrito.items.push(producto);
    }
    
    // Calcular total
    carrito.total = carrito.items.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
    
    // Guardar carrito
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
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
        
        // Actualizar número
        cartCount.textContent = carrito.items.length;
        
        // Mostrar contador si hay elementos
        if (carrito.items.length > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    } catch (e) {
        cartCount.textContent = '0';
    }
}
