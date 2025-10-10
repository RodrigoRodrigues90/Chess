import { boardgame } from "./jogo.js";

/**
 * funções que calculam movimentos de peças para determinar se há um ataque inimigo ao rei.
 * @param {number} actualIndex - valor que representa o index da casa onde a peça está
 * @param {number} color - cor do inimigo (1 = brancas, 0 = pretas) 
 * @returns {Array<number>} Lista dos movimentos validos 
*/
export function calculateKnightDestinations(actualIndex, color) {
    const destinos = [];
    // Offsets para os 8 movimentos em 'L' (ex: +17 = 2 para frente, 1 para a direita)
    const offsets = [17, 15, 10, 6, -17, -15, -10, -6];
    const actualFile = actualIndex % 8; // Coluna da peça atual (0=A, 7=H)

    for (const offset of offsets) {
        const targetIndex = actualIndex + offset;

        // 1. Checa se o destino está dentro dos limites do tabuleiro (0 a 63)
        if (targetIndex >= 0 && targetIndex <= 63) {

            const targetFile = targetIndex % 8;
            const fileChange = Math.abs(targetFile - actualFile);

            // 2. Checa Salto Inválido (O Cavalo não pode saltar de 'A' para 'H', por exemplo).
            // A mudança de coluna deve ser EXATAMENTE 1 ou 2.
            if (fileChange === 0 || fileChange > 2) continue;

            // 3. Ocupação/Ataque
            const targetPiece = boardgame[targetIndex].getPiece();

            // Se a casa estiver vazia OU tiver peça do time oposto (Pretas)
            if (!targetPiece || targetPiece.getTeam() !== color) {
                destinos.push(targetIndex);
            }
        }
    }
    return destinos;
}
export function calculateBishopDestinations(actualIndex, color) {
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
                if (targetPiece.getTeam() !== color) {
                    // Ocupada por peça adversária: Adiciona para o destino (captura)
                    destinos.push(targetIndex);
                }
                // Em ambos os casos (aliada ou adversária), a linha está BLOQUEADA
                break;
            }
        }
    }
    return destinos;
}
