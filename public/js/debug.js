

(function() {
    console.log('🔍 Herramienta de depuración de renderización cargada');
    
    // Verificar variables no procesadas
    function checkUnprocessedVariables() {
        const allElements = document.querySelectorAll('*:not(script):not(style)');
        let problemFound = false;
        
        allElements.forEach(el => {
            const content = el.innerHTML;
            
            // Buscar patrones de variables no procesadas
            const patterns = [
                { regex: /{{[^{][^}]*}}/g, type: 'Variable simple' },
                { regex: /{{#each[^}]*}}[\s\S]*?{{\/each}}/g, type: 'Bloque each' },
                { regex: /{{#if[^}]*}}[\s\S]*?{{\/if}}/g, type: 'Bloque if' }
            ];
            
            patterns.forEach(pattern => {
                if (pattern.regex.test(content)) {
                    problemFound = true;
                    console.error(`❌ ${pattern.type} no procesado en:`, el);
                    
                    // Resaltar el elemento para fácil identificación
                    el.style.outline = '2px dashed red';
                    el.title = `Error: ${pattern.type} no procesado: ${content.match(pattern.regex)[0]}`;
                    
                    // Agregar un atributo para identificar fácilmente el elemento
                    el.setAttribute('data-debug', `Error: ${pattern.type} no procesado`);
                }
            });
        });
        
        return problemFound;
    }
    
    // Verificar variables de objetos anidados
    function checkNestedVariables() {
        const allElements = document.querySelectorAll('*:not(script):not(style)');
        let problemFound = false;
        
        allElements.forEach(el => {
            const content = el.innerHTML;
            const nestedVarRegex = /{{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)}}/g;
            
            if (nestedVarRegex.test(content)) {
                problemFound = true;
                console.error(`❌ Variable anidada no procesada en:`, el);
                
                // Resaltar el elemento para fácil identificación
                el.style.outline = '2px dashed orange';
                el.title = `Error: Variable anidada no procesada: ${content.match(nestedVarRegex)[0]}`;
                
                // Agregar un atributo para identificar fácilmente el elemento
                el.setAttribute('data-debug', `Error: Variable anidada no procesada`);
            }
        });
        
        return problemFound;
    }
    
    // Crear panel de depuración si se encuentran problemas
    function createDebugPanel(hasProblems) {
        if (!hasProblems) return;
        
        const debugPanel = document.createElement('div');
        debugPanel.style.position = 'fixed';
        debugPanel.style.bottom = '0';
        debugPanel.style.left = '0';
        debugPanel.style.right = '0';
        debugPanel.style.background = 'rgba(220, 53, 69, 0.9)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '12px';
        debugPanel.style.zIndex = '9999';
        debugPanel.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.2)';
        debugPanel.style.fontFamily = 'Arial, sans-serif';
        debugPanel.style.fontSize = '14px';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cerrar';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '10px';
        closeBtn.style.top = '10px';
        closeBtn.style.padding = '4px 8px';
        closeBtn.style.background = 'white';
        closeBtn.style.color = '#dc3545';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
        
        closeBtn.addEventListener('click', function() {
            debugPanel.style.display = 'none';
        });
        
        debugPanel.innerHTML = `
            <strong>⚠️ PROBLEMAS DE RENDERIZACIÓN DETECTADOS</strong>
            <p>Se encontraron variables o bloques no procesados en la página.</p>
            <p>Los elementos con problemas tienen un borde rojo o naranja. Verifica la consola para más detalles.</p>
        `;
        
        debugPanel.appendChild(closeBtn);
        document.body.appendChild(debugPanel);
    }
    
    // Imprimir datos de la página
    function printPageInfo() {
        console.log('📄 Información de la página:');
        console.log(`- Título: ${document.title}`);
        console.log(`- URL: ${window.location.href}`);
        console.log(`- Elementos en la página: ${document.querySelectorAll('*').length}`);
    }
    
    // Verificar variables en atributos de elementos
    function checkAttributeVariables() {
        const elements = document.querySelectorAll('*');
        let problemFound = false;
        
        elements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (/{{.*}}/.test(attr.value)) {
                    problemFound = true;
                    console.error(`❌ Variable no procesada en atributo ${attr.name}="${attr.value}" de:`, el);
                    
                    // Resaltar el elemento
                    el.style.outline = '2px dashed purple';
                    el.title = `Error: Variable no procesada en atributo ${attr.name}`;
                    
                    // Agregar un atributo para identificar fácilmente el elemento
                    el.setAttribute('data-debug', `Error: Variable no procesada en atributo ${attr.name}`);
                }
            });
        });
        
        return problemFound;
    }
    
    // Ejecutar todas las verificaciones
    function runAllChecks() {
        printPageInfo();
        
        const unprocessedVars = checkUnprocessedVariables();
        const nestedVars = checkNestedVariables();
        const attributeVars = checkAttributeVariables();
        
        const hasProblems = unprocessedVars || nestedVars || attributeVars;
        
        if (hasProblems) {
            console.error('❌ Se encontraron problemas de renderización en la página');
            createDebugPanel(true);
        } else {
            console.log('✅ No se encontraron problemas de renderización');
        }
    }
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllChecks);
    } else {
        runAllChecks();
    }
})();