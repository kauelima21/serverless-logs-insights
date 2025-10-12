module.exports.handler = async (event) => {
    console.log('Lambda iniciada.');

    // Simula logs de níveis diferentes
    console.info('[INFO] Iniciando processamento da requisição.');
    console.debug('[DEBUG] Dados recebidos:', JSON.stringify(event));

    try {
        // Simula uma operação qualquer
        const value = Math.random();

        if (value > 0.7) {
            console.warn('[WARN] Valor alto detectado:', value);
        }

        if (value < 0.2) {
            throw new Error('Valor muito baixo — falha simulada.');
        }

        console.log('[INFO] Processamento concluído com sucesso.');
        console.log('[METRIC] tempoExecucaoMs=123 usuarioId=42');

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello from Lambda!',
                randomValue: value,
            }),
        };
    } catch (err) {
        console.error('[ERROR]', err.message);
        console.error('[STACK]', err.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    } finally {
        console.log('[INFO] Lambda finalizada.');
    }
};
