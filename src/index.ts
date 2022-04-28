import makeWASocket, {
  DisconnectReason,
  useSingleFileAuthState,
} from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";

const { state, saveState } = useSingleFileAuthState("./auth.json");
async function connectToWhatsapp() {
  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  // Make connection
  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect!.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to error ",
        // lastDisconnect!.error,
        ", reconnecting ",
        shouldReconnect
      );
      if (shouldReconnect) {
        connectToWhatsapp();
      }
    } else if (connection === "open") {
      console.log("Connection opened");
    }
  });

  socket.ev.on("creds.update", saveState);

  socket.ev.on("messages.upsert", ({ messages }) => {
    const remitente = messages[0].key.remoteJid;
    const texto = messages[0].message?.conversation;

    if (texto === "hola") {
      socket.sendMessage(remitente!, { text: "hola" });
    }
  });
}

connectToWhatsapp();
