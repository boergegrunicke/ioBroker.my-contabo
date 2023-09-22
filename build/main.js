"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
var import_querystring = __toESM(require("querystring"));
class MyContabo extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "my-contabo"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    const token = await this.getToken();
    this.log.info("huhu ...");
  }
  async getToken() {
    let reponse = "";
    await import_axios.default.post(
      "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
      import_querystring.default.stringify({
        grant_type: "password",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.apiUser,
        password: this.config.apiPassword
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    ).then(({ data }) => {
      const res = typeof data === "string" ? JSON.parse(data) : data;
      this.loadData(res.access_token);
      this.setState("info.connection", { val: true, ack: true });
      reponse = res.access_token;
    }).catch(function(error) {
      console.error(error);
      this.setState("info.connection", { val: false, ack: true });
      throw new Error("Failed to get token :  " + error.message);
    });
    return reponse;
  }
  loadData(token) {
    this.log.info("token : " + token);
  }
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new MyContabo(options);
} else {
  (() => new MyContabo())();
}
//# sourceMappingURL=main.js.map
