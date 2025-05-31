document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades principales
    initCarrito();
    initSearchForm();
    initMobileMenu();
    initQuantitySelectors();
    initWhatsAppFunctionality(); 
});

function initCarrito() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    
    if (!cartCount) return; 
    
    // Inicializar el contador del carrito
    const carrito = getCarritoFromStorage();
    updateCartCount(getTotalItemsInCart(carrito));
    
    // Manejar clics en botones de añadir al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener información del producto
            const productId = this.dataset.id;
            const productCard = this.closest('.product-card');
            
            if (!productId || !productCard) return;
            
            const productName = productCard.querySelector('.product-title').textContent;
            let productPrice = productCard.querySelector('.product-price').textContent
                .replace('$', '').replace(/\./g, '').replace(/,/g, '').trim();
            
            // Asegurarse de que el precio sea un número válido
            productPrice = parseFloat(productPrice) || 0;
            
            const productImgElement = productCard.querySelector('img');
            const productImg = productImgElement ? productImgElement.src : '';
            
            // Obtener la cantidad seleccionada y stock disponible
            const quantityInput = productCard.querySelector('.quantity-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            const maxStock = quantityInput ? parseInt(quantityInput.getAttribute('max')) : 999;
            
            // Crear objeto de producto con stock
            const producto = {
                id: productId,
                nombre: productName,
                precio: productPrice,
                imagen: productImg,
                cantidad: quantity,
                stock: maxStock
            };
            
            // Añadir el producto al carrito (CON validaciones normales)
            const success = addProductToCart(producto, false); // false = hacer validaciones
            
            // Solo mostrar mensaje de confirmación si fue exitoso
            if (success) {
                // Mostrar mensaje de confirmación
                showToast(`${productName} ha sido añadido al carrito`);
            }
        });
    });
    
    // Botón para mostrar el carrito
    const cartIcon = document.getElementById('floating-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay') || createCartOverlay();
    
    if (cartIcon && cartSidebar) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('show');
            updateCartView(); 
        });
    }
    
    // Botón para cerrar el carrito
    const closeCartButton = document.querySelector('.close-cart');
    if (closeCartButton && cartSidebar) {
        closeCartButton.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('show');
        });
    }
    
    // Cerrar carrito al hacer clic en el overlay
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('show');
        });
    }
    
    // Botones de proceder al checkout (ir a página de carrito)
    const checkoutButtons = document.querySelectorAll('.checkout-btn');
    checkoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Verificar que hay productos en el carrito
            const carrito = getCarritoFromStorage();
            if (!carrito.items || carrito.items.length === 0) {
                showToast('Tu carrito está vacío', 'error');
                return;
            }
            
            //Mover carrito a checkout y limpiar carrito flotante
            moveCarritoToCheckout();
            
            // Cerrar carrito flotante si está abierto
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('show');
            
            // Ir a la página de carrito
            window.location.href = '/carrito';
        });
    });
    
    // Escuchar eventos personalizados de actualización del carrito
    window.addEventListener('cartUpdated', function(e) {
        console.log('Evento cartUpdated recibido:', e.detail);
        
        // Solo actualizar si NO venimos de la página del carrito
        if (e.detail && e.detail.source !== 'cartPage') {
            const carrito = getCarritoFromStorage();
            updateCartCount(getTotalItemsInCart(carrito));
            updateCartView();
        }
    });
    
    // Actualizar carrito cuando cambia el localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            console.log('LocalStorage cambió, actualizando carrito flotante');
            const carrito = getCarritoFromStorage();
            updateCartCount(getTotalItemsInCart(carrito));
            updateCartView();
        }
    });
}

function initQuantitySelectors() {
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const isPlus = this.classList.contains('plus');
            const input = this.parentElement.querySelector('.quantity-input');
            let value = parseInt(input.value) || 1;
            const max = parseInt(input.getAttribute('max')) || 99;
            
            if (isPlus && value < max) {
                input.value = value + 1;
            } else if (!isPlus && value > 1) {
                input.value = value - 1;
            }
        });
    });

    // Validar entrada directa en campos de cantidad
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            const max = parseInt(this.getAttribute('max')) || 99;
            
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else if (value > max) {
                this.value = max;
            }
        });
    });
}

