<<<<<<< HEAD
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
=======
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const schedule = require('node-schedule')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false,
    fireInitQueries: true,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('🔐 Scan QR Code berikut pakai WhatsApp Web:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed. Reconnecting:', shouldReconnect)
      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!')

      try {
        await new Promise(resolve => setTimeout(resolve, 7000))
        const groups = await sock.groupFetchAllParticipating()
        const groupList = Object.values(groups)

        console.log('\n📋 Grup yang terhubung:')
        groupList.forEach((group, i) => {
          console.log(`${i + 1}. ${group.subject} - ${group.id}`)
        })
      } catch (err) {
        console.error('❌ Gagal mengambil daftar grup:', err)
      }

      const GROUP_ID = '120363400461504472@g.us'

      // Reminder pagi Senin–Jumat pukul 07:00
      schedule.scheduleJob('0 7 * * 1-5', async () => {
        try {
          await sock.sendMessage(GROUP_ID, { text: '☀️ Selamat pagi! Jangan lupa absen ya.' })
          console.log('✅ Reminder pagi terkirim!')
        } catch (e) {
          console.error('❌ Gagal kirim pesan pagi:', e)
        }
      })

      // Reminder sore Senin–Jumat pukul 17:00
      schedule.scheduleJob('0 17 * * 1-5', async () => {
        try {
          await sock.sendMessage(GROUP_ID, { text: '🕔 Waktunya pulang! Jangan lupa absen sore!' })
          console.log('✅ Reminder sore terkirim!')
        } catch (e) {
          console.error('❌ Gagal kirim pesan sore:', e)
        }
      })

      // Reminder pagi Sabtu–Minggu pukul 08:00 (testing)
      schedule.scheduleJob('0 8 * * 6,0', async () => {
        try {
          await sock.sendMessage(GROUP_ID, { text: '📆 [TESTING WEEKEND] Selamat pagi akhir pekan!' })
          console.log('✅ Reminder pagi weekend terkirim!')
        } catch (e) {
          console.error('❌ Gagal kirim pesan pagi weekend:', e)
        }
      })

      // Reminder sore Sabtu–Minggu pukul 16:00 (testing)
      schedule.scheduleJob('0 16 * * 6,0', async () => {
        try {
          await sock.sendMessage(GROUP_ID, { text: '🌇 [TESTING WEEKEND] Sore akhir pekan, waktunya istirahat!' })
          console.log('✅ Reminder sore weekend terkirim!')
        } catch (e) {
          console.error('❌ Gagal kirim pesan sore weekend:', e)
        }
      })
    }
  })
}

startBot()
>>>>>>> bb1f848 (init bot whatsapp)
