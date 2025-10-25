import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

// --- Configuração da API ---
if (!process.env.API_KEY_GEMINI) {
    console.error("ERRO: A variável de ambiente API_KEY_GEMINI não está definida.");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.API_KEY_GEMINI
});
const model = "gemini-2.5-flash";

// Objeto para armazenar as sessões de chat ativas, indexadas pelo sessionId
const activeGameSessions = new Map();

// --- Configuração do Servidor Express ---
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

/**
 * Cria ou recupera uma ChatSession para uma partida específica.
 * A systemInstruction é usada para definir a instrução e o formato de resposta da IA.
 */
function createOrGetChatSession(sessionId, cor_ia) {
    if (activeGameSessions.has(sessionId)) {
        return activeGameSessions.get(sessionId);
    }
    // Instrução do sistema para o Gemini
    const systemInstruction = `
       "Análise de Xadrez Profunda. Sua cor é ${cor_ia}.
        voce vai receber a posiçao atual em FEN e deve responder com a melhor jogada possivel.
        Comportamento Exigido:
        1. Pense como um Motor de Xadrez: Priorize a Segurança do Rei e o controle do centro.
        2. Análise Tática: Busque ataques duplos, cravadas, garfos e sacrifícios sólidos.
        3. Formato: Retorne SOMENTE a notação UCG do lance escolhido (ex: 'e7e5', 'a8c8', 'h7h8'). NUNCA use 'exe5' ou 'O-O'."
        4. forneça uma breve explicação da jogada após a notação do movimento`;

    const newChat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: systemInstruction,
            temperature: 1.0
        }
    });

    activeGameSessions.set(sessionId, newChat);
    console.log(`Nova ChatSession criada para o ID: ${sessionId}`);

    return newChat;
}


// --- Rota da IA de Xadrez ---
app.post('/api/jogada-ia', async (req, res) => {
    // Agora esperamos um 'sessionId' do front-end
    const { fen, cor_ia, sessionId, feedBackError } = req.body;

    if (!fen || !cor_ia || !sessionId) {
        return res.status(400).json({ error: "FEN, cor_ia e sessionId são obrigatórios." });
    }

    try {
        // 1. Recupera ou cria a sessão de chat (com contexto)
        const chat = createOrGetChatSession(sessionId, cor_ia);

        // 2. Constrói o prompt
        let prompt;

        // SE HOUVER FEEDBACK DE ERRO, INCLUI A INSTRUÇÃO DE CORREÇÃO.
        if (feedBackError) {
            // Se houver erro, a IA recebe a instrução completa do frontend
            prompt = feedBackError;
        } else {
            // Caso contrário, usa o prompt padrão
            prompt = `A posição FEN atual é: ${fen}. Faça a sua jogada. cuidado com o seu rei!`;
        }

        console.log(`ID: ${sessionId} | A calcular jogada para ${cor_ia}...`);

        // 3. Enviar mensagem para a sessão de chat
        const response = await chat.sendMessage({
            message: prompt
        });

        // O Gemini devolverá a jogada (ex: "g1f3")
        const movimento = response.text.trim().toLowerCase();

        // 4. Devolver a jogada ao front-end
        console.log(`ID: ${sessionId} | Gemini devolveu: ${movimento}`);
        res.json({ movimento: movimento });

    } catch (error) {
        console.error("Erro na chamada à API Gemini:", error);
        // Em caso de erro, você pode querer remover a sessão para tentar novamente mais tarde.
        activeGameSessions.delete(sessionId);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao consultar a IA.", 
            details: error.message 
        });
    }
});

// --- Rota para Limpar a Sessão ---
// Útil para quando a partida termina (xeque-mate, empate)
app.post('/api/fim-partida', (req, res) => {
    const { sessionId } = req.body;
    if (activeGameSessions.has(sessionId)) {
        activeGameSessions.delete(sessionId);
        return res.json({ message: `Sessão ${sessionId} removida com sucesso.` });
    }
    res.status(404).json({ message: "Sessão não encontrada." });
});


// --- Iniciar o Servidor ---
app.listen(port, () => {
    console.log(`Servidor Express a correr em http://localhost:${port}`);
});