/**
 *  Mueve el carrito al storage de checkout y limpia el carrito flotante
 */
function moveCarritoToCheckout() {
    try {
        const carrito = getCarritoFromStorage();
        
        if (carrito.items && carrito.items.length > 0) {
            // Guardar en checkout storage
            localStorage.setItem('carritoCheckout', JSON.stringify(carrito));
            
            // Limpiar carrito flotante
            localStorage.removeItem('carrito');
            
            // Actualizar UI del carrito flotante
            updateCartCount(0);
            updateCartView();
            
            console.log('Carrito movido a checkout y carrito flotante limpiado');
        }
    } catch (error) {
        console.error('Error al mover carrito a checkout:', error);
    }
}

/**
 *  Restaura el carrito desde checkout al carrito flotante
 */
function restoreCarritoFromCheckout() {
    try {
        const carritoCheckout = getCarritoCheckoutFromStorage();
        
        if (carritoCheckout.items && carritoCheckout.items.length > 0) {
            // Restaurar al carrito flotante
            localStorage.setItem('carrito', JSON.stringify(carritoCheckout));
            
            // Actualizar UI del carrito flotante
            updateCartCount(getTotalItemsInCart(carritoCheckout));
            updateCartView();
            
            console.log('Carrito restaurado desde checkout');
            showToast('Carrito restaurado para seguir comprando');
        }
    } catch (error) {
        console.error('Error al restaurar carrito desde checkout:', error);
    }
}

/**
 * Obtiene el carrito de checkout
 */
function getCarritoCheckoutFromStorage() {
    const carritoJSON = localStorage.getItem('carritoCheckout');
    
    if (carritoJSON) {
        try {
            return JSON.parse(carritoJSON);
        } catch (e) {
            console.error('Error al parsear carrito checkout:', e);
        }
    }
    
    // Carrito por defecto
    return {
        items: [],
        total: 0
    };
}

/**
 *  Limpia el carrito de checkout
 */
function clearCarritoCheckout() {
    try {
        localStorage.removeItem('carritoCheckout');
        console.log('Carrito checkout limpiado');
    } catch (error) {
        console.error('Error al limpiar carrito checkout:', error);
    }
}

/**
 * Crea el overlay para el carrito si no existe
 * @returns {HTMLDivElement} El elemento overlay creado
 */
function createCartOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    document.body.appendChild(overlay);
    return overlay;
}

/**
 * Añade un producto al carrito con validación de stock
 * @param {Object} producto - Producto a añadir
 * @param {boolean} skipValidation - Si se deben saltar los MENSAJES DE ERROR (las restricciones siempre se respetan)
 * @returns {boolean} - True si se agregó exitosamente, false si no
 */
