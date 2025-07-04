const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const schedule = require('node-schedule')
const express = require('express') // ✅ Tambahan
const app = express()              // ✅ Tambahan

// ✅ Start express server supaya Railway gak tidur
app.get('/', (req, res) => res.send('✅ WA Bot aktif di Railway!'))
app.listen(process.env.PORT || 3000, () =>
  console.log(`🌐 Express server aktif di port ${process.env.PORT || 3000}`)
)

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

      // ⏰ Reminder Senin–Jumat
      schedule.scheduleJob('0 7 * * 1-5', async () => {
        await sendReminder(sock, GROUP_ID, '☀️ Selamat pagi! Jangan lupa absen ya.')
      })

      schedule.scheduleJob('0 17 * * 1-5', async () => {
        await sendReminder(sock, GROUP_ID, '🕔 Waktunya pulang! Jangan lupa absen sore!')
      })

      // ⏰ Reminder Weekend
      schedule.scheduleJob('0 8 * * 6,0', async () => {
        await sendReminder(sock, GROUP_ID, '📆 [TESTING WEEKEND] Selamat pagi akhir pekan!')
      })

      schedule.scheduleJob('0 16 * * 6,0', async () => {
        await sendReminder(sock, GROUP_ID, '🌇 [TESTING WEEKEND] Sore akhir pekan, waktunya istirahat!')
      })
    }
  })

  // ✅ Auto-reply 'ping' → 'pong!'
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    const sender = msg.key.remoteJid

    if (text?.toLowerCase() === 'ping') {
      console.log('📩 Ping diterima, mengirim pong!')
      await sock.sendMessage(sender, { text: 'pong! ✅' })
    }
  })
}

// 🔁 Helper: kirim pesan dengan error handling
async function sendReminder(sock, jid, text) {
  try {
    await sock.sendMessage(jid, { text })
    console.log(`✅ Reminder terkirim ke ${jid}: ${text}`)
  } catch (e) {
    console.error('❌ Gagal kirim reminder:', e)
  }
}

startBot()
