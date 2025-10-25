const { Engine } = require('node-uci');
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json()); 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const NOME_DO_BINARIO = 'stockfish-ubuntu-x86-64-avx2'; 
const STOCKFISH_PATH = path.join(__dirname, 'engines', NOME_DO_BINARIO);

// --- Rota Raiz (Para evitar 404) ---
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: `Chess AI Backend (Porta: ${port}) está online!`,
        endpoint_ia: "/api/jogada-ia (POST)",
    });
});

app.post('/api/jogada-ia', async (req, res) => {

    const { fen } = req.body; 

    if (!fen) {
        return res.status(400).send({ error: "FEN não fornecido." });
    }
    
   const engine = new Engine(STOCKFISH_PATH);

    try {
        await engine.init();
        await engine.setoption('UCI_AnalyseMode', false); 
        await engine.position(fen); 

        const result = await engine.go({ depth: 18 }); 
        const bestMove = result.bestmove;

        res.json({ movimento: bestMove }); 

    } catch (error) {
        console.error("ERRO STOCKFISH/BACKEND (500):", error.message);
        res.status(500).send({ error: "Erro interno no motor de xadrez." });
    } finally {
        if (engine) {
            await engine.quit();
        }
    }
});

app.listen(port, () => {
    console.log(`Stockfish rodando em http://localhost:${port}`);
});