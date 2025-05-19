# Soluciones Tecnológicas Pradito - Tienda Virtual

![Banner Pradito](public/img/backgrounds/hero-bg.jpg)

## 📋 Descripción

Tienda virtual para Soluciones Tecnológicas Pradito, una empresa dedicada a la venta de productos y servicios informáticos en Medellín, Colombia. La aplicación permite gestionar productos, categorías, servicios, y realizar pedidos a través de WhatsApp.

## 🚀 Características

- Catálogo de productos con categorías
- Gestión de servicios informáticos
- Carrito de compras
- Procesamiento de pedidos vía WhatsApp
- Panel de administración para gestionar productos, categorías y servicios
- Diseño responsive para dispositivos móviles y de escritorio

## 🛠️ Tecnologías

- **Backend:** Node.js, Express.js
- **Base de datos:** MySQL
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Plantillas:** Express Handlebars
- **Dependencias principales:**
  - express: Framework web
  - mysql2: Conexión a base de datos
  - express-handlebars: Motor de plantillas
  - multer: Manejo de archivos
  - dotenv: Variables de entorno

## 📦 Instalación

### Requisitos previos

- Node.js (v14.0.0 o superior)
- MySQL (v5.7 o superior)
- Git

### Pasos de instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Axtarox/STP.git
   cd STP
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar el archivo .env (usar .env.example como referencia):
   ```bash
   cp .env.example .env
   # Editar .env con tus datos de conexión a la base de datos
   ```

4. Inicializar la base de datos:
   ```bash
   npm run init-db
   ```

5. Ejecutar la aplicación:
   ```bash
   npm run dev   # Modo desarrollo
   npm start     # Modo producción
   ```

6. Acceder a la aplicación:
   - Tienda: [http://localhost:4000](http://localhost:4000)
   - Panel de administración: [http://localhost:4000/admin](http://localhost:4000/admin)
   - Credenciales por defecto:
     - Usuario: admin
     - Contraseña: pradito2025


## 📂 Estructura del proyecto

```
.
├── public/               # Archivos estáticos
│   ├── css/              # Hojas de estilo CSS
│   ├── js/               # Archivos JavaScript
│   ├── img/              # Imágenes
│   ├── uploads/          # Archivos subidos (imágenes de productos)
│   └── views/            # Vistas HTML
│       ├── admin/        # Vistas del panel de administración
│       ├── layouts/      # Plantillas base
│       └── partials/     # Componentes reutilizables
├── scripts/              # Scripts utilitarios
├── src/                  # Código fuente
│   ├── app.js            # Punto de entrada de la aplicación
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores
│   ├── helpers/          # Funciones auxiliares
│   ├── middlewares/      # Middlewares
│   ├── models/           # Modelos de datos
│   └── routes/           # Rutas de la aplicación
├── .env                  # Variables de entorno
├── .gitignore            # Archivos ignorados por Git
├── package.json          # Dependencias y scripts
└── README.md             # Documentación
```

## 🖥️ Módulos principales

### Tienda Virtual

- **Productos:** Explorar productos por categoría, ver detalles, añadir al carrito
- **Servicios:** Catálogo de servicios disponibles con formulario de contacto
- **Carrito:** Gestión de productos seleccionados y checkout
- **Contacto:** Formulario para enviar mensajes al administrador

### Panel de Administración

- **Dashboard:** Resumen de productos, categorías y servicios
- **Gestión de Productos:** Crear, editar, eliminar productos
- **Gestión de Categorías:** Organizar productos por categorías
- **Gestión de Servicios:** Administrar servicios ofrecidos

## 🧑‍💻 Uso del panel de administración

1. Accede a [http://localhost:4000/admin](http://localhost:4000/admin)
2. Inicia sesión con las credenciales por defecto (usuario: admin, contraseña: pradito2025)
3. Desde el dashboard puedes gestionar todos los aspectos de la tienda

## 📝 Ejemplos

### Añadir un nuevo producto

```javascript
// Desde un controlador o script
const Producto = require('../models/Producto');

// Crear un nuevo producto
const nuevoProducto = {
  nombre: 'Laptop HP Pavilion',
  categoria_id: 1,
  precio: 1299000,
  descripcion: 'Laptop de alto rendimiento para trabajo y estudio',
  caracteristicas: '- Procesador Intel Core i5\n- 8GB RAM\n- 512GB SSD',
  imagen: '/img/productos/laptop-hp.jpg',
  condicion: 'Nuevo',
  cantidad_disponible: 10,
  disponible: true
};

// Guardar en la base de datos
const productoId = await Producto.create(nuevoProducto);
```

### Proceso de compra

1. El usuario añade productos al carrito
2. Completa el formulario de checkout
3. Al finalizar el pedido, se genera un mensaje automático con los detalles que se envía vía WhatsApp al administrador
4. El administrador procesa el pedido manualmente

## 🔄 Personalización

### Modificar estilos

Los estilos principales están en `/public/css/style.css`. Para cambiar colores y tema, modifica las variables CSS:

```css
:root {
  --color-primary: #2ecc71;    /* Color principal */
  --color-secondary: #607d8b;  /* Color secundario */
  --color-accent: #c0c0c0;     /* Color de acento */
  --color-dark: #34495e;       /* Color oscuro para fondos */
  --color-light: #f5f5f5;      /* Color claro para fondos */
  /* ... */
}
```

### Cambiar datos de contacto

La información de contacto se encuentra en varias vistas, principalmente en `/public/views/partials/footer.html` y `/public/views/contacto.html`.

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Envía tus cambios (`git push origin feature/amazing-feature`)
5. Abre un Pull Request



## 👨‍💻 Autors
Sneider Alonso Gomez Orrego y Jose Miguel Jimenez Montoya
--
Soluciones Tecnológicas Pradito - [solucionestecnologicaspradito@gmail.com](mailto:solucionestecnologicaspradito@gmail.com)

---

Desarrollado con ❤️ para Soluciones Tecnológicas Pradito
