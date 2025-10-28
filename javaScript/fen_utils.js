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
    // rankIndex = 7 representa Rank 8 do FEN, rankIndex = 0 representa Rank 1 do FEN.
    for (let rankIndex = 7; rankIndex >= 0; rankIndex--) {
        emptyCount = 0;
        
        // *** CORREÇÃO AQUI: Adapta o cálculo para o mapeamento A8=0 do seu jogo ***
        // Quando rankIndex=7 (Rank 8), o startIndex deve ser 0.
        // Quando rankIndex=0 (Rank 1), o startIndex deve ser 56.
        const startIndex = (7 - rankIndex) * 8; 
        
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
    // enPassantSquare deve estar acessível por export no fen_utils.js
    const enPassant = enPassantSquare || '-'; 
    
    // --- 5. Contador de Meios-Lances (Simplificado para 0) ---
    const halfMoveClock = 0; 
    
    // --- 6. Número do Lance Completo ---
    const finalFullMoveNumber = fullMoveNumber || 1; 
    
    // Combina todas as partes
    const fullFen = `${piecePlacement} ${activeColor} ${castling} ${enPassant} ${halfMoveClock} ${finalFullMoveNumber}`;
    
    return fullFen;
}

/**
 * Analisa a string de resposta do Gemini (que pode conter comentários) 
 * e extrai o lance no formato UMS (Universal Move Notation: e2e4, g1f3, a7a8q).
 * * @param {string} texto - A string completa devolvida (Ex: "e7e5 roque, segurança do rei.")
 * @returns {string | null} O lance limpo (ex: "e7e5"), ou null se não for encontrado.
 */
export function extrairNotacaoDaResposta(texto) {
    if (!texto || typeof texto !== 'string') {
        return null;
    }

    // O padrão de RegEx (Expressão Regular) que procuramos:
    // 1. [a-h][1-8]: Duas casas de xadrez (ex: e2)
    // 2. [a-h][1-8]: Mais duas casas de xadrez (ex: e4)
    // 3. A notação pode estar em maiúsculas ou minúsculas (usamos 'i' para case insensitive)    
    const regex = /([a-h][1-8][a-h][1-8][qrbn]?)/i;

    // A função .match() procura o padrão na string
    const match = texto.match(regex);

    if (match && match.length > 0) {
        // match[0] contém o lance encontrado. Retornamos em minúsculas (convenção FEN/IA)
        return match[0].toLowerCase();
    } else {
        // Se a notação do lance não for encontrada, retorna null
        console.warn("Não foi possível extrair a notação do lance da resposta:", texto);
        return null; // Retorna null
    }
}