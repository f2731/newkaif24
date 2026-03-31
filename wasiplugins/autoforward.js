/**
 * ⚡ KAIF MD AUTOFORWARD BOT ⚡
 * Auto-Forward Command
 * Developed by Mr Wasi (ixxwasi)
 */
const { wasi_updateGroupSettings, wasi_getGroupSettings } = require('../wasilib/database');

module.exports = {
    name: 'autoforward',
    description: 'Auto-forward every incoming message from this group to set targets',
    aliases: ['af', 'autof'],
    category: 'Group',
    wasi_handler: async (sock, from, context) => {
        const { wasi_args, wasi_isAdmin, wasi_isOwner, wasi_isSudo, wasi_isGroup, sessionId } = context;

        if (!wasi_isGroup) {
            return await sock.sendMessage(from, { text: '❌ This command is only for groups.' });
        }

        if (!wasi_isAdmin && !wasi_isOwner && !wasi_isSudo) {
            return await sock.sendMessage(from, { text: '❌ You need to be an Admin to use this command.' });
        }

        const action = wasi_args[0]?.toLowerCase();
        const current = await wasi_getGroupSettings(sessionId, from) || {};

        if (!action) {
            const status = current.autoForward ? '🟢 ON' : '🔴 OFF';
            const targets = current.autoForwardTargets || [];

            let text = `🔄 *AUTO-FORWARD SETTINGS*\n\n`;
            text += `📌 *Status:* ${status}\n`;
            text += `🎯 *Targets:* ${targets.length > 0 ? targets.join(', ') : 'None'}\n\n`;
            text += `*Commands:*\n`;
            text += `• \`.autoforward on\` - Enable\n`;
            text += `• \`.autoforward off\` - Disable\n`;
            text += `• \`.autoforward set jid1, jid2\` - Set target JIDs\n`;
            text += `• \`.autoforward add jid\` - Add single target JID\n`;
            text += `• \`.autoforward clear\` - Clear all targets\n\n`;
            text += `> _Every message in this group will be relayed to these targets._`;

            return await sock.sendMessage(from, { text });
        }

        if (action === 'on') {
            if (!current.autoForwardTargets || current.autoForwardTargets.length === 0) {
                return await sock.sendMessage(from, { text: '⚠️ Please set target JIDs first using `.autoforward set <jids>`' });
            }
            await wasi_updateGroupSettings(sessionId, from, { autoForward: true });
            return await sock.sendMessage(from, { text: '✅ *Auto-Forward* enabled for this group.' });
        }

        if (action === 'off') {
            await wasi_updateGroupSettings(sessionId, from, { autoForward: false });
            return await sock.sendMessage(from, { text: '✅ *Auto-Forward* disabled for this group.' });
        }

        if (action === 'set') {
            const input = wasi_args.slice(1).join(' ');
            if (!input) return await sock.sendMessage(from, { text: '❌ Usage: `.autoforward set jid1, jid2`' });

            const targets = input.split(',').map(j => {
                let jid = j.trim();
                if (jid && !jid.includes('@')) jid += '@s.whatsapp.net';
                return jid;
            }).filter(j => j.length > 5);

            await wasi_updateGroupSettings(sessionId, from, { autoForwardTargets: targets });
            return await sock.sendMessage(from, { text: `✅ Targets set: ${targets.length} JIDs.` });
        }

        if (action === 'add') {
            let jid = wasi_args[1]?.trim();
            if (!jid) return await sock.sendMessage(from, { text: '❌ Usage: `.autoforward add <jid>`' });
            if (!jid.includes('@')) jid += '@s.whatsapp.net';

            const targets = current.autoForwardTargets || [];
            if (!targets.includes(jid)) {
                targets.push(jid);
                await wasi_updateGroupSettings(sessionId, from, { autoForwardTargets: targets });
                return await sock.sendMessage(from, { text: `✅ Added target: ${jid}` });
            } else {
                return await sock.sendMessage(from, { text: '⚠️ JID already in targets.' });
            }
        }

        if (action === 'clear') {
            await wasi_updateGroupSettings(sessionId, from, { autoForwardTargets: [], autoForward: false });
            return await sock.sendMessage(from, { text: '✅ Auto-Forward targets cleared and feature disabled.' });
        }

        return await sock.sendMessage(from, { text: '❌ Unknown action. Use `.autoforward` for help.' });
    }
};
