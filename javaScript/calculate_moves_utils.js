import { boardgame, brancas } from "./jogo.js";
/**
 * funções que calculam movimentos de peças para determinar se há um ataque inimigo ao rei.
 * @param {number} actualIndex - valor que representa o index da casa onde a peça está
 * @returns {Array<number>} Lista dos movimentos validos 
*/

export function calculateKnightDestinations(actualIndex) {
    const destinos = [];
    // Offsets para os 8 movimentos em 'L' (ex: +17 = 2 para frente, 1 para a direita)
    const directions = [17, 15, 10, 6, -17, -15, -10, -6];
    const actualFile = actualIndex % 8; // Coluna da peça atual (0=A, 7=H)

    for (const direction of directions) {
        const targetIndex = actualIndex + direction;

        // 1. Checa se o destino está dentro dos limites do tabuleiro (0 a 63)
        if (targetIndex >= 0 && targetIndex <= 63) {

            const targetFile = targetIndex % 8;
            const fileChange = Math.abs(targetFile - actualFile);

            // 2. Checa Salto Inválido (O Cavalo não pode saltar de 'A' para 'H', por exemplo).
            // A mudança de coluna deve ser EXATAMENTE 1 ou 2.
            if (fileChange === 0 || fileChange > 2) continue;

            destinos.push(targetIndex);
        }
    }
    return destinos;
}
export function calculateBishopDestinations(actualIndex) {
    const destinos = [];

    const directions = [-9, -7, 7, 9];

    // Itera sobre cada uma das 4 direções
    for (const direction of directions) {
        let currentIndex = actualIndex;

        // Continua movendo nessa direção até ser bloqueado ou atingir o limite
        while (true) {
            const targetIndex = currentIndex + direction;

            // 1. Checa se o destino está FORA do tabuleiro (0 a 63)
            if (targetIndex < 0 || targetIndex > 63) {
                break; // Sai do loop desta direção
            }

            // 2. Checagem de Salto de Borda (Ex: Pular de H1 para A2)
            // Se a coluna (file) da casa atual e da casa destino mudaram mais do que 1, é um salto ilegal.
            // A única exceção é o Cavalo.
            const actualFile = currentIndex % 8;
            const targetFile = targetIndex % 8;

            // Se a diferença de coluna for maior que 1, significa que pulou a borda (ex: 7 para 0 ou 0 para 7)
            if (Math.abs(targetFile - actualFile) > 1) {
                break; // Sai do loop desta direção, atingiu a borda
            }


            // --- A Casa é VÁLIDA. Checamos Ocupação ---
            const targetPiece = boardgame[targetIndex].getPiece();

            if (!targetPiece) {
                // Casa vazia: Adiciona o destino e continua para a próxima casa na mesma direção
                destinos.push(targetIndex);
                currentIndex = targetIndex; // Move o ponteiro para continuar o 'while'

            } else {
                // Casa ocupada:
                if (targetPiece) {
                    // Adiciona para o destino (captura)
                    destinos.push(targetIndex);
                }
                // Em ambos os casos (aliada ou adversária), a linha está BLOQUEADA
                break;
            }
        }
    }
    return destinos;
}
export function calculateRookDestinations(actualIndex) {
    const destinos = [];

    // As quatro direções: (direita, esquerda, cima, baixo)
    const directions = [1, -1, 8, -8];

    // Itera sobre cada uma das 4 direções
    for (const direction of directions) {
        let currentIndex = actualIndex;

        // Continua movendo nessa direção até ser bloqueado ou atingir o limite
        while (true) {
            const targetIndex = currentIndex + direction;

            // 1. Checa se o destino está FORA do tabuleiro (0 a 63)
            if (targetIndex < 0 || targetIndex > 63) {
                break; // Limite do array atingido
            }

            // 2. Checagem de Salto de Borda (Aplica-se apenas aos movimentos laterais: +1 e -1)
            // Se a direção for lateral, o movimento não pode cruzar o limite da coluna (ex: H para A).
            if (Math.abs(direction) === 1) { // Só checa se for movimento lateral
                const actualRank = Math.floor(currentIndex / 8); // Linha atual
                const targetRank = Math.floor(targetIndex / 8); // Linha de destino

                // Se a linha mudou durante um movimento lateral (+1 ou -1), a borda foi cruzada.
                if (actualRank !== targetRank) {
                    break; // Sai do loop desta direção, atingiu a borda
                }
            }

            // --- tenta validar ocupação na casa ---
            const targetPiece = boardgame[targetIndex].getPiece();

            if (!targetPiece) {
                // Casa vazia: Adiciona o destino e continua para a próxima casa na mesma direção
                destinos.push(targetIndex);
                currentIndex = targetIndex; // Move o ponteiro para continuar o 'while'

            } else {
                // Casa ocupada:
                if (targetPiece) {
                    // Adiciona para o destino (captura)
                    destinos.push(targetIndex);
                }
                // Em ambos os casos (aliada ou adversária), a linha está BLOQUEADA
                break; // Para o loop nesta direção
            }
        }
    }
    return destinos;

}
export function calculateKingDestinations(actualIndex) {
    const destinos = [];
    // As 8 direções de movimento (Torre + Bispo)
    // [1, -1, 8, -8] = Cima/baixo (Retas)
    // [9, -9, 7, -7] = Diagonais
    const directions = [1, -1, 8, -8, 9, -9, 7, -7];
    const actualFile = actualIndex % 8; // Coluna (0=A, 7=H)

    for (const direction of directions) {
        const targetIndex = actualIndex + direction;

        // 1. Checa se o destino está dentro dos limites do tabuleiro (0 a 63)
        if (targetIndex >= 0 && targetIndex <= 63) {

            const targetFile = targetIndex % 8;
            const fileChange = Math.abs(targetFile - actualFile);

            // 2. Checa Salto de Borda (Impede saltos de H para A em movimentos laterais/diagonais)
            // Se o movimento for lateral/diagonal, a coluna só pode mudar no máximo 1.
            if (fileChange > 1) continue;

            // 3. Ocupação/Ataque
            const targetPiece = boardgame[targetIndex].getPiece();

            // Se a casa estiver vazia, OU tiver peça 
            if (!targetPiece || targetPiece) {
                destinos.push(targetIndex);

            }
        }
    }
    return destinos;
}

