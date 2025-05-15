# Tienda Online "Soluciones Tecnológicas Pradito"

Este proyecto implementa una tienda online completa con funcionalidades de comercio electrónico, incluyendo catálogo de productos, carrito de compras, procesamiento de pedidos y más.

## 🚀 Características

- Catálogo de productos y servicios
- Sistema de carrito de compras
- Filtrado por categorías
- Búsqueda de productos
- Gestión de pedidos con integración a WhatsApp
- Diseño responsive para todos los dispositivos
- Interfaz de usuario intuitiva y atractiva

## 📋 Requisitos previos

- Node.js (v14.x o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tuUsuario/tienda-pradito.git
cd tienda-pradito
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copiar el archivo `.env.example` a `.env` y configurar con tus datos:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de base de datos:

```
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tienda_db
DB_PORT=3306

# Configuración del servidor
PORT=4000
NODE_ENV=development
```

4. **Inicializar la base de datos**

```bash
npm run init-db
```

Este comando creará la base de datos, tablas y datos iniciales necesarios para el funcionamiento de la aplicación.

## 🚀 Ejecución

### Modo desarrollo

```bash
npm run dev
```

Este comando iniciará el servidor en modo desarrollo con Nodemon, que reiniciará automáticamente la aplicación cuando detecte cambios en los archivos.

### Modo producción

```bash
npm start
```

## 📁 Estructura del proyecto

```
tienda-pradito/
├── public/               # Archivos estáticos
│   ├── css/              # Hojas de estilo
│   ├── js/               # Scripts del cliente
│   ├── img/              # Imágenes
│   └── views/            # Vistas HTML
│       ├── layouts/      # Plantillas base
│       └── partials/     # Componentes reutilizables
├── src/                  # Código fuente
│   ├── config/           # Configuración
│   ├── controllers/      # Controladores
│   ├── middlewares/      # Middlewares
│   ├── models/           # Modelos
│   ├── routes/           # Rutas
│   └── app.js            # Aplicación principal
├── scripts/              # Scripts utilitarios
├── .env                  # Variables de entorno
├── .gitignore            # Archivos ignorados por Git
├── package.json          # Dependencias y scripts
└── README.md             # Documentación
```

## 🛠️ Tecnologías utilizadas

- **Backend**: Node.js, Express.js
- **Base de datos**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Plantillas**: Handlebars (adaptado)
- **Otros**: WhatsApp API, LocalStorage para el carrito

## 📝 Implementación en producción

Para implementar en producción, se recomienda:

1. Configurar un servidor web como Nginx o Apache como proxy inverso.
2. Utilizar PM2 para gestionar el proceso de Node.js.
3. Configurar un certificado SSL para HTTPS.
4. Optimizar la configuración de la base de datos para producción.

Ejemplo de configuración con PM2:

```bash
npm install -g pm2
pm2 start src/app.js --name="tienda-pradito"
pm2 save
```

## 👥 Autores

- **Sneider Alonso Gómez Orrego** - [sneider_gomez82172@elpoli.edu.co]
- **José Miguel Jiménez Montoya** - [jose_jimenez82171@elpoli.edu.co]

