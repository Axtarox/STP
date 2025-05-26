const fs = require('fs');
const path = require('path');

module.exports = function renderViewMiddleware(req, res, next) {
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
            
            // Procesar bloques {{#if}} con operadores de comparación
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
    // Expresión regular mejorada para capturar comparaciones con operadores
    const ifRegex = /{{#if\s+([^}]*)}}\s*([\s\S]*?)\s*(?:{{else}}\s*([\s\S]*?)\s*)?{{\/if}}/g;
    
    let result = html;
    let previousResult = '';
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Aumentado para manejar anidamientos
    
    while (previousResult !== result && iterations < MAX_ITERATIONS) {
        previousResult = result;
        iterations++;
        
        result = result.replace(ifRegex, (match, condition, trueBlock, falseBlock = '') => {
            let isTrue = false;
            
            // Detectar operadores de comparación
            if (condition.includes('===')) {
                const [left, right] = condition.split('===').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue === rightValue;
            } 
            else if (condition.includes('==')) {
                const [left, right] = condition.split('==').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue == rightValue;
            }
            else if (condition.includes('!==')) {
                const [left, right] = condition.split('!==').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue !== rightValue;
            }
            else if (condition.includes('!=')) {
                const [left, right] = condition.split('!=').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue != rightValue;
            }
            else if (condition.includes('>=')) {
                const [left, right] = condition.split('>=').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue >= rightValue;
            }
            else if (condition.includes('<=')) {
                const [left, right] = condition.split('<=').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue <= rightValue;
            }
            else if (condition.includes('>')) {
                const [left, right] = condition.split('>').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue > rightValue;
            }
            else if (condition.includes('<')) {
                const [left, right] = condition.split('<').map(part => part.trim());
                const leftValue = evaluateExpression(left, data);
                const rightValue = evaluateExpression(right, data);
                isTrue = leftValue < rightValue;
            }
            else {
                // Simple check for truthy value
                const value = evaluateExpression(condition, data);
                isTrue = !!value;
            }
            
            return isTrue ? trueBlock : falseBlock;
        });
    }
    
    return result;
}

/**
 * Evalúa una expresión en el contexto de los datos
 */
function evaluateExpression(expr, data) {
    expr = expr.trim();
    
    // Manejar valores literales
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'null') return null;
    if (expr === 'undefined') return undefined;
    
    // Manejar números
    if (!isNaN(expr)) {
        return Number(expr);
    }
    
    // Manejar strings con comillas
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.substring(1, expr.length - 1);
    }
    
    // Manejar propiedades anidadas (como objeto.propiedad)
    if (expr.includes('.')) {
        return getNestedValue(data, expr);
    }
    
    // Caso normal - obtener el valor de los datos
    return data[expr];
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