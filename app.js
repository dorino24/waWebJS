const express = require("express");
const WhatsappSessionManager = require("./controllers/WhatsappSessionManager");
const cors = require("cors");
const app = express();
const port = 8080;

const whatsappManager = new WhatsappSessionManager();

const corsOptions = {
  origin: "https://mangantri.id",
  optionsSuccessStatus: 200, // For preflight requests
};

app.use(cors(corsOptions));

app.get("/create-session/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const qrGenerationCallback = (qrCode, sessionId) => {
    console.log("QR Code Received:", qrCode, sessionId);
 };

  const readyInstanceCallback = (sessionId) => {
    console.log("WhatsApp Web Client is ready!");
  };
  const disconnectedCallback = (sessionId) => {
    whatsappManager.closeSession(sessionId);
  };

  if (whatsappManager.getSession(sessionId) == undefined) {
    whatsappManager.createSession(
      sessionId,
      qrGenerationCallback,
      readyInstanceCallback,
      disconnectedCallback
    );
  }
  res.json({
    message: `WhatsApp session created for session ${sessionId}`,
    status: "created",
    session: sessionId,
  });
});

app.get("/get-qr/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = whatsappManager.getSession(sessionId);

  if (session) {
    const qrText = session.getQrText();
    const sessionid = session.getSessionId();
    console.log(qrText);
    if (qrText[sessionId]) {
      qr = qrText[sessionId];
      res.json({ status: "QR Didapatkan Silahkan Ditautkan", qr, sessionId });
    } else {
      res.status(404).json({
        status: "QR Belum Muncul, Mohon Tunggu Sampai Muncul",
        sessionId,
      });
    }
  } else {
    res.status(404).json({
      error: `WhatsApp session not found for session ${sessionId}`,
      status: "no session",
      session: sessionId,
    });
  }
});

async function getStatus(Client) {
  try {
    const status = await Client.getState();
    return Promise.resolve(status);
  } catch (error) {
    return Promise.reject(error);
  }
}

app.get("/get-state/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  // const routeUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  try {
    const session = whatsappManager.getSession(sessionId);
    if (session) {
      const client = session.getClient();
      getStatus(client)
        .then((status) => {
          console.log("Status:", status);
          res.json({ status: status, session: sessionId });
        })
        .catch((error) => {
          console.error("Error:", error);
          res.status(500).json({ status: "Null", session: sessionId, error });
        });
    } else {
      res.status(404).json({
        error: `WhatsApp session not found for session ${sessionId}`,
        status: "no session",
        session: sessionId,
      });
    }
  } catch (error) {
    res.status(404).json({
      error: `WhatsApp session not found for session ${sessionId}`,
      status: "no session",
      session: sessionId,
    });
  }
});

app.get("/send-message/",async (req, res) => {
  const sessionId  = req.query.sessionId;
  let nomor = req.query.nomor;
  // const  sessionId  = req.query.sessionId;
  try {
    const session = whatsappManager.getSession(sessionId);
    if (session) {
      const client = session.getClient();
      const pesan = "Antrianmu Segera Tiba. Segera Ke Lokasi Antrian";

      if(nomor.startsWith("0")){
        nomor = "62"+nomor.slice(1)+"@c.us";
      }else if(nomor.startsWith("62")){
        nomor = nomor+"@c.us";
      }else{
        nomor = "62"+nomor+"@c.us";
      }
      
      const user = await client.isRegisteredUser(nomor);
      if (user) {
        client.sendMessage(nomor, pesan);
        console.log(pesan);
        res.json({ status: "berhasil mengirim", pesan });
      }else{
        res.json({ status: "gagal mengirim", pesan: "User Tidak Terdaftar " });
      }
     
    } else {
      res.status(404).json({
        error: `WhatsApp session not found for session ${sessionId}`,
        status: "no session",
        session: sessionId,
      });
    }
  } catch (error) {
    res.status(404).json({
      error: `server error`,
      status: "no session",
      session: sessionId,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
