/**
 * Funcionalidad específica para la página de detalle de producto 
 */

// Variable para evitar múltiples inicializaciones
let isDetalleProductoInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    // Evitar múltiples inicializaciones
    if (isDetalleProductoInitialized) {
        console.log('Detalle producto ya inicializado, saltando...');
        return;
    }
    
    console.log('Inicializando detalle de producto...');
    
    // Inicializar selector de cantidad
    initQuantitySelector();
    
    // Inicializar botón de carrito (con protección contra duplicados)
    initAddToCartButton();
    
    // Marcar como inicializado
    isDetalleProductoInitialized = true;
    
    console.log('Detalle de producto inicializado correctamente');
});

/**
 * Inicializar botón de añadir al carrito con protección contra duplicados
 */
function initAddToCartButton() {
    const addToCartBtn = document.getElementById('btnAddToCart');
    
    if (!addToCartBtn) {
        console.log('Botón addToCart no encontrado');
        return;
    }
    
    // Verificar si ya tiene el event listener custom
    if (addToCartBtn.hasAttribute('data-listener-added')) {
        console.log('Event listener ya existe, saltando...');
        return;
    }
    
    // Remover cualquier event listener previo
    const newBtn = addToCartBtn.cloneNode(true);
    addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
    
    // Añadir el nuevo event listener al botón clonado
    newBtn.addEventListener('click', handleAddToCart);
    
    // Marcar que ya tiene el event listener
    newBtn.setAttribute('data-listener-added', 'true');
    
    console.log('Event listener de carrito añadido correctamente');
}

/**
 * Manejador para el evento click del botón añadir al carrito 
 * Con protección contra múltiples clics
 */
let isAddingToCart = false; // Variable para evitar múltiples ejecuciones

function handleAddToCart(event) {
    // Prevenir ejecución múltiple
    if (isAddingToCart) {
        console.log('Ya se está procesando una adición al carrito, ignorando...');
        return;
    }
    
    // Prevenir el comportamiento por defecto
    event.preventDefault();
    event.stopPropagation();
    
    // Marcar como en proceso
    isAddingToCart = true;
    
    try {
        const productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-nombre');
        const productPrice = this.getAttribute('data-precio');
        const productImg = this.getAttribute('data-imagen');
        
        console.log('Procesando adición al carrito para producto:', productId);
        
        // Obtener la cantidad seleccionada y stock máximo
        const quantityInput = document.getElementById('product-quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        // CORREGIDO: No usar 999 como fallback, usar 0 si no hay valor
        const maxStock = quantityInput ? parseInt(quantityInput.getAttribute('max')) || 0 : 0;
        
        // Verificar que hay stock disponible
        if (maxStock <= 0) {
            showToast(`El producto ${productName} no está disponible actualmente`, 'error');
            return;
        }
        
        // Validar que la cantidad no exceda el stock disponible
        if (quantity > maxStock) {
            showToast(`Solo hay ${maxStock} unidades disponibles de ${productName}`, 'error');
            if (quantityInput) {
                quantityInput.value = maxStock;
            }
            return;
        }
        
        // Verificar disponibilidad en el carrito actual (flotante, no checkout)
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
        
        console.log('Objeto producto creado:', producto);
        
        // Usar la función global de main.js si está disponible
        let success = false;
        if (typeof window.addProductToCart === 'function') {
            success = window.addProductToCart(producto);
        } else if (typeof addProductToCart === 'function') {
            success = addProductToCart(producto);
        } else {
            // Función de respaldo si no está disponible la global
            success = addProductToCartLocal(producto);
        }
        
        // Solo mostrar toast de éxito si la operación fue exitosa
        if (success !== false) {
            showToast(`${productName} ha sido añadido al carrito`);
            // Animar el botón flotante del carrito
            animateCartIcon();
        }
        
        console.log('Adición al carrito completada exitosamente');
        
    } catch (error) {
        console.error('Error al añadir producto al carrito:', error);
        showToast('Error al añadir el producto al carrito', 'error');
    } finally {
        // Liberar el lock después de un pequeño delay
        setTimeout(() => {
            isAddingToCart = false;
        }, 500);
    }
}

/**
 * Función local de respaldo para añadir al carrito
 * @param {Object} producto - Producto a añadir
 * @returns {boolean} - true si la operación fue exitosa, false si falló
 */
function addProductToCartLocal(producto) {
    try {
        // Obtener carrito actual del localStorage (carrito flotante, no checkout)
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
            if (newQuantity <= producto.stock && producto.stock > 0) {
                carrito.items[index].cantidad = newQuantity;
                // Actualizar stock si se proporciona
                carrito.items[index].stock = producto.stock;
            } else {
                showToast(`Solo hay ${producto.stock} unidades disponibles`, 'error');
                return false; // Operación falló
            }
        } else {
            // Añadir nuevo producto solo si hay stock
            if (producto.stock > 0) {
                carrito.items.push(producto);
            } else {
                showToast('Este producto no está disponible', 'error');
                return false; // Operación falló
            }
        }
        
        // Calcular total
        carrito.total = carrito.items.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
        
        // Guardar carrito
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar contador usando la función global o local
        updateCartCountGlobal();
        
        return true; // Operación exitosa
        
    } catch (error) {
        console.error('Error en addProductToCartLocal:', error);
        showToast('Error al añadir el producto al carrito', 'error');
        return false; // Operación falló
    }
}

