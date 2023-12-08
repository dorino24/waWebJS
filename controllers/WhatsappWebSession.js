const { Client, LocalAuth } = require("whatsapp-web.js");
qrTextMap = {};
class WhatsappWebSession {
  constructor(sessionId, qrGenerationCallback, readyInstanceCallback,disconnectedCallback) {
    this.sessionId = sessionId;
    this.client = new Client({
      puppeteer: {
        // headless: false,
        args: ['--no-sandbox'],
      },
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: "./session.json",
      }),
    });
    this.client.on("qr", (qr) => {
      // console.log("QR Code Received:", qr);
      qrTextMap[sessionId] = qr;
      qrGenerationCallback(qr, this.sessionId);
    });
    this.client.on('disconnected', (reason) => {
      console.log(`Sesi WhatsApp telah berakhir: ${reason}`);
      disconnectedCallback(this.sessionId);
    });

    this.client.on("ready", () => {
      const status = this.client.getState();
      readyInstanceCallback(sessionId, status);
    });
    try {
      this.client.initialize();
    } catch (error) {
      console.log(error);
    }
  }

  getQrText() {
    return qrTextMap;
  }
  getSessionId() {
    return this.sessionId;
  }
  getClient() {
    return this.client;
  }

  async destroy() {
    await this.client.destroy();
  }

  async restart() {
    await this.destroy();
    this.client = new Client();
    this.client.on("qr", (qr) => {
      this.qr = qr;
    });
    this.client.initialize();
  }
}

module.exports = WhatsappWebSession;
