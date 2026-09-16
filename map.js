// map.js - Geração Procedural de Rotas e Navegação

const MapState = {
    currentDepth: 0,
    maxDepth: 6, // 5 salas comuns + 1 Boss
    nodes: [],
    mapGenerated: false
};

// Chamado sempre que a tela do mapa é ativada pelo switchScreen()
function renderMap() {
    const mapGrid = document.getElementById('map-grid');
    if (!mapGrid) return;

    // Gera o mapa apenas uma vez por ciclo (run)
    if (!MapState.mapGenerated) {
        generateNodes();
        MapState.mapGenerated = true;
    }

    drawMap();
}

function generateNodes() {
    MapState.nodes = [];
    
    // Geração de colunas (profundidade)
    for (let depth = 0; depth <= MapState.maxDepth; depth++) {
        let column = [];
        
        if (depth === 0) {
            // Início (Sempre um evento introdutório ou combate fácil)
            column.push({ id: `node_${depth}_0`, type: 'combat', depth: depth, completed: false });
        } else if (depth === MapState.maxDepth) {
            // Fim (Boss)
            column.push({ id: `node_${depth}_0`, type: 'boss', depth: depth, completed: false });
        } else {
            // Nós intermediários (1 a 3 caminhos possíveis)
            const paths = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < paths; i++) {
                const rand = Math.random();
                let type = 'combat'; // 50% chance
                if (rand > 0.5 && rand <= 0.75) type = 'shop'; // 25% chance
                else if (rand > 0.75) type = 'event'; // 25% chance
                
                column.push({ id: `node_${depth}_${i}`, type: type, depth: depth, completed: false });
            }
        }
        MapState.nodes.push(column);
    }
    console.log("Arquitetura do labirinto compilada.");
}

function drawMap() {
    const mapGrid = document.getElementById('map-grid');
    if (!mapGrid) return;
    
    mapGrid.innerHTML = '';
    mapGrid.style.display = 'flex';
    mapGrid.style.justifyContent = 'space-between';
    mapGrid.style.alignItems = 'center';
    mapGrid.style.padding = '40px 20px';

    MapState.nodes.forEach((column, depthIndex) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'map-column';
        colDiv.style.display = 'flex';
        colDiv.style.flexDirection = 'column';
        colDiv.style.gap = '20px';

        column.forEach(node => {
            const nodeBtn = document.createElement('div');
            nodeBtn.className = 'map-node';
            
            // Estilização base do Nó
            nodeBtn.style.width = '60px';
            nodeBtn.style.height = '60px';
            nodeBtn.style.border = '2px solid var(--metal-gray)';
            nodeBtn.style.display = 'flex';
            nodeBtn.style.justifyContent = 'center';
            nodeBtn.style.alignItems = 'center';
            nodeBtn.style.cursor = 'pointer';
            nodeBtn.style.backgroundColor = '#111';
            nodeBtn.style.transform = 'rotate(45deg)'; // Formato de losango
            
            // Define o ícone/texto rotacionado de volta para ficar legível
            const innerSpan = document.createElement('span');
            innerSpan.style.transform = 'rotate(-45deg)';
            innerSpan.style.fontWeight = 'bold';
            
            switch(node.type) {
                case 'combat': innerSpan.innerText = '⚔️'; innerSpan.style.color = 'var(--text-light)'; break;
                case 'shop': innerSpan.innerText = '🛒'; innerSpan.style.color = 'var(--corrupt-green)'; break;
                case 'event': innerSpan.innerText = '❓'; innerSpan.style.color = 'var(--highlight)'; break;
                case 'boss': innerSpan.innerText = '☠️'; innerSpan.style.color = 'var(--flesh-red)'; nodeBtn.style.borderColor = 'var(--flesh-red)'; nodeBtn.classList.add('ps1-jitter'); break;
            }
            
            nodeBtn.appendChild(innerSpan);

            // Lógica de Trava de Progressão
            if (node.depth < MapState.currentDepth || node.completed) {
                // Nó já passado
                nodeBtn.style.opacity = '0.3';
                nodeBtn.style.cursor = 'not-allowed';
            } else if (node.depth === MapState.currentDepth) {
                // Nó disponível agora
                nodeBtn.style.borderColor = 'var(--corrupt-green)';
                nodeBtn.style.boxShadow = '0 0 10px var(--corrupt-green)';
                nodeBtn.addEventListener('click', () => handleNodeClick(node));
            } else {
                // Nó futuro bloqueado
                nodeBtn.style.opacity = '0.6';
                nodeBtn.style.cursor = 'not-allowed';
            }

            colDiv.appendChild(nodeBtn);
        });

        mapGrid.appendChild(colDiv);
    });
}

function handleNodeClick(node) {
    console.log(`Nó selecionado: ${node.type} (Profundidade: ${node.depth})`);
    
    // Marca como completado e avança a profundidade
    node.completed = true;
    MapState.currentDepth++;

    // Redirecionamento de rotas
    if (typeof switchScreen === 'function') {
        if (node.type === 'shop') {
            if (typeof initShop === 'function') initShop();
            switchScreen('shop-screen');
        } else if (node.type === 'event') {
            if (typeof triggerEvent === 'function') triggerEvent();
            switchScreen('event-screen');
        } else if (node.type === 'combat') {
            if (typeof initCombat === 'function') initCombat(false);
            switchScreen('combat-screen');
        } else if (node.type === 'boss') {
            if (typeof initCombat === 'function') initCombat(true);
            switchScreen('combat-screen');
        }
    }
}