function addProductToCart(producto, skipValidation = false) {
    console.log('addProductToCart llamada con skipValidation:', skipValidation);
    console.log('Añadiendo producto al carrito:', producto);
    
    // Obtener carrito actual
    const carrito = getCarritoFromStorage();
    
    // Verificar si el producto ya está en el carrito
    const existingProductIndex = carrito.items.findIndex(item => String(item.id) === String(producto.id));
    
    if (existingProductIndex !== -1) {
        // SIEMPRE verificar que no exceda el stock, independiente de skipValidation
        const newQuantity = carrito.items[existingProductIndex].cantidad + producto.cantidad;
        const maxStock = producto.stock || carrito.items[existingProductIndex].stock || 999;
        
        if (newQuantity <= maxStock) {
            // Solo aquí es seguro añadir
            carrito.items[existingProductIndex].cantidad = newQuantity;
            // Actualizar stock si se proporciona
            if (producto.stock) {
                carrito.items[existingProductIndex].stock = producto.stock;
            }
            console.log(`Producto existente actualizado: ${carrito.items[existingProductIndex].cantidad}/${maxStock}`);
        } else {
            // NUNCA exceder el stock, incluso con skipValidation
            console.log(`BLOQUEADO: Intentó añadir ${producto.cantidad}, pero excedería stock. Actual: ${carrito.items[existingProductIndex].cantidad}, Máximo: ${maxStock}`);
            
            // Solo mostrar error si NO se saltean validaciones
            if (!skipValidation) {
                showToast(`Solo hay ${maxStock} unidades disponibles de ${producto.nombre}`, 'error');
            }
            return false; // Operación falló
        }
    } else {
        // Nuevo producto: verificar que la cantidad inicial no exceda stock
        if (producto.cantidad <= producto.stock) {
            carrito.items.push(producto);
            console.log(`Nuevo producto añadido: ${producto.cantidad}/${producto.stock}`);
        } else {
            console.log(`BLOQUEADO: Nuevo producto excede stock inicial. Cantidad: ${producto.cantidad}, Stock: ${producto.stock}`);
            
            // Solo mostrar error si NO se saltean validaciones
            if (!skipValidation) {
                showToast(`Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`, 'error');
            }
            return false; // Operación falló
        }
    }
    
    // Recalcular total
    carrito.total = calculateCartTotal(carrito.items);
    
    // Guardar carrito actualizado
    saveCarritoToStorage(carrito);
    
    // Actualizar contador
    updateCartCount(getTotalItemsInCart(carrito));
    
    // Actualizar vista del carrito si está abierta
    updateCartView();
    
    // Notificar cambio a otras partes de la aplicación
    window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { source: 'addProduct', productId: producto.id, action: 'add' }
    }));
    
    // Añadir el efecto de rebote
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.add('cart-bounce');
        
        // Remover la clase después de la animación
        setTimeout(() => {
            floatingCart.classList.remove('cart-bounce');
        }, 750);
    }
    
    console.log('addProductToCart completado exitosamente');
    return true; // Operación exitosa
}

/**
 * Calcula el total de items en el carrito
 * @param {Object} carrito - Carrito de compras
 * @returns {number} Total de items
 */
function getTotalItemsInCart(carrito) {
    if (!carrito || !carrito.items || !Array.isArray(carrito.items)) {
        console.warn('Carrito inválido en getTotalItemsInCart:', carrito);
        return 0;
    }
    
    const total = carrito.items.reduce((sum, item) => {
        if (!item || typeof item.cantidad === 'undefined') {
            console.warn('Item inválido en carrito:', item);
            return sum;
        }
        
        const cantidad = parseInt(item.cantidad) || 0;
        if (cantidad < 0) {
            console.warn('Cantidad negativa detectada:', cantidad, 'en item:', item);
            return sum;
        }
        
        return sum + cantidad;
    }, 0);
    
    console.log(`Total de items en carrito calculado: ${total}`);
    return total;
}

/**
 * Actualiza el contador del carrito
 * @param {number} count - Número de items
 */
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) {
        console.log('No se encontró elemento .cart-count');
        return;
    }
    
    // Si no se proporciona count, calcularlo desde el carrito
    if (typeof count === 'undefined') {
        try {
            const carrito = getCarritoFromStorage();
            count = getTotalItemsInCart(carrito);
            console.log('Count calculado automáticamente:', count);
        } catch (e) {
            console.error('Error al calcular count automáticamente:', e);
            count = 0;
        }
    }
    
    console.log(`Actualizando contador del carrito a: ${count}`);
    
    // Validar que count sea un número válido
    if (isNaN(count) || count < 0) {
        console.warn('Count inválido, estableciendo a 0:', count);
        count = 0;
    }
    
    // Actualizar número
    cartCount.textContent = count;
    
    // Mostrar/ocultar el contador según haya items
    if (count > 0) {
        cartCount.classList.remove('hidden');
        cartCount.style.display = 'flex';
        console.log(`Contador mostrado con ${count} items`);
    } else {
        cartCount.classList.add('hidden');
        cartCount.style.display = 'none';
        console.log('Contador oculto - carrito vacío');
    }
}

/**
 * Obtiene el carrito del almacenamiento local
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
 * Guarda el carrito en el almacenamiento local
 * @param {Object} carrito - Carrito a guardar
 */
