import {
    setWhiteCastleKingSide, setWhiteCastleQueenSide,
    setBlackCastleKingSide, setBlackCastleQueenSide,
} from "./fen_utils.js";
import { boardgame, brancas, pretas, context, pontuacao, checkXequeMate, isxeque, timeIA } from "./jogo.js";

// =================================================================
// FUNÇÕES AUXILIARES PARA A IA
// =================================================================

/** 
* Função chamada em Jogo.js, quando o tabuleiro é montado.
* Converte um índice de 0-63 para a notação algébrica (ex: 0 -> 'a1', 63 -> 'h8')
* @param {number} index - O índice da casa (0-63).
* @returns {string} A notação algébrica correspondente (ex: 'e4').
*/
export function placeNotationToSquare(index) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const arrayRank = Math.floor(index / 8);
    const rank = 8 - arrayRank;
    const file = files[index % 8];
    return file + rank; // Ex: 'e4'
}

/**
 * Atualiza o direito de roque no FEN após o movimento de uma peça.
 * chamada no manipulador de movimento (movePiece).
 * * @param {object} piece - O objeto da peça que acabou de se mover.
 */
export function nullCastleIAByMovePiece(piece) {
    if (!piece) return;

    const color = piece.getTeam(); // 1=brancas, 0=pretas
    const isKing = piece.name === 'Rei';  // Verifica se é o Rei
    const isRook = piece.name === 'Torre'; // Verifica se é a Torre
    if (!isKing && !isRook) return; // Se não for nem Rei nem Torre, sai

    if (isKing) {
        if (color === 1) { // Brancas (1)
            setWhiteCastleKingSide(false);
            setWhiteCastleQueenSide(false);
        } else { // Pretas (0)
            setBlackCastleKingSide(false);
            setBlackCastleQueenSide(false);
        }
    }

    if (isRook) {
        // Lógica precisa de roque da Torre
        const isWhite = color === 1;
        const rookIndex = piece.x; // Assumindo que a peça guarda seu índice inicial no tabuleiro (0-63)

        if (isWhite) {
            if (rookIndex > 0) { // Casa H1 (Roque do Rei Branco)
                setWhiteCastleKingSide(false);
            } else if (rookIndex === 0) { // Casa A1 (Roque da Dama Branca)
                setWhiteCastleQueenSide(false);
            }
        } else {
            if (rookIndex > 0) { // Casa H8 (Roque do Rei Preto)
                setBlackCastleKingSide(false);
            } else if (rookIndex === 0) { // Casa A8 (Roque da Dama Preta)
                setBlackCastleQueenSide(false);
            }
        }
    }
}

/**
 * Verifica se uma casa específica está no alcance de ataque de 
 * qualquer peça da cor adversária.
 * @param {object} targetIndex - O objeto da casa a ser checada.
 * @param {boolean} colorEnemy - Se é atacada por peças Brancas (1) ou Pretas (0).
 * @returns {boolean} True se a casa estiver sob ataque inimigo.
 */
export function isCasaSobAtaque(targetIndex, colorEnemy) {

    for (let index = 0; index < boardgame.length; index++) {
        if (!boardgame[index]) continue; //segurança
        // Checa se tem peça e se é do time inimigo
        if (boardgame[index].getPiece() && boardgame[index].getPiece().getTeam() === colorEnemy) {


            // Obtém os destinos da peça inimiga (lista de numeros)
            const enemyMoves = boardgame[index].getPiece().calculateMoves(index, colorEnemy);
            // Checa se os destinos da peça inimiga inclui a casa alvo
            if (enemyMoves.includes(targetIndex)) {
                return true; // Exixte um atacante nessa casa!
            }
        }
    }
    return false; // Casa está segura!
}

/**
 * recebe um objeto casa e procura ele na lista de casas do boardgame
 * @param {casa} casa  a casa para que o peão moveu
 * @param {boolean} color a cor da peça para saber a direção do cálculo
 * R
 */
export function searchForIndexEnPassant(casa, color) {
    var casaEnpassantIndex = ''
    for (var i = 0; i <= boardgame.length; i++) {
        if (casa === boardgame[i]) {
            if (color === brancas) {
                casaEnpassantIndex = boardgame[i + 8].getIndex();
            } else {
                casaEnpassantIndex = boardgame[i - 8].getIndex();
            }
        };

    }
    return casaEnpassantIndex;
}


