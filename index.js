import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
import qrcode from "qrcode-terminal"

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot()
      }
    } else if (connection === "open") {
      console.log("✅ Bot WhatsApp aktif")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    // COMMAND MENU
    if (text === "menu") {
      await sock.sendMessage(from, {
        text: "✨ *WELCOME TO LIVIAA STORE* ✨\n\nSilakan pilih menu di bawah:",
        buttons: [
          {
            buttonId: "daftar",
            buttonText: { displayText: "📝 Daftar" },
            type: 1
          },
          {
            buttonId: "owner",
            buttonText: { displayText: "👤 Owner" },
            type: 1
          }
        ],
        headerType: 1
      })
    }

    // BUTTON RESPONSE
    if (msg.message.buttonsResponseMessage) {
      const id = msg.message.buttonsResponseMessage.selectedButtonId

      if (id === "daftar") {
        await sock.sendMessage(from, {
          text: "📝 *Pendaftaran*\nSilakan kirim format:\n\nNama:\nNomor:\nProduk:"
        })
      }

      if (id === "owner") {
        await sock.sendMessage(from, {
          text: "👤 *Owner LIVIAA*\nWhatsApp: wa.me/628xxxxxxxxx"
        })
      }
    }
  })
}

startBot()
