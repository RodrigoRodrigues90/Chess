import {
    setWhiteCastleKingSide, setWhiteCastleQueenSide,
    setBlackCastleKingSide, setBlackCastleQueenSide,
} from "./fen_utils.js";
import { boardgame, brancas, context, pontuacao, checkXequeMate, isxeque } from "./jogo.js";

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
 * Executa o movimento de Roque (Rei + Torre) com base no lance da IA.
 * @param {number} kingFromIndex - Índice de origem do Rei (ex: 60 para e1).
 * @param {number} kingToIndex - Índice de destino do Rei (ex: 62 para g1).
 */
export function executeRoque(kingFromIndex, kingToIndex) {
    const kingPiece = boardgame[kingFromIndex].getPiece();
    if (!kingPiece) return;

    // A. Define as casas da Torre com base na direção do Roque
    let rookFromIndex, rookToIndex;

    if (kingToIndex > kingFromIndex) {
        // Roque Curto (Kingside): Rei move 2 casas para a direita
        rookFromIndex = kingFromIndex + 3; // Torre em h1 ou h8
        rookToIndex = kingFromIndex + 1;   // Torre em f1 ou f8
    } else {
        // Roque Longo (Queenside): Rei move 2 casas para a esquerda
        rookFromIndex = kingFromIndex - 4; // Torre em a1 ou a8
        rookToIndex = kingFromIndex - 1;   // Torre em d1 ou d8
    }

    // B. Movimenta a Torre
    moveRookForCastling(rookFromIndex, rookToIndex);

    // C. Movimenta o Rei
    movePieceTransfer(kingFromIndex, kingToIndex);
}

/**
 * Move a Torre durante o Roque.
 * @param {number} rookFromIndex - Índice de origem da Torre (ex: 7 para h1).
 * @param {number} rookToIndex - Índice de destino da Torre (ex: 5 para f1).
 */
function moveRookForCastling(rookFromIndex, rookToIndex) {
    const casaTorreOrigem = boardgame[rookFromIndex];
    const casaTorreDestino = boardgame[rookToIndex];


    // 1. INSTANCIAÇÃO NO DESTINO
    // Se a Torre for uma classe que não a Torre normal, adapte 'instanciarTorre'
    // Se for uma transferência de objeto peça:
    const piece = casaTorreOrigem.getPiece(); // Pega a peça antes de setar null
    if (piece) {
        // Atualiza as coordenadas do objeto Peça
        piece.x = casaTorreDestino.x;
        piece.y = casaTorreDestino.y;

        // Coloca a referência da peça na nova casa
        casaTorreDestino.placePiece(piece);
    }
    // 2. LIMPEZA NA ORIGEM
    casaTorreOrigem.clear(context);
    casaTorreOrigem.takeOffPiece();
}
/**
 * movimento de peças feito pela IA, chamando as funções de desenho no canvas
 */
export function movePieceTransfer(fromIndex, toIndex) {
    const casaOrigem = boardgame[fromIndex];
    const casaDestino = boardgame[toIndex];
    const piece = casaOrigem.getPiece();
    const piecePlayer = casaDestino.getPiece();
    if (!piece) return;

    // 1. Atualiza as coordenadas internas do objeto PEÇA
    if (piece.x !== undefined && piece.y !== undefined) {
        piece.x = casaDestino.x;
        piece.y = casaDestino.y;
    }

    // 3. Limpa a casa de origem
    casaOrigem.clear(context);
    casaOrigem.takeOffPiece();

    if (piecePlayer != null) {
        pontuacao(piecePlayer);
        checkXequeMate(piecePlayer);
        casaDestino.takeOffPiece();
        casaDestino.clear(context);
    }
    casaDestino.placePiece(piece);// coloca a peça na casa de destino
    piece.x = casaDestino.x;
    piece.y = casaDestino.y;
}

// rules_IA_utils.js (Adicione esta função)

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

