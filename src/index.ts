import makeWASocket, { useSingleFileAuthState } from "@adiwajshing/baileys";

const { state, saveState } = useSingleFileAuthState("./auth.json");
async function connectToWhatsapp() {
  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "open") {
      console.log("connection opened");
    } else if (connection === "close") {
      console.log("connection closed");
    }
  });

  socket.ev.on("creds.update", saveState);

  socket.ev.on("messages.upsert", ({messages}) => {
    const remitente = messages[0].key.remoteJid;
    const texto = messages[0].message?.conversation

    if (texto === "hola") {
      socket.sendMessage(remitente!, {text: "hola"})
    }
  });

}

connectToWhatsapp();