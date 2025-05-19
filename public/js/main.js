/**
 * main.js - Funcionalidades principales para la tienda online de Soluciones Tecnológicas Pradito
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades principales
    initCarrito();
    initSearchForm();
    initMobileMenu();
    initQuantitySelectors();
});

/**
 * Inicializa la funcionalidad del carrito de compras
 */
function initCarrito() {
    // Botones de "Añadir al carrito"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    
    if (!cartCount) return; // Si no existe el elemento, salir
    
    // Inicializar el contador del carrito
    const carrito = getCarritoFromStorage();
    updateCartCount(carrito.items.length);
    
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
            
            // Obtener la cantidad seleccionada
            const quantityInput = productCard.querySelector('.quantity-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Crear objeto de producto
            const producto = {
                id: productId,
                nombre: productName,
                precio: productPrice,
                imagen: productImg,
                cantidad: quantity
            };
            
            // Añadir el producto al carrito
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
            updateCartView(); // Actualizar vista del carrito
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
    
    // Botones de proceder al checkout (si existen)
    const checkoutButtons = document.querySelectorAll('.checkout-btn');
    checkoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/carrito';
        });
    });
}

/**
 * Inicializa los selectores de cantidad en los productos
 */
function initQuantitySelectors() {
    // Manejar botones de cantidad
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
 * Añade un producto al carrito
 * @param {Object} producto - Producto a añadir
 */
function addProductToCart(producto) {
    // Obtener carrito actual
    const carrito = getCarritoFromStorage();
    
    // Verificar si el producto ya está en el carrito
    const existingProductIndex = carrito.items.findIndex(item => item.id === producto.id);
    
    if (existingProductIndex !== -1) {
        // Incrementar cantidad
        carrito.items[existingProductIndex].cantidad += producto.cantidad;
    } else {
        // Añadir nuevo producto
        carrito.items.push(producto);
    }
    
    // Recalcular total
    carrito.total = calculateCartTotal(carrito.items);
    
    // Guardar carrito actualizado
    saveCarritoToStorage(carrito);
    
    // Actualizar contador
    updateCartCount(carrito.items.length);
    
    // Actualizar vista del carrito si está abierta
    updateCartView();
    // Añadir el efecto de rebote
    const floatingCart = document.getElementById('floating-cart');
    floatingCart.classList.add('cart-bounce');
    
    // Remover la clase después de la animación
    setTimeout(() => {
        floatingCart.classList.remove('cart-bounce');
    }, 750);

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
        } else {
            cartCount.classList.add('hidden');
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
        return total + (item.precio * item.cantidad);
    }, 0);
}

/**
 * Actualiza la vista del carrito
 */
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
            itemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toLocaleString('es-CO')}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.cantidad}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Agregar event listeners para los botones
        addCartItemEventListeners();
    }
    
    // Actualizar total
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${carrito.total.toLocaleString('es-CO')}`;
    }
}

/**
 * Agrega listeners a los botones del carrito
 */
function addCartItemEventListeners() {
    // Botones de cantidad
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const isIncrement = this.classList.contains('plus');
            
            updateProductQuantity(productId, isIncrement);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
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
    const index = carrito.items.findIndex(item => item.id === id);
    
    if (index === -1) return;
    
    if (isIncrement) {
        carrito.items[index].cantidad += 1;
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
    updateCartCount(carrito.items.length);
    updateCartView();
}

/**
 * Elimina un producto del carrito
 * @param {string} id - ID del producto
 */
function removeProductFromCart(id) {
    const carrito = getCarritoFromStorage();
    const index = carrito.items.findIndex(item => item.id === id);
    
    if (index === -1) return;
    
    carrito.items.splice(index, 1);
    
    // Recalcular total
    carrito.total = calculateCartTotal(carrito.items);
    
    // Guardar carrito actualizado
    saveCarritoToStorage(carrito);
    
    // Actualizar contador y vista
    updateCartCount(carrito.items.length);
    updateCartView();
}

/**
 * Inicializa el formulario de búsqueda
 */
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

/**
 * Inicializa el menú móvil
 */
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
 */
function showToast(message) {
    // Verificar si ya existe un toast
    let toast = document.querySelector('.toast');
    
    // Si no existe, crear uno nuevo
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Establecer el mensaje y mostrar
    toast.textContent = message;
    toast.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Envía los datos del pedido a WhatsApp cuando se procesa el checkout
 */
/**
 * Actualización para la sección de envío de mensajes a WhatsApp en main.js
 */

// Añadir al final de la función initCarrito o donde sea apropiado
function initWhatsAppFunctionality() {
    // Buscar cualquier botón o enlace de WhatsApp para asegurar el número correcto
    const whatsappLinks = document.querySelectorAll('a[href*="whatsapp.com/send"]');
    
    whatsappLinks.forEach(link => {
        // Actualizar el href para usar el número correcto
        const currentHref = link.getAttribute('href');
        if (currentHref && !currentHref.includes('573225865591')) {
            // Reemplazar cualquier número antiguo con el nuevo
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

/**
 * Envía los datos del pedido a WhatsApp cuando se procesa el checkout
 * Función actualizada con el número correcto
 */
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
        showToast('Por favor, completa todos los campos obligatorios');
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
        showToast('El carrito está vacío');
        return;
    }
    
    // Crear mensaje de WhatsApp
    let mensaje = `*Nuevo Pedido*%0A%0A`;
    mensaje += `*Nombres:* ${nombres}%0A`;
    mensaje += `*Apellidos:* ${apellidos}%0A`;
    mensaje += `*Documento:* ${tipoDocumento} ${numDocumento}%0A`;
    mensaje += `*Fecha Nacimiento:* ${fechaNacimiento}%0A`;
    mensaje += `*Ciudad:* ${ciudad}%0A`;
    mensaje += `*Dirección:* ${direccion}%0A`;
    mensaje += `*Teléfono Móvil:* ${telefonoMovil}%0A`;
    mensaje += `*Email:* ${email}%0A`;
    
    if (telefonoFijo) {
        mensaje += `*Teléfono Fijo:* ${telefonoFijo}%0A`;
    }
    
    if (sexo) {
        mensaje += `*Sexo:* ${sexo}%0A`;
    }
    
    if (estadoCivil) {
        mensaje += `*Estado Civil:* ${estadoCivil}%0A`;
    }
    
    mensaje += `*Método de Pago:* ${metodoPago}%0A%0A`;
    mensaje += `*Productos:*%0A`;
    
    carrito.items.forEach(item => {
        mensaje += `- ${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString('es-CO')}%0A`;
    });
    
    mensaje += `%0A*Total:* $${carrito.total.toLocaleString('es-CO')}`;
    
    // Número de WhatsApp de la empresa (actualizado)
    const whatsappNumber = '573225865591';
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${mensaje}`;
    
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

// Modificar la función de inicialización para incluir la función de WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades principales
    initCarrito();
    initSearchForm();
    initMobileMenu();
    initQuantitySelectors();
    initWhatsAppFunctionality(); // Agregar esta línea
});