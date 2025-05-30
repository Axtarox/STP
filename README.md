# Soluciones Tecnológicas Pradito - Tienda Virtual

![Banner Pradito](public/img/backgrounds/hero-bg.jpg)

Descripción
Tienda virtual completa para Soluciones Tecnológicas Pradito, una empresa ubicada en San Antonio de Prado, Medellín, Colombia, dedicada a la venta de productos y servicios informáticos. La aplicación incluye un sistema completo de gestión de inventario, carrito de compras inteligente, panel de administración y procesamiento de pedidos a través de WhatsApp.
🏪 Sobre la Empresa
Soluciones Tecnológicas Pradito nace en 2017 del sueño de una pareja apasionada por la tecnología. Comenzando con reparaciones desde el hogar, en septiembre de 2018 abrieron su primer local al público. Con más de 6 años de experiencia, se han consolidado como una referencia en:

Reparación de celulares y computadoras
Venta de accesorios tecnológicos
Mantenimiento y limpieza de equipos
Instalación de programas y software
Venta de repuestos especializados

🚀 Características Principales
🛒 Tienda Virtual

Catálogo dinámico de productos con categorías organizadas
Carrito de compras flotante con persistencia en localStorage
Sistema de stock inteligente con validaciones en tiempo real
Búsqueda avanzada por nombre, descripción y categoría
Diseño responsive optimizado para todos los dispositivos
Galería de servicios con descripciones detalladas

🎛️ Panel de Administración

Dashboard completo con estadísticas en tiempo real
Gestión de productos (crear, editar, eliminar, activar/desactivar)
Gestión de categorías con control de productos asociados
Gestión de servicios con imágenes y disponibilidad
Carga de imágenes con validación y optimización
Control de inventario con cantidades disponibles

📱 Integración WhatsApp

Procesamiento automático de pedidos vía WhatsApp
Formularios de contacto con envío directo
Consultas de productos individuales
Cotizaciones de servicios personalizadas

💳 Sistema de Pagos

Transferencias Bancolombia (Cuenta de Ahorros)
Pagos Nequi con número verificado
Pago contra entrega con recargo de envío
Formulario completo con validación de mayoría de edad

🛠️ Tecnologías Utilizadas
Backend

Node.js (v16.0.0+) - Entorno de ejecución
Express.js (v5.1.0) - Framework web
MySQL (v8.0+) - Base de datos relacional
Express Session - Manejo de sesiones
Multer - Carga de archivos
Method Override - Soporte para métodos HTTP

Frontend

HTML5 con templates personalizados
CSS3 con variables CSS y diseño responsive
JavaScript Vanilla - Funcionalidad del lado cliente
Font Awesome (v6.4.0) - Iconografía
Diseño Mobile-First - Optimizado para móviles

Características Técnicas

Sistema de renderizado HTML personalizado
Middleware de autenticación para administradores
Manejo de errores robusto y logging detallado
Validaciones de formularios tanto frontend como backend
Gestión de archivos con nombres únicos y validación

📦 Instalación Completa
Requisitos del Sistema
Hardware Mínimo

Procesador: Intel Core i3 o AMD equivalente
RAM: 4GB (recomendado 8GB)
Almacenamiento: 2GB libres
Conexión a Internet: Requerida

Software Necesario

SO: Windows 10/11, macOS 10.14+, o Linux Ubuntu 18.04+
Node.js: v16.0.0 o superior
MySQL: v8.0 o superior (o MariaDB 10.3+)
Navegador: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

Pasos de Instalación

Clonar el repositorio:
bashgit clone https://github.com/Axtarox/STP.git
cd STP

Instalar dependencias:
bashnpm install

Configurar base de datos MySQL:
sqlCREATE DATABASE tienda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pradito_user'@'localhost' IDENTIFIED BY 'pradito_password';
GRANT ALL PRIVILEGES ON tienda_db.* TO 'pradito_user'@'localhost';
FLUSH PRIVILEGES;

Configurar variables de entorno:
Crear archivo .env en la raíz del proyecto:
env# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=tienda_db
DB_PORT=3306