/**
 * Transfere a Torre durante o movimento de Roque.
 * @param {number} towerFromIndex - Índice de origem da Torre (ex: 63 para h1).
 * @param {number} towerToIndex - Índice de destino da Torre (ex: 61 para f1).
 */
function transferTower(towerFromIndex, towerToIndex) {
    const casaTorreOrigem = boardgame[towerFromIndex];
    const casaTorreDestino = boardgame[towerToIndex];

    const piece = casaTorreOrigem.getPiece();


    // 1. ATUALIZAÇÃO DO OBJETO PEÇA
    // Atualiza as coordenadas do objeto Peça
    piece.x = casaTorreDestino.x;
    piece.y = casaTorreDestino.y;

    // Coloca a referência da peça na nova casa
    casaTorreDestino.placePiece(piece);

    // 2. LIMPEZA NA ORIGEM
    // Remove a referência da peça da casa de origem
    casaTorreOrigem.takeOffPiece();
    // Limpa o desenho da peça antiga
    casaTorreOrigem.clear(context);

}


/**
 * Executa o movimento de Roque (Rei + Torre)
 * @param {number} kingFromIndex - Índice de origem do Rei (e1 ou e8).
 * @param {number} kingToIndex - Índice de destino do Rei (c1, g1, c8 ou g8).
 */
export function executeRoque(kingFromIndex, kingToIndex) {
    const isWhite = boardgame[kingFromIndex].getPiece().getTeam() === brancas;
    const isKingSide = kingToIndex > kingFromIndex; // g1 ou g8

    let towerFromIndex, towerToIndex;

    if (isWhite) { // Rei Branco (e1 = 60)
        if (isKingSide) { // Roque Curto (e1-g1)
            towerFromIndex = 63; // h1
            towerToIndex = 61; // f1
        } else { // Roque Longo (e1-c1)
            towerFromIndex = 56; // a1
            towerToIndex = 59; // d1
        }
    } else { // Rei Preto (e8 = 4)
        if (isKingSide) { // Roque Curto (e8-g8)
            towerFromIndex = 7; // h8
            towerToIndex = 5; // f8
        } else { // Roque Longo (e8-c8)
            towerFromIndex = 0; // a8
            towerToIndex = 3; // d8
        }
    }
    // 1. Move o Rei
    movePieceTransfer(kingFromIndex, kingToIndex);

    // 2. Move a Torre
    transferTower(towerFromIndex, towerToIndex);
}


/**
 * movimento de peças feito pela IA, chamando as funções de desenho no canvas
 */
export function movePieceTransfer(fromIndex, toIndex) {
    const casaOrigem = boardgame[fromIndex];
    const casaDestino = boardgame[toIndex];
    const piece = casaOrigem.getPiece();
    const piecePlayer = casaDestino.getPiece(); // peça que está no destino (possível captura)

    // LÓGICA DE CAPTURA (Se houver peça no destino)
    if (piecePlayer != null) {

        // Lógica de Pontuação e XequeMate
        // Estes devem ser chamados APENAS se houve captura.
        pontuacao(piecePlayer);
        checkXequeMate(piecePlayer);
        // Remove a referência da peça capturada
        casaDestino.takeOffPiece();
    }

    // Atualiza as coordenadas internas do objeto PEÇA
    if (piece.x !== undefined && piece.y !== undefined) {
        piece.x = casaDestino.x;
        piece.y = casaDestino.y;
    }
    // Marca que a peça já se moveu (importante para o Roque e o Primeiro Movimento do Peão)
    if (piece.firstmove !== undefined) {
        piece.firstmove = false;
    }

    // Transfere a referência da PEÇA para o destino
    casaDestino.placePiece(piece);

    // Limpa a casa de origem
    casaOrigem.clear(context);
    casaOrigem.takeOffPiece();
}


/**
 * Checa se o Roque é legal (Rei não pode mover de, para, ou através de ataque).
 * @param {number} kingFromIndex - Índice do Rei (e1 ou e8).
 * @param {number} kingToIndex - Índice de destino do Rei (c1, g1, c8, ou g8).
 * @param {boolean} kingColor - Cor do Rei (brancas ou pretas).
 * @returns {boolean} True se o Roque for legal.
 */
