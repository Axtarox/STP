/**
 * Middleware optimizado para renderizar vistas HTML
 * - Ahora con soporte para páginas sin layout (standalone)
 */
const fs = require('fs');
const path = require('path');

module.exports = function renderViewMiddleware(req, res, next) {
    // Guardar referencia al método original
    const originalRender = res.render;

    // Reemplazar el método render
    res.render = function(view, data = {}) {
        try {
            // Verificar si es una página standalone (sin layout)
            const isStandalone = data.standalone === true;
            
            // Rutas de archivos
            const layoutPath = path.join(__dirname, '../../public/views/layouts/main.html');
            let viewPath;
            
            if (path.isAbsolute(view)) {
                viewPath = view;
            } else {
                viewPath = path.join(__dirname, '../../public/views', `${view}.html`);
            }
            
            // Verificar si existen los archivos
            if (!isStandalone && !fs.existsSync(layoutPath)) {
                throw new Error(`Layout no encontrado: ${layoutPath}`);
            }
            
            if (!fs.existsSync(viewPath)) {
                throw new Error(`Vista no encontrada: ${viewPath}`);
            }
            
            // Leer archivos
            let html;
            
            if (isStandalone) {
                // Para páginas standalone, usamos directamente el contenido de la vista
                html = fs.readFileSync(viewPath, 'utf8');
            } else {
                // Para páginas normales, combinamos layout y vista
                let layoutContent = fs.readFileSync(layoutPath, 'utf8');
                let viewContent = fs.readFileSync(viewPath, 'utf8');
                
                // Reemplazar {{content}} en el layout con el contenido de la vista
                html = layoutContent.replace('{{content}}', viewContent);
            }
            
            // Funciones de ayuda para la vista
            const helpers = {
                formatPrice: function(price) {
                    const numericPrice = parseFloat(price) || 0;
                    return numericPrice.toLocaleString('es-CO');
                },
                formatDate: function(date) {
                    if (!date) return '';
                    return new Date(date).toLocaleDateString('es-CO');
                }
            };
            
            // Combinar datos
            const allData = { ...helpers, ...data, ...res.locals };
            
            // Reemplazar variables simples primero para evitar conflictos
            Object.keys(allData).forEach(key => {
                const value = allData[key];
                
                // Solo procesar valores primitivos directamente
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    html = html.replace(regex, String(value));
                } else if (value === null || value === undefined) {
                    // Reemplazar con cadena vacía si es null o undefined
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    html = html.replace(regex, '');
                }
            });
            
            // Procesamiento de objetos anidados (como producto.nombre)
            const nestedVarRegex = /{{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)}}/g;
            let nestedMatch;
            
            while ((nestedMatch = nestedVarRegex.exec(html)) !== null) {
                const fullMatch = nestedMatch[0];
                const objectName = nestedMatch[1];
                const propertyName = nestedMatch[2];
                
                if (allData[objectName] && allData[objectName][propertyName] !== undefined) {
                    const value = allData[objectName][propertyName];
                    const valueStr = (value === null) ? '' : String(value);
                    
                    // Reemplazar todas las ocurrencias
                    html = html.replace(new RegExp(fullMatch, 'g'), valueStr);
                } else {
                    // Si no existe, reemplazar con cadena vacía
                    html = html.replace(new RegExp(fullMatch, 'g'), '');
                }
            }
            
            // Procesar bloques {{#each}}
            html = processEachBlocks(html, allData);
            
            // Procesar bloques {{#if}}
            html = processIfBlocks(html, allData);
            
            // Limpiar variables no procesadas
            html = cleanUnprocessedVariables(html);
            
            // Enviar HTML
            res.set('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error('Error al renderizar vista:', error);
            next(error);
        }
    };
    
    next();
};

/**
 * Procesa bloques {{#each}}
 */
function processEachBlocks(html, data) {
    const eachRegex = /{{#each\s+([a-zA-Z0-9_\.]+)}}\s*([\s\S]*?)\s*{{\/each}}/g;
    
    return html.replace(eachRegex, (match, key, template) => {
        const array = getNestedValue(data, key);
        
        if (!array || !Array.isArray(array)) {
            return '';
        }
        
        return array.map((item, index) => {
            let itemHtml = template;
            
            if (typeof item === 'object' && item !== null) {
                Object.keys(item).forEach(prop => {
                    const value = item[prop];
                    const valueStr = (value === null || value === undefined) ? '' : String(value);
                    const regex = new RegExp(`{{${prop}}}`, 'g');
                    itemHtml = itemHtml.replace(regex, valueStr);
                });
            }
            
            // Reemplazar {{this}} con el valor del ítem
            const thisRegex = new RegExp(`{{this}}`, 'g');
            itemHtml = itemHtml.replace(thisRegex, typeof item === 'object' ? JSON.stringify(item) : String(item));
            
            // Reemplazar {{@index}} con el índice actual
            const indexRegex = new RegExp(`{{@index}}`, 'g');
            itemHtml = itemHtml.replace(indexRegex, index);
            
            return itemHtml;
        }).join('');
    });
}

/**
 * Procesa bloques {{#if}}
 */
function processIfBlocks(html, data) {
    // Expresión regular mejorada para capturar correctamente bloques if/else
    const ifRegex = /{{#if\s+([a-zA-Z0-9_\.]+)}}\s*([\s\S]*?)\s*(?:{{else}}\s*([\s\S]*?)\s*)?{{\/if}}/g;
    
    let result = html;
    let previousResult = '';
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Aumentado para manejar anidamientos
    
    while (previousResult !== result && iterations < MAX_ITERATIONS) {
        previousResult = result;
        iterations++;
        
        result = result.replace(ifRegex, (match, key, trueBlock, falseBlock = '') => {
            const value = getNestedValue(data, key);
            
            // Considerar valores falsy: null, undefined, false, 0, "", NaN
            return value ? trueBlock : falseBlock;
        });
    }
    
    return result;
}

/**
 * Limpia variables no procesadas
 */
function cleanUnprocessedVariables(html) {
    // Limpiar variables simples no procesadas
    html = html.replace(/{{[^#{][^}]*}}/g, '');
    
    // Limpiar bloques {{#each}} no procesados
    html = html.replace(/{{#each[\s\S]*?{{\/each}}/g, '');
    
    // Limpiar bloques {{#if}} no procesados
    html = html.replace(/{{#if[\s\S]*?{{\/if}}/g, '');
    
    return html;
}

/**
 * Obtiene un valor anidado usando notación de puntos
 */
function getNestedValue(obj, path) {
    if (!path) return undefined;
    
    return path.split('.').reduce((o, i) => {
        return (o && o[i] !== undefined) ? o[i] : undefined;
    }, obj);
}