# Configuración del servidor
PORT=4000
NODE_ENV=development

# Clave secreta para sesiones
SESSION_SECRET=pradito_secret_key_2024

Inicializar la base de datos:
bashnpm run init-db

Iniciar la aplicación:
bash# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start

Verificar la instalación:

Tienda: http://localhost:4000
Panel Admin: http://localhost:4000/admin



🔐 Credenciales por Defecto
Panel de Administración

Usuario: admin
Contraseña: pradito2025

Información de Pagos

Bancolombia: Cuenta de Ahorros 00221706692
Nequi: 3137593418
Titular: Leidy Yohanna Montoya
NIT: 1046666351-7

📂 Estructura del Proyecto
STP/
├── public/                     # Archivos estáticos y vistas
│   ├── css/                   # Hojas de estilo
│   │   ├── style.css          # Estilos principales
│   │   ├── admin.css          # Estilos del panel admin
│   │   ├── responsive.css     # Estilos responsive
│   │   └── additional-styles.css # Estilos adicionales
│   ├── js/                    # Scripts del cliente
│   │   ├── main.js            # Script principal del carrito
│   │   ├── detalle-producto.js # Lógica de productos
│   │   └── debug.js           # Herramientas de depuración
│   ├── img/                   # Imágenes estáticas
│   ├── uploads/               # Imágenes subidas (productos/servicios)
│   └── views/                 # Plantillas HTML
│       ├── admin/             # Vistas del panel admin
│       ├── layouts/           # Plantillas base
│       └── partials/          # Componentes reutilizables
├── src/                       # Código fuente del servidor
│   ├── app.js                 # Aplicación principal
│   ├── config/                # Configuraciones
│   │   ├── database.js        # Conexión a MySQL
│   │   └── init-db.js         # Inicialización de BD
│   ├── controllers/           # Controladores MVC
│   ├── models/                # Modelos de datos
│   ├── routes/                # Rutas de la aplicación
│   ├── middlewares/           # Middlewares personalizados
│   └── helpers/               # Funciones auxiliares
├── scripts/                   # Scripts utilitarios
├── .env                       # Variables de entorno
├── package.json               # Dependencias y scripts
└── README.md                  # Esta documentación
🖥️ Módulos Principales
🏪 Tienda Virtual (Frontend)
Navegación Principal

Inicio: Productos y servicios destacados
Productos: Catálogo completo con filtros
Servicios: Catálogo de servicios disponibles
Categorías: Productos organizados por tipo
Quiénes Somos: Historia y valores de la empresa
Contacto: Formulario y información de contacto

Funcionalidades del Carrito

Carrito flotante siempre visible
Persistencia automática en localStorage
Validación de stock en tiempo real
Actualización de cantidades con límites
Checkout completo con formulario detallado

Proceso de Compra

Selección de productos con cantidad deseada
Revisión en carrito flotante o página dedicada
Formulario de datos personales y entrega
Selección de método de pago
Generación automática de mensaje WhatsApp
Confirmación y seguimiento del pedido

🎛️ Panel de Administración
Dashboard Principal

Estadísticas en tiempo real (productos, categorías, servicios)
Accesos rápidos a las principales funciones
Estado del sistema y base de datos

Gestión de Productos

Creación completa con imagen, categoría, precio, stock
Edición en línea de todos los campos
Control de disponibilidad (visible/oculto en tienda)
Gestión de stock con alertas de cantidad
Eliminación segura con confirmación

Gestión de Categorías

Creación y edición de categorías
Control de productos asociados
Prevención de eliminación si tiene productos

Gestión de Servicios

Creación con descripción detallada
Carga de imágenes representativas
Control de disponibilidad en la web

📱 Integración WhatsApp
Configuración Actual

Número principal: 573225865591 (numero utilizado para las pruebas)
Número empresa: 573126421560 (contacto real)

Funcionalidades

Pedidos automáticos con datos completos del cliente
Consultas de productos individuales
Formulario de contacto con envío directo
Cotizaciones de servicios personalizadas

