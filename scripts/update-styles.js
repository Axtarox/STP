/**
 * Script para actualizar el archivo main.html para incluir los estilos mejorados
 */

const fs = require('fs');
const path = require('path');

// Ruta al archivo main.html
const mainHtmlPath = path.join(__dirname, '../public/views/layouts/main.html');

// Verificar si el archivo existe
if (!fs.existsSync(mainHtmlPath)) {
    console.error(`Error: El archivo ${mainHtmlPath} no existe.`);
    process.exit(1);
}

// Leer el contenido del archivo
let mainHtmlContent = fs.readFileSync(mainHtmlPath, 'utf8');

// Buscar la sección de estilos en el head
const styleRegex = /<link rel="stylesheet" href="\/css\/additional-styles\.css" \/>/;
const hasAdditionalStyles = styleRegex.test(mainHtmlContent);

// Definir los nuevos estilos que se añadirán
const newStyles = `
    <link rel="stylesheet" href="/css/style.css" />
    <link rel="stylesheet" href="/css/responsive.css" />
    <link rel="stylesheet" href="/css/productos.css" />
    <link rel="stylesheet" href="/css/servicios.css" />
`;

// Reemplazar la sección de estilos o añadir los nuevos estilos
if (hasAdditionalStyles) {
    mainHtmlContent = mainHtmlContent.replace(
        /<link rel="stylesheet" href="\/css\/style\.css" \/>\s*<link rel="stylesheet" href="\/css\/responsive\.css" \/>\s*<link rel="stylesheet" href="\/css\/additional-styles\.css" \/>/,
        newStyles
    );
} else {
    mainHtmlContent = mainHtmlContent.replace(
        /<link rel="stylesheet" href="\/css\/style\.css" \/>\s*<link rel="stylesheet" href="\/css\/responsive\.css" \/>/,
        newStyles
    );
}

// Escribir el contenido actualizado al archivo
fs.writeFileSync(mainHtmlPath, mainHtmlContent);

console.log(`✅ Archivo ${mainHtmlPath} actualizado con éxito.`);

// Ahora crear el archivo helper.js para el formateo de precios
const helperJsPath = path.join(__dirname, '../src/helpers/formatHelper.js');

// Crear directorio si no existe
const helperDir = path.dirname(helperJsPath);
if (!fs.existsSync(helperDir)) {
    fs.mkdirSync(helperDir, { recursive: true });
}

// Contenido del archivo helper.js
const helperJsContent = `/**
 * Funciones auxiliares para el formateo de datos
 */

/**
 * Formatea un número como precio con separadores de miles
 * @param {number|string} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(precio) {
    // Asegurarse de que es un número
    const numericPrice = parseFloat(precio) || 0;
    // Formatear con separadores de miles
    return numericPrice.toLocaleString('es-CO');
}

module.exports = {
    formatPrice
};
`;

// Escribir el archivo helper.js
fs.writeFileSync(helperJsPath, helperJsContent);

console.log(`✅ Archivo ${helperJsPath} creado con éxito.`);

// Actualizar el archivo ProductoController.js para incluir la función de formateo
const controllerPath = path.join(__dirname, '../src/controllers/ProductoController.js');

// Verificar si el archivo existe
if (fs.existsSync(controllerPath)) {
    let controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    // Verificar si ya se ha importado la función de formateo
    if (!controllerContent.includes('formatHelper')) {
        // Añadir la importación al principio del archivo
        controllerContent = controllerContent.replace(
            /const path = require\('path'\);/,
            `const path = require('path');\nconst { formatPrice } = require('../helpers/formatHelper');`
        );
        
        // Añadir la función a res.locals en cada función del controlador
        const renderRegex = /res\.render\(/g;
        controllerContent = controllerContent.replace(renderRegex, 'res.locals.formatPrice = formatPrice;\n    res.render(');
        
        // Escribir el archivo actualizado
        fs.writeFileSync(controllerPath, controllerContent);
        
        console.log(`✅ Archivo ${controllerPath} actualizado con éxito.`);
    }
}

console.log('✅ Todas las actualizaciones completadas con éxito.');