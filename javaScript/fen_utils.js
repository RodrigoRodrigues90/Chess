// Variáveis de controlo do direito de roque (K/Q, k/q)

//---variaveis que anulam o roque caso movimento de rei ou torre 
export let canWhiteCastleKingSide = true;  // Roque do Rei Branco (K)
export let canWhiteCastleQueenSide = true; // Roque da Dama Branca (Q)
export let canBlackCastleKingSide = true;  // Roque do Rei Preto (k)
export let canBlackCastleQueenSide = true; // Roque da Dama Preta (q)

// Variável para a casa de En Passant (ex: 'e3', 'd6', ou null)
export let enPassantSquare = null;


// Estas funções DEVEM ser chamadas em 'jogo.js' sempre que as peças se movem.
export const setWhiteCastleKingSide = (value) => { canWhiteCastleKingSide = value; };
export const setWhiteCastleQueenSide = (value) => { canWhiteCastleQueenSide = value; };
export const setBlackCastleKingSide = (value) => { canBlackCastleKingSide = value; };
export const setBlackCastleQueenSide = (value) => { canBlackCastleQueenSide = value; };

/** 
 * seta a string do index do boardgame onde tem movimento de enpassant
 * @param {string} square  por exemplo "e7" boardgame[?].geIndex() 
 * */ 
export const setEnPassantSquare = (square) => { enPassantSquare = square; };


/**
 * Calcula a string de roque (3º campo FEN) com base nas flags globais.
 * @returns {string} Ex: 'KQk' ou '-'
 */
function calcularStringRoqueFEN() {
    let roqueString = '';
    
    if (canWhiteCastleKingSide) roqueString += 'K';
    if (canWhiteCastleQueenSide) roqueString += 'Q';
    if (canBlackCastleKingSide) roqueString += 'k';
    if (canBlackCastleQueenSide) roqueString += 'q';

    return roqueString || '-';
}

// =================================================================
// FUNÇÃO PRINCIPAL FEN
// =================================================================
/**
 * Converte o estado do tabuleiro e as variáveis de controle numa string FEN.
 * @param {Array} boardgame - O array de 64 casas (0=A1 a 63=H8).
 * @param {number} timeToMove - A cor que deve jogar (1=brancas, 0=pretas).
 * @param {number} fullMoveNumber - O número do lance completo (ex: 1, 2, 3...).
 * @returns {string} A string FEN completa.
 */
export function gerarFENdoTabuleiro(boardgame, timeToMove, fullMoveNumber) {
    
    // --- 1. Posicionamento das Peças (Piece Placement) ---
    let piecePlacement = '';
    let emptyCount = 0; 
    
    const pieceMap = {
        'Peão': 'P', 
        'Cavalo': 'N', 
        'Bispo': 'B',
        'Torre': 'R', 
        'Dama': 'Q', 
        'Rei': 'K',
    };
    
    // Itera as fileiras de 8 para 1 (Ordem FEN: 8/7/6/...)
    for (let rankIndex = 7; rankIndex >= 0; rankIndex--) {
        emptyCount = 0;
        const startIndex = rankIndex * 8; 
        
        for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
            const squareIndex = startIndex + fileIndex;
            
            const piece = boardgame[squareIndex].getPiece ? boardgame[squareIndex].getPiece() : null;
            if (piece != null) {
                const name = piece.getName();
                if (emptyCount > 0) {
                    piecePlacement += emptyCount;
                    emptyCount = 0;
                }
                
                const fenChar = pieceMap[name]; 
                
                // time=1 (brancas) = maiúscula; time=0 (pretas) = minúscula
                if (piece.getTeam() === 1) { 
                    piecePlacement += fenChar;
                } else {
                    piecePlacement += fenChar.toLowerCase(); //converte para minúscula
                }
            } else {
                emptyCount++;
            }
        }
        
        if (emptyCount > 0) {
            piecePlacement += emptyCount;// Adiciona casas vazias restantes
        }

        if (rankIndex > 0) {
            piecePlacement += '/'; // Separador de fileiras
        }
    }
    
    // --- 2. Cor Ativa ('w' ou 'b') ---
    const activeColor = (timeToMove === 1) ? 'w' : 'b'; 
    
    // --- 3. Capacidade de Roque ---
    const castling = calcularStringRoqueFEN(); 
    
    // --- 4. Casa de En Passant ---
    const enPassant = enPassantSquare || '-'; 
    
    // --- 5. Contador de Meios-Lances (Simplificado para 0) ---
    // Isto deve ser atualizado no jogo.js (resetado após captura ou mov. de peão)
    const halfMoveClock = 0; 
    
    // --- 6. Número do Lance Completo ---
    const finalFullMoveNumber = fullMoveNumber || 1; 
    
    // Combina todas as partes
    const fullFen = `${piecePlacement} ${activeColor} ${castling} ${enPassant} ${halfMoveClock} ${finalFullMoveNumber}`;
    
    return fullFen;
}