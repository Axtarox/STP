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
            
            // Añadir el producto al carrito con validación de stock
            addProductToCart(producto);
            
            // Mostrar mensaje de confirmación
            showToast(`${productName} ha sido añadido al carrito`);
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
            
            // Cerrar carrito flotante si está abierto
            if (cartSidebar) cartSidebar.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('show');
            
            // Ir a la página de carrito
            window.location.href = '/carrito';
        });
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
 */
function addProductToCart(producto) {
    // Obtener carrito actual
    const carrito = getCarritoFromStorage();
    
    // Verificar si el producto ya está en el carrito
    const existingProductIndex = carrito.items.findIndex(item => String(item.id) === String(producto.id));
    
    if (existingProductIndex !== -1) {
        // Calcular nueva cantidad
        const newQuantity = carrito.items[existingProductIndex].cantidad + producto.cantidad;
        const maxStock = producto.stock || carrito.items[existingProductIndex].stock || 999;
        
        // Validar que no exceda el stock
        if (newQuantity <= maxStock) {
            carrito.items[existingProductIndex].cantidad = newQuantity;
            // Actualizar stock si se proporciona
            if (producto.stock) {
                carrito.items[existingProductIndex].stock = producto.stock;
            }
        } else {
            showToast(`Solo hay ${maxStock} unidades disponibles de ${producto.nombre}`, 'error');
            return;
        }
    } else {
        // Validar stock antes de añadir
        if (producto.cantidad > producto.stock) {
            showToast(`Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`, 'error');
            return;
        }
        // Añadir nuevo producto
        carrito.items.push(producto);
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
}

/**
 * Calcula el total de items en el carrito
 * @param {Object} carrito - Carrito de compras
 * @returns {number} Total de items
 */
function getTotalItemsInCart(carrito) {
    return carrito.items.reduce((total, item) => total + (parseInt(item.cantidad) || 0), 0);
}

/**
 * Actualiza el contador del carrito
 * @param {number} count - Número de items
 */
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        
        // Mostrar/ocultar el contador según haya items
        if (count > 0) {
            cartCount.classList.remove('hidden');
            cartCount.style.display = 'flex';
        } else {
            cartCount.classList.add('hidden');
            cartCount.style.display = 'none';
        }
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
}

function addCartItemEventListeners() {
    // Botones de cantidad
    document.querySelectorAll('.cart-items .quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const productId = this.dataset.id;
            const isIncrement = this.classList.contains('plus');
            
            updateProductQuantity(productId, isIncrement);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.cart-items .remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            removeProductFromCart(productId);
        });
    });
}

/**
 * Actualiza la cantidad de un producto con validación de stock
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
    
    // Sincronizar con página de carrito si existe
    syncCartPage();
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
    
    // Sincronizar con página de carrito si existe
    syncCartPage();
    
    showToast(`${productName} eliminado del carrito`);
}

/**
 * Sincroniza con la página de carrito si está abierta
 */
function syncCartPage() {
    // Si estamos en la página del carrito, recargar su contenido
    if (window.location.pathname === '/carrito' && typeof loadCart === 'function') {
        loadCart();
    }
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
    
    if (!formularioValido) {
        showToast('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }
    
    // Obtener datos del formulario
    const nombres = form.querySelector('[name="nombres"]').value;
    const apellidos = form.querySelector('[name="apellidos"]').value;
    const tipoDocumento = form.querySelector('[name="tipo_documento"]').value;
    const numDocumento = form.querySelector('[name="num_documento"]').value;
    const fechaNacimiento = form.querySelector('[name="fecha_nacimiento"]').value;
    const ciudad = form.querySelector('[name="ciudad"]').value;
    const direccion = form.querySelector('[name="direccion"]').value;
    const telefonoMovil = form.querySelector('[name="telefono_movil"]').value;
    const email = form.querySelector('[name="email"]').value;
    const metodoPago = form.querySelector('[name="metodo_pago"]:checked').value;
    
    // Campos opcionales
    const sexo = form.querySelector('[name="sexo"]')?.value || '';
    const estadoCivil = form.querySelector('[name="estado_civil"]')?.value || '';
    const telefonoFijo = form.querySelector('[name="telefono_fijo"]')?.value || '';
    
    // Obtener carrito
    const carrito = getCarritoFromStorage();
    
    if (carrito.items.length === 0) {
        showToast('El carrito está vacío', 'error');
        return;
    }
    
    // Construir el mensaje pero sin aplicar %0A directamente
    let mensaje = "Nuevo Pedido\n\n";
    mensaje += `Nombres: ${nombres}\n`;
    mensaje += `Apellidos: ${apellidos}\n`;
    mensaje += `Documento: ${tipoDocumento} ${numDocumento}\n`;
    mensaje += `Fecha Nacimiento: ${fechaNacimiento}\n`;
    mensaje += `Ciudad: ${ciudad}\n`;
    mensaje += `Dirección: ${direccion}\n`;
    mensaje += `Teléfono Móvil: ${telefonoMovil}\n`;
    mensaje += `Email: ${email}\n`;
    
    if (telefonoFijo) {
        mensaje += `Teléfono Fijo: ${telefonoFijo}\n`;
    }
    
    if (sexo) {
        mensaje += `Sexo: ${sexo}\n`;
    }
    
    if (estadoCivil) {
        mensaje += `Estado Civil: ${estadoCivil}\n`;
    }
    
    mensaje += `Método de Pago: ${metodoPago}\n\n`;
    mensaje += `Productos:\n`;
    
    carrito.items.forEach(item => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 0;
        const subtotal = precio * cantidad;
        mensaje += `- ${cantidad}x ${item.nombre} - $${subtotal.toLocaleString('es-CO')}\n`;
    });
    
    mensaje += `\nTotal: $${carrito.total.toLocaleString('es-CO')}`;
    
    // Número de WhatsApp de la empresa 
    const whatsappNumber = '573225865591';
    
    // Crear URL de WhatsApp con el mensaje adecuadamente codificado
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(mensaje)}`;
    
    // Mostrar mensaje de confirmación
    showToast('¡Pedido enviado correctamente! Abriendo WhatsApp...');
    
    // Abrir WhatsApp en una nueva ventana
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito después de enviar
    localStorage.removeItem('carrito');
    updateCartCount(0);
    
    // Redirigir a la página de confirmación
    setTimeout(() => {
        window.location.href = '/pedidos/confirmacion';
    }, 2000);
}