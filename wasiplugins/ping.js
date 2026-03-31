/**
 * ⚡ KAIF MD AUTOFORWARD BOT ⚡
 * Ping Command
 * Developed by Mr Wasi (ixxwasi)
 */
module.exports = {
    name: 'ping',
    category: 'Information',
    desc: 'Show the bot response speed',
    wasi_handler: async (wasi_sock, wasi_origin, context) => {
        const { wasi_msg } = context;
        const start = Date.now();
        
        // 1. Send "Ping..."
        const pingMsg = await wasi_sock.sendMessage(wasi_origin, { text: 'Ping...' });
        const end = Date.now();
        const responseTime = end - start;

        // 2. Incoming Latency (Optional, depends on sync'd clock)
        const incomingLatency = Math.max(0, Date.now() - (wasi_msg.messageTimestamp * 1000));
        
        let report = `*🏓 Pong!* — *${responseTime}ms*\n`;
        report += `📡 *Server Latency:* ${incomingLatency}ms`;

        // Update the message
        await wasi_sock.sendMessage(wasi_origin, { 
            text: report, 
            edit: pingMsg.key 
        });
    }
};
