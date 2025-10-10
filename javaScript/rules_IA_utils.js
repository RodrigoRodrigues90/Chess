import {
    setWhiteCastleKingSide, setWhiteCastleQueenSide,
    setBlackCastleKingSide, setBlackCastleQueenSide,
} from "./fen_utils.js";
import { boardgame } from "./jogo.js";

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
    const rank = Math.floor(index / 8) + 1; // 1 a 8
    const file = files[index % 8]; // 'a' a 'h'
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