/**
 * Obtiene el carrito desde localStorage (carrito flotante)
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
 * Función local de respaldo para actualizar el contador
 * @param {number} count - Número de items
 */
function updateCartCountLocal(count) {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    cartCount.textContent = count;
    console.log(`Actualizando contador del carrito a: ${count}`);
    
    // Mostrar/ocultar el contador según haya items
    if (count > 0) {
        cartCount.classList.remove('hidden');
        cartCount.style.display = 'flex';
    } else {
        cartCount.classList.add('hidden');
        cartCount.style.display = 'none';
    }
}

/**
 * Inicializa el selector de cantidad 
 */
function initQuantitySelector() {
    const quantityMinus = document.getElementById('quantity-minus');
    const quantityPlus = document.getElementById('quantity-plus');
    const quantityInput = document.getElementById('product-quantity');
    
    if (!quantityMinus || !quantityPlus || !quantityInput) {
        console.log('Elementos de cantidad no encontrados');
        return;
    }
    
    // Verificar si ya están inicializados
    if (quantityMinus.hasAttribute('data-listener-added')) {
        console.log('Selectores de cantidad ya inicializados');
        return;
    }
    
    // CORREGIDO: No usar 999 como fallback, usar 0 si no hay valor
    const maxStock = parseInt(quantityInput.getAttribute('max')) || 0;
    
    // Si no hay stock, deshabilitar los controles
    if (maxStock <= 0) {
        quantityMinus.disabled = true;
        quantityPlus.disabled = true;
        quantityInput.disabled = true;
        quantityInput.value = 0;
        console.log('Controles de cantidad deshabilitados por falta de stock');
        return;
    }
    
    // Clonar elementos para remover event listeners existentes
    const newMinus = quantityMinus.cloneNode(true);
    const newPlus = quantityPlus.cloneNode(true);
    const newInput = quantityInput.cloneNode(true);
    
    // Reemplazar elementos
    quantityMinus.parentNode.replaceChild(newMinus, quantityMinus);
    quantityPlus.parentNode.replaceChild(newPlus, quantityPlus);
    quantityInput.parentNode.replaceChild(newInput, quantityInput);
    
    // Agregar nuevos event listeners
    newMinus.addEventListener('click', function() {
        decrementQuantity(maxStock);
    });
    
    newPlus.addEventListener('click', function() {
        incrementQuantity(maxStock);
    });
    
    newInput.addEventListener('change', function() {
        validateQuantityInput(maxStock);
    });
    
    // Deshabilitar el evento wheel para evitar cambios accidentales
    newInput.addEventListener('wheel', function(e) {
        e.preventDefault();
    });
    
    // Marcar como inicializados
    newMinus.setAttribute('data-listener-added', 'true');
    newPlus.setAttribute('data-listener-added', 'true');
    newInput.setAttribute('data-listener-added', 'true');
    
    // Actualizar estado de los botones según el stock
    updateQuantityButtons(maxStock);
    
    console.log('Selectores de cantidad inicializados correctamente');
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
    
    // Verificar disponibilidad en el carrito flotante (no checkout)
    const carrito = getCarritoFromStorage();
    const productId = document.getElementById('btnAddToCart')?.getAttribute('data-id');
    const existingItem = carrito.items.find(item => String(item.id) === String(productId));
    const usedStock = existingItem ? existingItem.cantidad : 0;
    const availableStock = maxStock - usedStock;
    
    if (value < availableStock && availableStock > 0) {
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
    
    // Si no hay stock, forzar a 0
    if (maxStock <= 0) {
        quantityInput.value = 0;
        return;
    }
    
    // Verificar disponibilidad en el carrito flotante (no checkout)
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
    
    // Si no hay stock, deshabilitar todo
    if (maxStock <= 0) {
        quantityMinus.disabled = true;
        quantityPlus.disabled = true;
        quantityInput.disabled = true;
        quantityMinus.style.opacity = '0.5';
        quantityPlus.style.opacity = '0.5';
        quantityMinus.style.cursor = 'not-allowed';
        quantityPlus.style.cursor = 'not-allowed';
        updateStockDisplay(maxStock, 0, 0);
        return;
    }
    
    // Verificar disponibilidad en el carrito flotante (no checkout)
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
    quantityPlus.disabled = currentValue >= availableStock || availableStock <= 0;
    quantityPlus.style.opacity = (currentValue >= availableStock || availableStock <= 0) ? '0.5' : '1';
    quantityPlus.style.cursor = (currentValue >= availableStock || availableStock <= 0) ? 'not-allowed' : 'pointer';
    
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
    
    // Crear HTML organizado en renglones
    let stockHTML = `
        <div class="stock-info-container">
            <div class="stock-item">
                <span class="stock-label">Stock total:</span>
                <span class="stock-value">${maxStock}</span>
            </div>
    `;
    
    if (usedStock > 0) {
        stockHTML += `
            <div class="stock-item">
                <span class="stock-label">En carrito:</span>
                <span class="stock-value cart-stock">${usedStock}</span>
            </div>
            <div class="stock-item">
                <span class="stock-label">Disponible:</span>
                <span class="stock-value available-stock">${availableStock}</span>
            </div>
        `;
    }
    
    stockHTML += `</div>`;
    
    stockElement.innerHTML = stockHTML;
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

// Actualizar botones de cantidad cuando se carga la página y cuando cambia el carrito
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar cada vez que cambie el localStorage del carrito flotante
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            const quantityInput = document.getElementById('product-quantity');
            if (quantityInput) {
                // CORREGIDO: No usar 999 como fallback
                const maxStock = parseInt(quantityInput.getAttribute('max')) || 0;
                updateQuantityButtons(maxStock);
            }
        }
    });
    
    // Actualizar botones inicialmente
    setTimeout(() => {
        const quantityInput = document.getElementById('product-quantity');
        if (quantityInput) {
            // CORREGIDO: No usar 999 como fallback
            const maxStock = parseInt(quantityInput.getAttribute('max')) || 0;
            updateQuantityButtons(maxStock);
        }
    }, 100);
});

// Escuchar cambios en el carrito para actualizar la disponibilidad
setInterval(function() {
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput && document.hasFocus()) {
        // CORREGIDO: No usar 999 como fallback
        const maxStock = parseInt(quantityInput.getAttribute('max')) || 0;
        updateQuantityButtons(maxStock);
    }
}, 2000); // Verificar cada 2 segundos si la página tiene el foco

// Escuchar eventos del carrito para sincronizar
window.addEventListener('cartUpdated', function(e) {
    console.log('Evento cartUpdated recibido en detalle producto:', e.detail);
    updateCartCountGlobal();
    
    // Actualizar botones de cantidad si estamos en una página de detalle
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput) {
        // CORREGIDO: No usar 999 como fallback
        const maxStock = parseInt(quantityInput.getAttribute('max')) || 0;
        updateQuantityButtons(maxStock);
    }
});

/**
 * Función global para actualizar el contador del carrito
 */
function updateCartCountGlobal() {
    // Usar la función global si está disponible
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    } else if (typeof updateCartCount === 'function') {
        updateCartCount();
    } else {
        // Función de respaldo local
        const carrito = getCarritoFromStorage();
        const totalItems = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
        updateCartCountLocal(totalItems);
    }
}