// Variável global para armazenar a estrutura do XML em memória
var xmlMemoria = null;
var tamanhoGrid = 10;

$(document).ready(function() {
    // 1ª Operação: Carregar o jogo via HTTP
    carregarXML();

    $("#btn-carregar").click(function() {
        carregarXML();
    });

    // Captura teclas
    $(document).keydown(function(e) {
        if(!xmlMemoria) return;
        switch(e.which) {
            case 37: mover('esquerda'); break;
            case 38: mover('cima'); break;
            case 39: mover('direita'); break;
            case 40: mover('baixo'); break;
        }
    });
});

function carregarXML() {
    $.ajax({
        type: "GET",
        url: "jogo.xml", // Requisição HTTP
        dataType: "xml",
        success: function(xml) {
            xmlMemoria = xml; // Carrega na memória interna do browser
            inicializarJogo();
            renderizar();
        },
        error: function() {
            alert("Erro ao carregar XML. Use um servidor local (Live Server).");
        }
    });
}

function inicializarJogo() {
    // Lê configurações do XML
    let titulo = $(xmlMemoria).find("configuracoes titulo").text();
    $("#titulo-jogo").text(titulo);
}

// Função de Visualização: Varre a memória e exibe no browser
function renderizar() {
    let board = $("#game-board");
    board.empty(); // Limpa visualização anterior

    // 1. Ler o mapa estático do XML
    let linhas = $(xmlMemoria).find("mapa linha");
    let matrizMapa = [];
    
    linhas.each(function(index, element) {
        let cols = $(element).text().split(",");
        matrizMapa.push(cols);
    });

    // 2. Ler posições das entidades dinâmicas do XML
    let jogador = $(xmlMemoria).find("jogador");
    let jX = parseInt(jogador.attr("x"));
    let jY = parseInt(jogador.attr("y"));

    let inimigo = $(xmlMemoria).find("inimigo");
    let iX = parseInt(inimigo.attr("x"));
    let iY = parseInt(inimigo.attr("y"));

    // 3. Desenhar o grid
    for(let y = 0; y < matrizMapa.length; y++) {
        for(let x = 0; x < matrizMapa[y].length; x++) {
            let tipo = matrizMapa[y][x]; // 0, 1 ou 2
            let classeCss = "chao";

            if (tipo === "1") classeCss = "parede";
            if (tipo === "2") classeCss = "tesouro";
            
            // Sobrepõe entidades
            if (x === jX && y === jY) classeCss = "jogador";
            else if (x === iX && y === iY) classeCss = "inimigo";

            // Cria o elemento visual
            board.append(`<div class="celula ${classeCss}"></div>`);
        }
    }
}

// Operações de Movimento (Alteram a memória XML)
function mover(direcao) {
    if (!xmlMemoria) return;

    // Busca o nó do jogador na memória XML
    let $jogador = $(xmlMemoria).find("jogador");
    let atualX = parseInt($jogador.attr("x"));
    let atualY = parseInt($jogador.attr("y"));
    
    let novoX = atualX;
    let novoY = atualY;

    // Calcula nova posição
    if (direcao === 'cima') novoY--;
    if (direcao === 'baixo') novoY++;
    if (direcao === 'esquerda') novoX--;
    if (direcao === 'direita') novoX++;

    // Validação de colisão (Lógica do Motor)
    // Precisamos ler o mapa para saber se é parede
    let linhas = $(xmlMemoria).find("mapa linha");
    let linhaDestino = linhas.eq(novoY).text().split(",");
    let celulaDestino = linhaDestino ? linhaDestino[novoX] : undefined;

    // Se for parede (1) ou fora do mapa, não move
    if (!celulaDestino || celulaDestino === "1") {
        console.log("Colisão com parede!");
        return; 
    }

    if (celulaDestino === "2") {
        alert("Você venceu! Encontrou o tesouro.");
    }

    // --- REQUISITO CRUCIAL ---
    // Alterar elementos na estrutura de memória do arquivo XML
    $jogador.attr("x", novoX);
    $jogador.attr("y", novoY);

    console.log(`Memória XML Atualizada: Jogador movido para [${novoX}, ${novoY}]`);

    // Aciona o módulo de visualização novamente
    renderizar();
}