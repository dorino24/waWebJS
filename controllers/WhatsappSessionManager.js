const WhatsappWebSession = require("./WhatsappWebSession");

class WhatsappSessionManager {
  constructor() {
    this.sessions = {};
  }

  createSession(sessionId, qrGenerationCallback, readyInstanceCallback,disconnectedCallback) {
    const session = new WhatsappWebSession(sessionId, qrGenerationCallback, readyInstanceCallback,disconnectedCallback);
    this.sessions[sessionId] = session;
    return session;
  }

  getSession(sessionId) {
    return this.sessions[sessionId];
  }
  getSessionAll(){
    return this.sessions;
  }
  closeSession(sessionId) {
    if (this.sessions[sessionId]) {
      const qrText = this.sessions[sessionId].getQrText();
      delete qrText[sessionId];
      this.sessions[sessionId].restart();
      delete this.sessions[sessionId];
      console.log("disini");
    }
  }
}

module.exports = WhatsappSessionManager;
