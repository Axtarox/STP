/**
 * Script para crear la base de datos y datos iniciales
 * Para uso en desarrollo
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
};

async function initDatabase() {
    let connection;
    
    try {
        // Conectar a MySQL sin seleccionar una base de datos
        connection = await mysql.createConnection(dbConfig);
        
        // Crear la base de datos si no existe
        const dbName = process.env.DB_NAME || 'tienda_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        
        console.log(`✅ Base de datos "${dbName}" creada o ya existente`);
        
        // Seleccionar la base de datos
        await connection.query(`USE ${dbName}`);
        
        // Crear tablas
        await createTables(connection);
        
        // Insertar datos iniciales si no existen
        await insertInitialData(connection);
        
        console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function createTables(connection) {
    try {
        // Crear tabla CATEGORIA
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categoria (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT
            )
        `);
        console.log('- Tabla "categoria" creada o ya existente');
        
        // Crear tabla PRODUCTO
        await connection.query(`
            CREATE TABLE IF NOT EXISTS producto (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoria_id INT,
                imagen VARCHAR(255),
                nombre VARCHAR(100) NOT NULL,
                condicion VARCHAR(50),
                descripcion TEXT,
                caracteristicas TEXT,
                precio DECIMAL(10,2) NOT NULL,
                cantidad_disponible INT DEFAULT 0,
                disponible BOOLEAN DEFAULT true,
                FOREIGN KEY (categoria_id) REFERENCES categoria(id)
            )
        `);
        console.log('- Tabla "producto" creada o ya existente');
        
        // Crear tabla SERVICIO
        await connection.query(`
            CREATE TABLE IF NOT EXISTS servicio (
                id INT AUTO_INCREMENT PRIMARY KEY,
                imagen VARCHAR(255),
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT,
                disponible BOOLEAN DEFAULT true
            )
        `);
        console.log('- Tabla "servicio" creada o ya existente');
        
        // Crear tabla CONTACTO
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contacto (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombres VARCHAR(100) NOT NULL,
                apellidos VARCHAR(100) NOT NULL,
                telefono_fijo VARCHAR(20),
                telefono_movil VARCHAR(20),
                correo_electronico VARCHAR(100) NOT NULL,
                mensaje TEXT,
                fecha_contacto DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('- Tabla "contacto" creada o ya existente');
        
        // Crear tabla FORMULARIO
        await connection.query(`
            CREATE TABLE IF NOT EXISTS formulario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombres VARCHAR(100) NOT NULL,
                apellidos VARCHAR(100) NOT NULL,
                tipo_documento VARCHAR(20) NOT NULL,
                numero_documento VARCHAR(20) NOT NULL,
                fecha_nacimiento DATE,
                sexo VARCHAR(10),
                estado_civil VARCHAR(20),
                ciudad VARCHAR(50),
                direccion VARCHAR(100),
                telefono_fijo VARCHAR(20),
                telefono_movil VARCHAR(20),
                correo_electronico VARCHAR(100) NOT NULL,
                opcion_pago VARCHAR(50)
            )
        `);
        console.log('- Tabla "formulario" creada o ya existente');
        
        // Crear tabla PEDIDO
        await connection.query(`
            CREATE TABLE IF NOT EXISTS pedido (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cliente_nombre VARCHAR(100) NOT NULL,
                cliente_telefono VARCHAR(20) NOT NULL,
                cliente_direccion TEXT NOT NULL,
                cliente_email VARCHAR(100),
                metodo_pago VARCHAR(50) NOT NULL,
                estado VARCHAR(20) DEFAULT 'pendiente',
                total DECIMAL(10,2) NOT NULL,
                fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('- Tabla "pedido" creada o ya existente');
        
        // Crear tabla DETALLE_PEDIDO
        await connection.query(`
            CREATE TABLE IF NOT EXISTS detalle_pedido (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pedido_id INT NOT NULL,
                producto_id INT NOT NULL,
                cantidad INT NOT NULL,
                precio_unitario DECIMAL(10,2) NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (pedido_id) REFERENCES pedido(id),
                FOREIGN KEY (producto_id) REFERENCES producto(id)
            )
        `);
        console.log('- Tabla "detalle_pedido" creada o ya existente');
        
    } catch (error) {
        console.error('Error al crear tablas:', error);
        throw error;
    }
}

async function insertInitialData(connection) {
    try {
        // Verificar si ya existen categorías
        const [categorias] = await connection.query('SELECT COUNT(*) as count FROM categoria');
        
        // Si no hay categorías, insertar datos iniciales
        if (categorias[0].count === 0) {
            // Insertar categorías
            await connection.query(`
                INSERT INTO categoria (nombre, descripcion) VALUES 
                ('Computadores', 'Equipos de cómputo de escritorio y portátiles para todos los usos'),
                ('Periféricos', 'Dispositivos que se conectan al computador para mejorar la experiencia'),
                ('Accesorios', 'Complementos para tus dispositivos tecnológicos'),
                ('Redes', 'Equipos para la conectividad y redes de datos'),
                ('Software', 'Programas y aplicaciones para tus dispositivos')
            `);
            console.log('- Datos iniciales de categorías insertados');
            
            // Insertar productos de muestra
            await connection.query(`
                INSERT INTO producto (categoria_id, imagen, nombre, condicion, descripcion, caracteristicas, precio, cantidad_disponible, disponible) VALUES 
                (1, '/img/laptop.jpg', 'Laptop HP Pavilion 15', 'Nuevo', 'Potente laptop con procesador Intel Core i5, ideal para trabajo y estudios.', '- Procesador Intel Core i5 11th Gen\\n- 8GB RAM DDR4\\n- 512GB SSD\\n- Pantalla 15.6" Full HD\\n- Windows 11 Home', 1899000, 10, 1),
                (2, '/img/monitor.jpg', 'Monitor Samsung 24"', 'Nuevo', 'Monitor Full HD con panel IPS y tiempo de respuesta de 5ms, ideal para trabajo y entretenimiento.', '- Tamaño: 24 pulgadas\\n- Resolución: 1920x1080 Full HD\\n- Panel IPS\\n- Tiempo de respuesta: 5ms\\n- Puertos: HDMI, VGA', 689000, 15, 1),
                (2, '/img/teclado.jpg', 'Teclado Mecánico RGB', 'Nuevo', 'Teclado mecánico con switches Cherry MX y retroiluminación RGB personalizable, perfecto para gaming.', '- Switches Cherry MX Red\\n- Retroiluminación RGB personalizable\\n- Teclas de doble inyección\\n- Cable desmontable USB-C\\n- Reposamuñecas incluido', 249000, 20, 1),
                (3, '/img/impresora.jpg', 'Impresora Multifuncional', 'Nuevo', 'Impresora multifuncional con escáner, fotocopiadora y conectividad WiFi para el hogar u oficina.', '- Funciones: Impresión, copia, escaneo\\n- Conectividad WiFi\\n- Impresión a doble cara automática\\n- Pantalla táctil de 2.7"\\n- Cartuchos individuales', 599000, 8, 1),
                (4, '/img/router.jpg', 'Router WiFi 6', 'Nuevo', 'Router de última generación con WiFi 6, mayor velocidad y mejor cobertura para hogares conectados.', '- WiFi 6 (802.11ax)\\n- Velocidad hasta 3000 Mbps\\n- 4 antenas de alta ganancia\\n- 4 puertos Gigabit\\n- Control parental', 349000, 12, 1),
                (5, '/img/antivirus.jpg', 'Antivirus Premium', 'Digital', 'Protección completa para todos tus dispositivos, incluye VPN y protección bancaria.', '- Licencia para 5 dispositivos\\n- Protección en tiempo real\\n- VPN incluida\\n- Protección bancaria\\n- Optimizador de PC', 129000, 999, 1)
            `);
            console.log('- Datos iniciales de productos insertados');
            
            // Insertar servicios de muestra
            await connection.query(`
                INSERT INTO servicio (imagen, nombre, descripcion, disponible) VALUES 
                ('/img/service-maintenance.jpg', 'Mantenimiento de Computadores', 'Servicio completo de mantenimiento preventivo y correctivo para computadores de escritorio y portátiles.', 1),
                ('/img/service-repair.jpg', 'Reparación de Equipos', 'Reparamos todo tipo de equipos informáticos con garantía y personal certificado.', 1),
                ('/img/service-network.jpg', 'Instalación de Redes', 'Diseño e implementación de redes para hogares y empresas, cableado estructurado e inalámbrico.', 1),
                ('/img/service-software.jpg', 'Desarrollo de Software', 'Creamos soluciones de software personalizadas para empresas y negocios.', 1),
                ('/img/service-backup.jpg', 'Respaldo y Recuperación de Datos', 'Recuperamos información de dispositivos dañados y configuramos sistemas de respaldo.', 1)
            `);
            console.log('- Datos iniciales de servicios insertados');
        } else {
            console.log('- Los datos iniciales ya existen en la base de datos');
        }
    } catch (error) {
        console.error('Error al insertar datos iniciales:', error);
        throw error;
    }
}

// Ejecutar la inicialización si este archivo se ejecuta directamente
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('✅ Proceso de inicialización completado');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Error durante la inicialización:', err);
            process.exit(1);
        });
}

module.exports = { initDatabase };