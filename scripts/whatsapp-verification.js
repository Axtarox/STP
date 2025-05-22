/**
 * Script para verificar y corregir los enlaces de WhatsApp
 */

(function() {
    // Número de WhatsApp correcto
    const correctNumber = '573225865591';
    
    // Función para verificar enlaces de WhatsApp
    function verifyWhatsAppLinks() {
        // Seleccionar todos los enlaces que contengan "whatsapp.com/send"
        const whatsappLinks = document.querySelectorAll('a[href*="whatsapp.com/send"]');
        
        // Iterar sobre los enlaces encontrados
        whatsappLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Verificar si el enlace no contiene el número correcto
            if (href && !href.includes(`phone=${correctNumber}`)) {
                // Extraer el número actual mediante una expresión regular
                const phoneMatch = href.match(/phone=(\d+)/);
                const currentNumber = phoneMatch ? phoneMatch[1] : null;
                
                if (currentNumber) {
                    // Reemplazar el número incorrecto con el correcto
                    const newHref = href.replace(`phone=${currentNumber}`, `phone=${correctNumber}`);
                    link.setAttribute('href', newHref);
                    console.log(`WhatsApp link corrected: ${currentNumber} → ${correctNumber}`);
                } else {
                    // Si no hay un número en el enlace, agregar el parámetro correcto
                    let newHref = href;
                    if (href.includes('?')) {
                        // Si ya hay parámetros, añadir el parámetro de teléfono
                        newHref += `&phone=${correctNumber}`;
                    } else {
                        // Si no hay parámetros, iniciar la cadena de consulta
                        newHref += `?phone=${correctNumber}`;
                    }
                    link.setAttribute('href', newHref);
                    console.log(`WhatsApp link updated: Added number ${correctNumber}`);
                }
            }
        });
    }
    
    // Función para verificar el envío de mensajes de WhatsApp
    function monitorWhatsAppMessages() {
        // Escuchar eventos de clic en enlaces de WhatsApp
        document.addEventListener('click', function(event) {
            const target = event.target.closest('a[href*="whatsapp.com/send"]');
            if (target) {
                // Registrar el evento
                console.log('WhatsApp link clicked:', target.href);
                
                // Verificar que el número sea correcto
                if (!target.href.includes(`phone=${correctNumber}`)) {
                    console.warn('WARNING: WhatsApp link has incorrect phone number!');
                    
                    // Prevenir la navegación por defecto
                    event.preventDefault();
                    
                    // Corregir el enlace y abrirlo
                    let correctedHref = target.href.replace(/phone=\d+/, `phone=${correctNumber}`);
                    if (!correctedHref.includes('phone=')) {
                        correctedHref += correctedHref.includes('?') ? 
                            `&phone=${correctNumber}` : 
                            `?phone=${correctNumber}`;
                    }
                    
                    // Notificar y abrir el enlace corregido
                    console.log('Corrected WhatsApp link:', correctedHref);
                    window.open(correctedHref, target.target || '_blank');
                }
            }
        });
    }
    
    // Ejecutar las funciones cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        verifyWhatsAppLinks();
        monitorWhatsAppMessages();
        
        // También verificar cuando se añadan nuevos elementos al DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Verificar los enlaces nuevamente si se añaden nodos al DOM
                    verifyWhatsAppLinks();
                }
            });
        });
        
        // Observar cambios en el cuerpo del documento
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();