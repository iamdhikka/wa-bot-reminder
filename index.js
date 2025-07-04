const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');

const GROUP_ID = 'ISI_ID_GRUP_KAMU_DI_SINI@g.us'; // Ganti setelah login dan lihat logs

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Scan QR ini di WhatsApp Web:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot aktif dan siap mengirim pengingat!');

    // Jadwal absen pagi (07:00 WIB)
    schedule.scheduleJob('0 0 0 * * *', () => {
        const now = new Date();
        if (now.getHours() === 7) {
            client.sendMessage(GROUP_ID, '☀️ Selamat pagi! Jangan lupa absen ya.');
        }
    });

    // Jadwal absen sore (17:00 WIB)
    schedule.scheduleJob('0 0 0 * * *', () => {
        const now = new Date();
        if (now.getHours() === 17) {
            client.sendMessage(GROUP_ID, '🕔 Waktunya pulang! Jangan lupa absen sore!');
        }
    });
});

client.initialize();