function saveCarritoToStorage(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Carrito guardado en localStorage:', carrito);
}

/**
 * Calcula el total del carrito
 * @param {Array} items - Items del carrito
 * @returns {number} Total calculado
 */
function calculateCartTotal(items) {
    return items.reduce((total, item) => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 0;
        return total + (precio * cantidad);
    }, 0);
}

function updateCartView() {
    console.log('Actualizando vista del carrito flotante...');
    
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total');
    
    if (!cartItemsContainer) return;
    
    const carrito = getCarritoFromStorage();
    
    // Limpiar contenedor
    cartItemsContainer.innerHTML = '';
    
    if (carrito.items.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">El carrito está vacío</div>';
    } else {
        // Crear elementos para cada item
        carrito.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            const maxStock = item.stock || 999;
            const precio = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 0;
            const subtotal = precio * cantidad;
            
            itemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${precio.toLocaleString('es-CO')}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}" ${cantidad <= 1 ? 'disabled' : ''}>-</button>
                        <span>${cantidad}</span>
                        <button class="quantity-btn plus" data-id="${item.id}" ${cantidad >= maxStock ? 'disabled' : ''}>+</button>
                    </div>
                    <p class="stock-info">Stock: ${maxStock}</p>
                </div>
                <div class="cart-item-subtotal">
                    <p>$${subtotal.toLocaleString('es-CO')}</p>
                    <button class="remove-item" data-id="${item.id}">×</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Agregar event listeners para los botones
        addCartItemEventListeners();
    }
    
    // Calcular y actualizar total
    const total = carrito.items.reduce((sum, item) => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 0;
        return sum + (precio * cantidad);
    }, 0);
    
    // Actualizar total en el carrito
    carrito.total = total;
    saveCarritoToStorage(carrito);
    
    // Actualizar total en la interfaz
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    }
    
    console.log('Vista del carrito flotante actualizada');
}

function addCartItemEventListeners() {
    // Botones de cantidad
    document.querySelectorAll('.cart-items .quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const productId = this.dataset.id;
            const isIncrement = this.classList.contains('plus');
            
            console.log(`${isIncrement ? 'Incrementando' : 'Decrementando'} producto ${productId} en carrito flotante`);
            updateProductQuantity(productId, isIncrement);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.cart-items .remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            console.log(`Eliminando producto ${productId} del carrito flotante`);
            removeProductFromCart(productId);
        });
    });
}

/**
 * Actualiza la cantidad de un producto 
 * @param {string} id - ID del producto
 * @param {boolean} isIncrement - Si es incremento o decremento
 */
function updateProductQuantity(id, isIncrement) {
    const carrito = getCarritoFromStorage();
    const index = carrito.items.findIndex(item => String(item.id) === String(id));
    
    if (index === -1) return;
    
    const item = carrito.items[index];
    const maxStock = item.stock || 999;
    
    if (isIncrement) {
        // Validar que no exceda el stock
        if (item.cantidad < maxStock) {
            carrito.items[index].cantidad += 1;
        } else {
            showToast(`Solo hay ${maxStock} unidades disponibles`, 'error');
            return;
        }
    } else {
        carrito.items[index].cantidad -= 1;
        
        // Si la cantidad llega a 0, eliminar el producto
        if (carrito.items[index].cantidad <= 0) {
            carrito.items.splice(index, 1);
        }
    }
    
    // Recalcular total
    carrito.total = calculateCartTotal(carrito.items);
    
    // Guardar carrito actualizado
    saveCarritoToStorage(carrito);
    
    // Actualizar contador y vista
    updateCartCount(getTotalItemsInCart(carrito));
    updateCartView();
    
    // Notificar cambio a otras partes de la aplicación
    window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { source: 'floatingCart', productId: id, action: isIncrement ? 'increment' : 'decrement' }
    }));
}

/**
 * Elimina un producto del carrito
 * @param {string} id - ID del producto
 */