Formato de Mensajes
Los mensajes incluyen automáticamente:

Datos personales completos del cliente
Información de entrega y contacto
Método de pago seleccionado
Detalle completo de productos con precios
Total del pedido formateado

🎨 Personalización
Modificar Colores y Tema
Los colores principales se definen en /public/css/style.css:
css:root {
  --color-primary: #2ecc71;    /* Verde principal */
  --color-secondary: #607d8b;  /* Gris secundario */
  --color-accent: #c0c0c0;     /* Plata de acento */
  --color-dark: #34495e;       /* Azul oscuro */
  --color-light: #f5f5f5;      /* Gris claro */
  --color-white: #ffffff;      /* Blanco */
  --color-danger: #e74c3c;     /* Rojo para errores */
}
Cambiar Información de Contacto
Actualizar en los siguientes archivos:

/public/views/partials/footer.html
/public/views/contacto.html
/public/views/layouts/main.html

Configurar Métodos de Pago
Modificar en /public/views/carrito.html la sección de métodos de pago.
🔧 Scripts Disponibles
bash# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

# Inicializar/resetear base de datos
npm run init-db
📊 Base de Datos
Tablas Principales

categoria - Categorías de productos
producto - Inventario completo con stock
servicio - Servicios ofrecidos
contacto - Mensajes de contacto (futuro)
pedido - Historial de pedidos (futuro)
administrador - Datos de administradores
Carrito- Historial de producos en el carrito (futuro)
Formulario - informacion basica de clientes (futuro)

Características de la BD

Codificación UTF-8 para caracteres especiales
Claves foráneas para integridad referencial
Campos calculados para totales y estadísticas
Timestamps automáticos para auditoría

🐛 Solución de Problemas
Error de Conexión a Base de Datos
bash# Verificar que MySQL esté corriendo
# Windows
net start mysql80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
Puerto en Uso
Si el puerto 4000 está ocupado, cambiar en .env:
envPORT=3000
Problemas con Imágenes

Verificar permisos de escritura en /public/uploads/
Comprobar que las rutas en BD sean correctas
Validar que las imágenes sean menores a 5MB

Error en Dependencias
bash# Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules
npm install
🤝 Contribución

Fork del proyecto
Crear rama para nueva característica (git checkout -b feature/nueva-caracteristica)
Commit de cambios (git commit -m 'Añadir nueva característica')
Push a la rama (git push origin feature/nueva-caracteristica)
Abrir Pull Request

Estándares de Código

JavaScript ES6+ con sintaxis moderna
Comentarios descriptivos en funciones complejas
Validación robusta en frontend y backend
Manejo de errores completo
Código responsive para todos los dispositivos


📞 Contacto y Soporte
Soluciones Tecnológicas Pradito

Dirección: Cl. 41 D sur #62-49, San Antonio de Prado, Medellín, Antioquia
Teléfono: 3126421560
Email: solucionestecnologicaspradito@gmail.com
WhatsApp: 573225865591

Horarios de Atención

Lunes a Viernes: 10:00 AM - 7:00 PM
Sábado: 10:00 AM - 3:00 PM
Domingo: Cerrado

Redes Sociales

Facebook: solucionestecnologicaspradito
Instagram: @solucionestecnologicaspradito

Desarrolladores
Sneider Alonso Gomez Orrego y Jose Miguel Jimenez Montoya

🎯 Roadmap Futuro
Próximas Características

 Sistema de usuarios registrados
 Historial de pedidos en base de datos
 Notificaciones push para administradores
 Integración con pasarelas de pago
 Sistema de reviews y calificaciones
 Chat en vivo con soporte
 App móvil nativa
 Sistema de cupones y descuentos

Mejoras Técnicas

 Migración a TypeScript
 Implementación de tests automatizados
 Optimización de imágenes automática
 Cache de consultas frecuentes
 Monitoreo y analytics avanzados


💚 Desarrollado con amor para Soluciones Tecnológicas Pradito
La tecnología al servicio de nuestra comunidad en San Antonio de Prado, Medellín.