export function isRoqueLegal(kingFromIndex, kingToIndex, kingColor) {
    const enemyColor = (kingColor === brancas) ? pretas : brancas;

    // 1. Definição das Casas de Checagem
    let checkSquares = [];
    if (kingToIndex > kingFromIndex) { // Roque Curto (g1/g8)
        checkSquares = [kingFromIndex, kingFromIndex + 1, kingFromIndex + 2]; // e1, f1, g1
    } else { // Roque Longo (c1/c8)
        checkSquares = [kingFromIndex, kingFromIndex - 1, kingFromIndex - 2]; // e1, d1, c1
    }

    // 2. Checa as Três Casas para Ataque
    for (const index of checkSquares) {

        if (isCasaSobAtaque(index, enemyColor)) {
            return false; // Roque ilegal: uma das casas está sob ataque
        }
    }

    // 3. Checa se o Rei está em Xeque
    if (isxeque) {
        return false; // Roque ilegal: Rei está em xeque
    }

    return true; // Roque legal!
}
/**
 * Adiciona uma mensagem ao input com um efeito de máquina de escrever.
 * @param {string} text O texto completo a ser exibido.
 */
export function putMessageOnDisplay(text) {
    const output = document.getElementById('input-msg-gemini');

    const textArray = text.split('');
    let i = 0;

    // : Limpa o campo para garantir que a escrita comece do zero
    output.value = '';

    // Define a função que fará a digitação letra por letra
    function digitarCaractere() {
        if (i < textArray.length) {
            const caractere = textArray[i];

            // Adiciona a letra atual
            output.value += caractere;

            // Avança para a próxima letra
            i++;

            // Agenda a próxima execução (chamada recursiva) com o atraso da velocidade
            setTimeout(digitarCaractere, 30);
        }
    }
    digitarCaractere()
}
/**
 * função que determina se a IA está movendo uma peça da cor certa para uma casa 
 * que ela pode se mover (atacando ou sendo um movimento natural da peça)
 * @param {number} casaOrigem - casa de origem 
 * @param {number} casaDestino - casa destino
 * @param {object} pecaIa - a peça sendo movida
 * @returns {boolean} - movimento válido ou não
 */
export function validarMovimentoIa(casaOrigem, casaDestino, pecaIa) {
    if (!pecaIa) {
        console.error("ERRO DE VALIDAÇÃO: Não há peça na casa de origem do movimento.");
        return false;
    }
    if (pecaIa.getTeam() === timeIA) {
        let movimentos;
        let movimento_valido = false;

        // CHECAGEM PEÃO: Se for Peão, a verificação de movimentação é diferente para ele
        if (pecaIa.getName() === 'Peão') { 
            movimentos = pecaIa.calculateMovesForIA(casaOrigem, timeIA)
            let movimentos_lista = movimentos.flat();
            movimento_valido = movimentos_lista.includes(casaDestino)
            console.log(movimentos_lista, casaDestino)
        } 
        
        // CHECAGEM REI: Se for Rei, verifica roque (não é visto em calculateMoves) E movimento normal
        else if (pecaIa.getName() === "Rei") {
            const origemFile = casaOrigem % 8;
            const destinoFile = casaDestino % 8;
            const fileDiff = Math.abs(destinoFile - origemFile);

            // TENTATIVA DE ROQUE (movimento de 2 casas)
            if (fileDiff === 2) {
                if (isRoqueLegal(casaOrigem, casaDestino, timeIA)) {
                    return true; // Movimento especial: Válido, retorna imediatamente.
                } else {
                    return false; // Roque ilegal, retorna imediatamente.
                }
            } 
            // MOVIMENTO NORMAL DO REI (1 casa)
            else { 
                movimentos = pecaIa.calculateMoves(casaOrigem, timeIA)
                movimento_valido = movimentos.includes(casaDestino)
                console.log(movimentos, casaDestino)
            }
        }
        
        //  CHECAGEM GERAL: Se não for Peão nem Rei, segue o fluxo para outras peças (Torre, Dama, etc.)
        else {
            movimentos = pecaIa.calculateMoves(casaOrigem, timeIA)
            movimento_valido = movimentos.includes(casaDestino)
            console.log(movimentos, casaDestino)
        }

        // RETORNO FINAL: Para todos os casos que não retornaram imediatamente (roque)
        if (movimento_valido) {
            return true;
        } else {
            return false;
        }
    } 
    // Peça não é do time da IA
    else {
        return false
    }
}