function removeProductFromCart(id) {
    const carrito = getCarritoFromStorage();
    const index = carrito.items.findIndex(item => String(item.id) === String(id));
    
    if (index === -1) return;
    
    const productName = carrito.items[index].nombre;
    carrito.items.splice(index, 1);
    
    // Recalcular total
    carrito.total = calculateCartTotal(carrito.items);
    
    // Guardar carrito actualizado
    saveCarritoToStorage(carrito);
    
    // Actualizar contador y vista
    updateCartCount(getTotalItemsInCart(carrito));
    updateCartView();
    
    // Notificar cambio a otras partes de la aplicación
    window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { source: 'floatingCart', productId: id, action: 'remove' }
    }));
    
    showToast(`${productName} eliminado del carrito`);
}

function initSearchForm() {
    const searchForm = document.querySelector('.search-container');
    if (!searchForm) return;
    
    const searchInput = searchForm.querySelector('input');
    const searchButton = searchForm.querySelector('button');
    
    if (!searchInput || !searchButton) return;
    
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query) {
            window.location.href = `/productos/buscar?q=${encodeURIComponent(query)}`;
        }
    });
    
    // También enviar al presionar Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchButton.click();
        }
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (!menuToggle || !mainNav) return;
    
    menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('open');
        this.classList.toggle('active');
    });
}

/**
 * Muestra un mensaje toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (success, error)
 */