export function calculateQueenDestinations(actualIndex) {
    const destinos = [];

    // As 8 direções de movimento (Torre + Bispo)
    // [1, -1, 8, -8] = Cima/baixo (Retas)
    // [9, -9, 7, -7] = Diagonais
    const directions = [1, -1, 8, -8, 9, -9, 7, -7];

    // Itera sobre cada uma das 8direções
    for (const direction of directions) {
        let currentIndex = actualIndex;

        // Continua movendo nessa direção
        while (true) {
            const targetIndex = currentIndex + direction;

            // 1. Checa se o destino está FORA do tabuleiro (0 a 63)
            if (targetIndex < 0 || targetIndex > 63) {
                break;
            }

            // 2. Checagem de Salto de Borda (para todos os movimentos longos)
            const actualFile = currentIndex % 8;
            const targetFile = targetIndex % 8;

            // Regra do bispo: Se a diferença de coluna for maior que 1, 
            // e a direção for diagonal, significa que pulou a borda (ex: H para A).
            if (Math.abs(direction) === 7 || Math.abs(direction) === 9) { // Movimentos Diagonais
                if (Math.abs(targetFile - actualFile) > 1) {
                    break;
                }
            }
            // Regra da Torre: Se for movimento lateral (+1 ou -1), a linha não pode ter mudado.
            else if (Math.abs(direction) === 1) { // Movimentos Horizontais
                const actualRank = Math.floor(currentIndex / 8);
                const targetRank = Math.floor(targetIndex / 8);
                if (actualRank !== targetRank) {
                    break;
                }
            }
            // Nota: Movimentos verticais (+8, -8) são naturalmente contidos.


            // --- A Casa é VÁLIDA. Checamos Ocupação ---
            const targetPiece = boardgame[targetIndex].getPiece();

            if (!targetPiece) {
                // Casa vazia: Adiciona o destino e continua
                destinos.push(targetIndex);
                currentIndex = targetIndex;

            } else {
                // Casa ocupada:
                if (targetPiece) {
                    // Adiciona para o destino (captura)
                    destinos.push(targetIndex);
                }
                // Em ambos os casos, a linha está BLOQUEADA
                break;
            }
        }
    }
    return destinos;
}
export function calculatePawnDestinations(actualIndex, color, isFirstMove) {
    // o peão tem destinos de movimento e ataque diferentes
    const destinos = [[], []];
    // Brancas movem para índices menores (subindo no tabuleiro), pretas descem para indices maiores.
    const direction = color === brancas ? -8 : 8;
    const actualFile = actualIndex % 8; // Coluna atual para checar En Passant

    // --- 1. MOVIMENTO DE UM PASSO ---
    const indexUmPasso = actualIndex + direction;

    // Checa se a casa está no tabuleiro E está vazia
    if (indexUmPasso >= 0 && indexUmPasso <= 63 && !boardgame[indexUmPasso].getPiece()) {
        destinos[0].push(indexUmPasso);

        // --- 2. MOVIMENTO DE DOIS PASSOS (Se o caminho de 1 passo estava livre) ---
        if (isFirstMove) {
            const indexDoisPassos = actualIndex + (direction * 2);

            // Checa se a casa de dois passos está no tabuleiro E está vazia
            if (indexDoisPassos >= 0 && indexDoisPassos <= 63 && !boardgame[indexDoisPassos].getPiece()) {
                destinos[0].push(indexDoisPassos);
            }
        }
    }

    // --- 3. ATAQUES DIAGONAIS (Capturas) ---
    const ataquesOffsets = [direction - 1, direction + 1]; // -9 (esquerda), -7 (direita)

    for (const offset of ataquesOffsets) {
        const indexAtaque = actualIndex + offset;

        // 3.1. Checagem de Limite e Borda
        if (indexAtaque >= 0 && indexAtaque <= 63) {
            const targetFile = indexAtaque % 8;

            // Impede que o Peão em A8 (-1) ou H8 (+1) pule para o lado oposto
            if (Math.abs(targetFile - actualFile) > 1) continue;

            destinos[1].push(indexAtaque);

        }
    }

    return destinos;
}
// jogo.js (ou rules_IA_utils.js, dependendo de onde você preferir as utilidades)

/**
 * Analisa a string de resposta do Gemini (que pode conter comentários) 
 * e extrai o lance no formato UMS (Universal Move Notation: e2e4, g1f3, a7a8q).
 * * @param {string} texto - A string completa devolvida pelo Gemini (Ex: "e7e5 roque, segurança do rei.")
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
    const regex = /([a-h][1-8][a-h][1-8])/i;

    // A função .match() procura o padrão na string
    const match = texto.match(regex);

    if (match && match.length > 0) {
        // match[0] contém o lance encontrado. Retornamos em minúsculas (convenção FEN/IA)
        return match[0].toLowerCase();
    } else {
        // Se a notação do lance não for encontrada, retorna null
        console.warn("Não foi possível extrair a notação do lance da resposta do Gemini:", texto);
        return null; // Retorna null
    }
}
