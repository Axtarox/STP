/**
 * Funcionalidad específica para la página de detalle de producto con validación de stock
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar selector de cantidad
    initQuantitySelector();
    
    // Botón de añadir al carrito
    const addToCartBtn = document.getElementById('btnAddToCart');
    
    if (addToCartBtn) {
        // Remover cualquier event listener previo (para evitar duplicados)
        const oldAddToCart = addToCartBtn.onclick;
        if (oldAddToCart) {
            addToCartBtn.removeEventListener('click', oldAddToCart);
        }
        
        // Añadir el nuevo event listener
        addToCartBtn.addEventListener('click', handleAddToCart);
    }
});

/**
 * Manejador para el evento click del botón añadir al carrito con validación de stock
 */
function handleAddToCart() {
    const productId = this.getAttribute('data-id');
    const productName = this.getAttribute('data-nombre');
    const productPrice = this.getAttribute('data-precio');
    const productImg = this.getAttribute('data-imagen');
    
    // Obtener la cantidad seleccionada y stock máximo
    const quantityInput = document.getElementById('product-quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    const maxStock = quantityInput ? parseInt(quantityInput.getAttribute('max')) : 999;
    
    // Validar que la cantidad no exceda el stock disponible
    if (quantity > maxStock) {
        showToast(`Solo hay ${maxStock} unidades disponibles de ${productName}`, 'error');
        if (quantityInput) {
            quantityInput.value = maxStock;
        }
        return;
    }
    
    // Verificar disponibilidad en el carrito actual
    const carrito = getCarritoFromStorage();
    const existingItem = carrito.items.find(item => String(item.id) === String(productId));
    
    if (existingItem) {
        const newTotalQuantity = existingItem.cantidad + quantity;
        if (newTotalQuantity > maxStock) {
            const remainingStock = maxStock - existingItem.cantidad;
            if (remainingStock <= 0) {
                showToast(`Ya tienes el máximo disponible (${maxStock}) de ${productName} en tu carrito`, 'error');
                return;
            } else {
                showToast(`Solo puedes añadir ${remainingStock} unidades más de ${productName}`, 'error');
                return;
            }
        }
    }
    
    // Crear el objeto de producto con stock
    const producto = {
        id: productId,
        nombre: productName,
        precio: parseFloat(productPrice.replace(/\./g, '').replace(/,/g, '.')) || 0,
        imagen: productImg,
        cantidad: quantity,
        stock: maxStock
    };
    
    // Añadir al carrito usando la función global
    if (typeof addProductToCart === 'function') {
        addProductToCart(producto);
    } else {
        // Función de respaldo si no está disponible la global
        addProductToCartLocal(producto);
    }
    
    // Mostrar confirmación con el toast mejorado
    showToast(`${productName} ha sido añadido al carrito`);
    
    // Animar el botón flotante del carrito
    animateCartIcon();
}

/**
 * Función local de respaldo para añadir al carrito
 * @param {Object} producto - Producto a añadir
 */
function addProductToCartLocal(producto) {
    // Obtener carrito actual del localStorage
    let carrito;
    try {
        carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [], total: 0 };
    } catch (e) {
        carrito = { items: [], total: 0 };
        console.error('Error al parsear carrito:', e);
    }
    
    // Verificar si el producto ya existe
    const index = carrito.items.findIndex(item => String(item.id) === String(producto.id));
    
    if (index !== -1) {
        // Incrementar cantidad con validación de stock
        const newQuantity = carrito.items[index].cantidad + producto.cantidad;
        if (newQuantity <= producto.stock) {
            carrito.items[index].cantidad = newQuantity;
            // Actualizar stock si se proporciona
            carrito.items[index].stock = producto.stock;
        } else {
            showToast(`Solo hay ${producto.stock} unidades disponibles`, 'error');
            return;
        }
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
 * Obtiene el carrito desde localStorage
 * @returns {Object} Carrito de compras
 */
function getCarritoFromStorage() {
    const carritoJSON = localStorage.getItem('carrito');
    
    if (carritoJSON) {
        try {
            return JSON.parse(carritoJSON);
        } catch (e) {
            console.error('Error al parsear carrito:', e);
        }
    }
    
    // Carrito por defecto
    return {
        items: [],
        total: 0
    };
}

/**
 * Inicializa el selector de cantidad asegurando que no haya eventos duplicados
 */
function initQuantitySelector() {
    const quantityMinus = document.getElementById('quantity-minus');
    const quantityPlus = document.getElementById('quantity-plus');
    const quantityInput = document.getElementById('product-quantity');
    
    if (!quantityMinus || !quantityPlus || !quantityInput) return;
    
    // Obtener stock máximo del atributo
    const maxStock = parseInt(quantityInput.getAttribute('max')) || 999;
    
    // Eliminamos los event listeners antiguos clonando los elementos
    const newMinus = quantityMinus.cloneNode(true);
    const newPlus = quantityPlus.cloneNode(true);
    
    quantityMinus.parentNode.replaceChild(newMinus, quantityMinus);
    quantityPlus.parentNode.replaceChild(newPlus, quantityPlus);
    
    // Agregar nuevos event listeners a los elementos clonados
    newMinus.addEventListener('click', function() {
        decrementQuantity(maxStock);
    });
    
    newPlus.addEventListener('click', function() {
        incrementQuantity(maxStock);
    });
    
    // Renovar el input para evitar problemas con los event listeners
    const newInput = quantityInput.cloneNode(true);
    quantityInput.parentNode.replaceChild(newInput, quantityInput);
    
    // Añadir el evento al nuevo input
    newInput.addEventListener('change', function() {
        validateQuantityInput(maxStock);
    });
    
    // Deshabilitar el evento wheel para evitar cambios accidentales
    newInput.addEventListener('wheel', function(e) {
        e.preventDefault();
    });
    
    // Actualizar estado de los botones según el stock
    updateQuantityButtons(maxStock);
}

/**
 * Función para decrementar la cantidad
 * @param {number} maxStock - Stock máximo disponible
 */
function decrementQuantity(maxStock) {
    const quantityInput = document.getElementById('product-quantity');
    let value = parseInt(quantityInput.value);
    if (value > 1) {
        quantityInput.value = value - 1;
        updateQuantityButtons(maxStock);
    }
}

/**
 * Función para incrementar la cantidad
 * @param {number} maxStock - Stock máximo disponible
 */
function incrementQuantity(maxStock) {
    const quantityInput = document.getElementById('product-quantity');
    let value = parseInt(quantityInput.value);
    
    // Verificar disponibilidad en el carrito
    const carrito = getCarritoFromStorage();
    const productId = document.getElementById('btnAddToCart')?.getAttribute('data-id');
    const existingItem = carrito.items.find(item => String(item.id) === String(productId));
    const usedStock = existingItem ? existingItem.cantidad : 0;
    const availableStock = maxStock - usedStock;
    
    if (value < availableStock) {
        quantityInput.value = value + 1;
        updateQuantityButtons(maxStock);
    } else {
        if (usedStock > 0) {
            showToast(`Ya tienes ${usedStock} unidades en tu carrito. Solo quedan ${availableStock} disponibles.`, 'error');
        } else {
            showToast(`Solo hay ${maxStock} unidades disponibles`, 'error');
        }
    }
}

/**
 * Función para validar la entrada directa
 * @param {number} maxStock - Stock máximo disponible
 */
function validateQuantityInput(maxStock) {
    const quantityInput = document.getElementById('product-quantity');
    let value = parseInt(quantityInput.value);
    
    // Verificar disponibilidad en el carrito
    const carrito = getCarritoFromStorage();
    const productId = document.getElementById('btnAddToCart')?.getAttribute('data-id');
    const existingItem = carrito.items.find(item => String(item.id) === String(productId));
    const usedStock = existingItem ? existingItem.cantidad : 0;
    const availableStock = maxStock - usedStock;
    
    if (isNaN(value) || value < 1) {
        quantityInput.value = 1;
    } else if (value > availableStock) {
        quantityInput.value = availableStock > 0 ? availableStock : 1;
        if (usedStock > 0) {
            showToast(`Ya tienes ${usedStock} unidades en tu carrito. Solo quedan ${availableStock} disponibles.`, 'error');
        } else {
            showToast(`Solo hay ${maxStock} unidades disponibles`, 'error');
        }
    }
    
    updateQuantityButtons(maxStock);
}

/**
 * Actualiza el estado de los botones de cantidad
 * @param {number} maxStock - Stock máximo disponible
 */
function updateQuantityButtons(maxStock) {
    const quantityInput = document.getElementById('product-quantity');
    const quantityMinus = document.getElementById('quantity-minus');
    const quantityPlus = document.getElementById('quantity-plus');
    
    if (!quantityInput || !quantityMinus || !quantityPlus) return;
    
    const currentValue = parseInt(quantityInput.value);
    
    // Verificar disponibilidad en el carrito
    const carrito = getCarritoFromStorage();
    const productId = document.getElementById('btnAddToCart')?.getAttribute('data-id');
    const existingItem = carrito.items.find(item => String(item.id) === String(productId));
    const usedStock = existingItem ? existingItem.cantidad : 0;
    const availableStock = maxStock - usedStock;
    
    // Actualizar botón menos
    quantityMinus.disabled = currentValue <= 1;
    quantityMinus.style.opacity = currentValue <= 1 ? '0.5' : '1';
    quantityMinus.style.cursor = currentValue <= 1 ? 'not-allowed' : 'pointer';
    
    // Actualizar botón más
    quantityPlus.disabled = currentValue >= availableStock;
    quantityPlus.style.opacity = currentValue >= availableStock ? '0.5' : '1';
    quantityPlus.style.cursor = currentValue >= availableStock ? 'not-allowed' : 'pointer';
    
    // Actualizar información de stock
    updateStockDisplay(maxStock, usedStock, availableStock);
}

/**
 * Actualiza la información de stock mostrada al usuario
 * @param {number} maxStock - Stock total
 * @param {number} usedStock - Stock ya en el carrito
 * @param {number} availableStock - Stock disponible para añadir
 */
function updateStockDisplay(maxStock, usedStock, availableStock) {
    let stockElement = document.querySelector('.product-stock-info');
    
    if (!stockElement) {
        // Crear elemento de información de stock si no existe
        stockElement = document.createElement('div');
        stockElement.className = 'product-stock-info';
        
        const quantitySelector = document.querySelector('.quantity-selector');
        if (quantitySelector) {
            quantitySelector.appendChild(stockElement);
        }
    }
    
    let stockText = `Stock total: ${maxStock}`;
    if (usedStock > 0) {
        stockText += ` | En carrito: ${usedStock} | Disponible: ${availableStock}`;
    }
    
    stockElement.innerHTML = `<small style="color: #666; font-size: 0.85rem;">${stockText}</small>`;
}

/**
 * Muestra una notificación tipo toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error)
 */
function showToast(mensaje, tipo = 'success') {
    // Verificar si ya existe un toast
    let toast = document.querySelector('.toast');
    
    // Si no existe, crear uno nuevo
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Limpiar clases previas
    toast.className = 'toast';
    
    // Añadir clases según el tipo
    if (tipo === 'success') {
        toast.classList.add('toast-success');
        toast.style.backgroundColor = '#2ecc71';
    } else if (tipo === 'error') {
        toast.classList.add('toast-error');
        toast.style.backgroundColor = '#e74c3c';
    }
    
    toast.style.color = 'white';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    toast.style.transition = 'opacity 0.3s ease';
    
    // Añadir icono según el tipo
    let icono = tipo === 'success' ? 
        '<i class="fas fa-check-circle" style="margin-right: 8px;"></i>' : 
        '<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>';
    
    // Establecer el contenido
    toast.innerHTML = `${icono}<span>${mensaje}</span>`;
    
    // Mostrar toast
    toast.classList.add('show');
    toast.style.opacity = '1';
    
    // Ocultar después de 4 segundos para mensajes de error, 3 para success
    const timeout = tipo === 'error' ? 4000 : 3000;
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, timeout);
}

/**
 * Anima el icono del carrito con rebote
 */
function animateCartIcon() {
    // Buscar el carrito flotante por su ID
    const floatingCart = document.getElementById('floating-cart');
    
    if (floatingCart) {
        // Añadir clase de animación
        floatingCart.classList.add('cart-bounce');
        
        // Quitar la clase después de que termine la animación
        setTimeout(function() {
            floatingCart.classList.remove('cart-bounce');
        }, 750);
    }
}

/**
 * Actualiza el contador del carrito
 */
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || { items: [] };
        
        // Calcular número total de ítems 
        const totalItems = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        // Actualizar número
        cartCount.textContent = totalItems;
        
        // Mostrar contador si hay elementos
        if (carrito.items.length > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    } catch (e) {
        cartCount.textContent = '0';
        cartCount.style.display = 'none';
    }
}

// Actualizar botones de cantidad cuando se carga la página y cuando cambia el carrito
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar cada vez que cambie el localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            const quantityInput = document.getElementById('product-quantity');
            if (quantityInput) {
                const maxStock = parseInt(quantityInput.getAttribute('max')) || 999;
                updateQuantityButtons(maxStock);
            }
        }
    });
    
    // Actualizar botones inicialmente
    setTimeout(() => {
        const quantityInput = document.getElementById('product-quantity');
        if (quantityInput) {
            const maxStock = parseInt(quantityInput.getAttribute('max')) || 999;
            updateQuantityButtons(maxStock);
        }
    }, 100);
});

// Escuchar cambios en el carrito para actualizar la disponibilidad
setInterval(function() {
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput && document.hasFocus()) {
        const maxStock = parseInt(quantityInput.getAttribute('max')) || 999;
        updateQuantityButtons(maxStock);
    }
}, 2000); // Verificar cada 2 segundos si la página tiene el foco