function showToast(message, tipo = 'success') {
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
    
    // Añadir clase según el tipo
    if (tipo === 'error') {
        toast.classList.add('toast-error');
        toast.style.backgroundColor = '#e74c3c';
    } else {
        toast.classList.add('toast-success');
        toast.style.backgroundColor = '#2ecc71';
    }
    
    // Configurar estilos
    toast.style.color = 'white';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    toast.style.transition = 'all 0.3s ease';
    
    // Añadir icono según el tipo
    let icono = tipo === 'success' ? 
        '<i class="fas fa-check-circle" style="margin-right: 8px;"></i>' : 
        '<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>';
    
    // Establecer el contenido
    toast.innerHTML = `${icono}<span>${message}</span>`;
    
    // Mostrar toast
    toast.classList.add('show');
    toast.style.opacity = '1';
    toast.style.visibility = 'visible';
    
    // Ocultar después del tiempo apropiado
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

function initWhatsAppFunctionality() {
    const whatsappLinks = document.querySelectorAll('a[href*="whatsapp.com/send"]');
    
    whatsappLinks.forEach(link => {
        const currentHref = link.getAttribute('href');
        if (currentHref && !currentHref.includes('573225865591')) {
            const newHref = currentHref.replace(/phone=\d+/, 'phone=573225865591');
            link.setAttribute('href', newHref);
        }
    });
    
    // Verificar formulario de envío de pedido a WhatsApp
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            enviarPedidoWhatsApp();
        });
    }
}
function enviarPedidoWhatsApp() {
    const form = document.getElementById('checkout-form');
    
    if (!form) return;
    
    // Validar campos requeridos
    const camposRequeridos = [
        'nombres', 'apellidos', 'tipo_documento', 'num_documento',
        'fecha_nacimiento', 'ciudad', 'direccion', 'telefono_movil', 'email'
    ];
    
    let formularioValido = true;
    camposRequeridos.forEach(campo => {
        const input = form.querySelector(`[name="${campo}"]`);
        if (!input || !input.value.trim()) {
            if (input) {
                input.classList.add('error');
            }
            formularioValido = false;
        } else {
            if (input) {
                input.classList.remove('error');
            }
        }
    });
    
    // Validar mayoría de edad (18 años)
    const fechaNacimiento = form.querySelector('[name="fecha_nacimiento"]');
    if (fechaNacimiento && fechaNacimiento.value) {
        const fechaNac = new Date(fechaNacimiento.value);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();
        
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        
        if (edad < 18) {
            fechaNacimiento.classList.add('error');
            showToast('Debe ser mayor de 18 años para realizar un pedido', 'error');
            formularioValido = false;
        }
    }
    
    if (!formularioValido) {
        showToast('Por favor, completa todos los campos obligatorios correctamente', 'error');
        return;
    }
    
    // Obtener datos del formulario
    const nombres = form.querySelector('[name="nombres"]').value;
    const apellidos = form.querySelector('[name="apellidos"]').value;
    const tipoDocumento = form.querySelector('[name="tipo_documento"]').value;
    const numDocumento = form.querySelector('[name="num_documento"]').value;
    const fechaNacimientoValue = form.querySelector('[name="fecha_nacimiento"]').value;
    const ciudad = form.querySelector('[name="ciudad"]').value;
    const direccion = form.querySelector('[name="direccion"]').value;
    const telefonoMovil = form.querySelector('[name="telefono_movil"]').value;
    const email = form.querySelector('[name="email"]').value;
    const metodoPago = form.querySelector('[name="metodo_pago"]:checked').value;
    
    // Campos opcionales
    const sexo = form.querySelector('[name="sexo"]')?.value || 'No especificado';
    const estadoCivil = form.querySelector('[name="estado_civil"]')?.value || 'No especificado';
    const telefonoFijo = form.querySelector('[name="telefono_fijo"]')?.value || 'No proporcionado';
    
    // Detectar si estamos en la página del carrito o en otra página
    const isCartPage = window.location.pathname.includes('/carrito') || 
                      document.querySelector('#cart-items-list') !== null;
    
    // Obtener carrito según el contexto
    let carrito;
    if (isCartPage) {
        // En la página del carrito, usar carrito de checkout
        carrito = getCarritoCheckoutFromStorage();
    } else {
        // En otras páginas, usar carrito flotante
        carrito = getCarritoFromStorage();
    }
    
    if (!carrito.items || carrito.items.length === 0) {
        showToast('El carrito está vacío. Por favor, añade productos antes de confirmar el pedido.', 'error');
        return;
    }
    
    // Construir el mensaje pero sin aplicar %0A directamente
    let mensaje = "Nuevo Pedido\n\n";
    mensaje += `Nombres: ${nombres}\n`;
    mensaje += `Apellidos: ${apellidos}\n`;
    mensaje += `Documento: ${tipoDocumento} ${numDocumento}\n`;
    mensaje += `Fecha Nacimiento: ${fechaNacimientoValue}\n`;
    mensaje += `Ciudad: ${ciudad}\n`;
    mensaje += `Dirección: ${direccion}\n`;
    mensaje += `Teléfono Móvil: ${telefonoMovil}\n`;
    mensaje += `Email: ${email}\n`;
    
    if (telefonoFijo && telefonoFijo !== 'No proporcionado') {
        mensaje += `Teléfono Fijo: ${telefonoFijo}\n`;
    }
    
    if (sexo && sexo !== 'No especificado') {
        mensaje += `Sexo: ${sexo}\n`;
    }
    
    if (estadoCivil && estadoCivil !== 'No especificado') {
        mensaje += `Estado Civil: ${estadoCivil}\n`;
    }
    
    mensaje += `Método de Pago: ${metodoPago}\n\n`;
    mensaje += `Productos:\n`;
    
    let total = 0;
    carrito.items.forEach(item => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 0;
        const subtotal = precio * cantidad;
        total += subtotal;
        mensaje += `- ${cantidad}x ${item.nombre} - $${subtotal.toLocaleString('es-CO')}\n`;
    });
    
    mensaje += `\nTotal: ${total.toLocaleString('es-CO')}`;
    
    // Número de WhatsApp de la empresa 
    const whatsappNumber = '573225865591';
    
    // Crear URL de WhatsApp con el mensaje adecuadamente codificado
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(mensaje)}`;
    
    // Mostrar mensaje de confirmación
    showToast('¡Pedido enviado correctamente! Abriendo WhatsApp...');
    
    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carritos después de enviar
    localStorage.removeItem('carrito');
    localStorage.removeItem('carritoCheckout');
    
    // Redirigir a la página de confirmación
    setTimeout(() => {
        window.location.href = '/pedidos/confirmacion';
    }, 2000);
}

// Exponer funciones globalmente para uso en otras páginas
window.restoreCarritoFromCheckout = restoreCarritoFromCheckout;
window.clearCarritoCheckout = clearCarritoCheckout;
window.getCarritoCheckoutFromStorage = getCarritoCheckoutFromStorage;