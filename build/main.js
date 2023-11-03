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
var import_crypto = require("crypto");
var import_querystring = __toESM(require("querystring"));
const AUTH_URL = "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token";
const BASE_URL = "https://api.contabo.com/v1/";
const COMPUTE_URL = `${BASE_URL}compute/`;
const INSTANCES_URL = `${COMPUTE_URL}instances`;
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
    if (this.config.clientId.length === 0 || this.config.clientSecret.length === 0 || this.config.apiUser.length === 0 || this.config.apiPassword.length === 0) {
      this.log.error("login credentials not configured");
    } else {
      const token = await this.getToken(AUTH_URL);
      this.setState("info.connection", { val: true, ack: true });
      if (token.length !== 0) {
        this.loadData(token);
      } else {
        this.log.error("failed to get token from api");
      }
      this.subscribeStates("*.displayName");
    }
  }
  async getToken(authUrl) {
    let reponse = "";
    await import_axios.default.post(
      authUrl,
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
    }).catch((error) => {
      console.error(error);
      this.setState("info.connection", { val: false, ack: true });
      throw new Error("Failed to get token :  " + error.message);
    });
    return reponse;
  }
  loadData(token) {
    this.loadInstances(token);
  }
  async loadInstances(token) {
    await import_axios.default.get(INSTANCES_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-request-id": (0, import_crypto.randomUUID)()
      }
    }).then((response) => {
      this.log.info(JSON.stringify(response.data));
      this.createGeneralStates();
      this.setState("general.instancesCount", response.data._pagination.totalElements);
      response.data.data.forEach((instance) => {
        this.setObjectNotExists(`${instance.name}.instanceId`, {
          type: "state",
          common: {
            name: "Instance ID",
            type: "number",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.instanceId`, { val: instance.instanceId, ack: true });
        this.setObjectNotExists(`${instance.name}.displayName`, {
          type: "state",
          common: {
            name: "display name",
            type: "string",
            role: "indicator",
            read: true,
            write: true
          },
          native: {}
        });
        this.setState(`${instance.name}.displayName`, { val: instance.displayName, ack: true });
        this.setObjectNotExists(`${instance.name}.cpuCores`, {
          type: "state",
          common: {
            name: "Number of CPU cores",
            type: "number",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.cpuCores`, { val: instance.cpuCores, ack: true });
        this.setObjectNotExists(`${instance.name}.ramMb`, {
          type: "state",
          common: {
            name: "amount of RAM",
            type: "number",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.ramMb`, { val: instance.ramMb, ack: true });
        this.setObjectNotExists(`${instance.name}.diskMb`, {
          type: "state",
          common: {
            name: "amount of disk space",
            type: "number",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.diskMb`, { val: instance.diskMb, ack: true });
        this.setObjectNotExists(`${instance.name}.status`, {
          type: "state",
          common: {
            name: "operating status",
            type: "string",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.status`, { val: instance.status, ack: true });
        this.setObjectNotExists(`${instance.name}.region`, {
          type: "state",
          common: {
            name: "operating status",
            type: "string",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.region`, { val: instance.region, ack: true });
        this.setObjectNotExists(`${instance.name}.ipV4`, {
          type: "state",
          common: {
            name: "IPv4",
            type: "string",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.ipV4`, { val: instance.ipConfig.v4.ip, ack: true });
        this.setObjectNotExists(`${instance.name}.ipV6`, {
          type: "state",
          common: {
            name: "IPv6",
            type: "string",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        });
        this.setState(`${instance.name}.ipV6`, { val: instance.ipConfig.v6.ip, ack: true });
      });
    }).catch((error) => {
      this.log.error("error : " + error);
    });
  }
  createGeneralStates() {
    this.setObjectNotExists("general.instancesCount", {
      type: "state",
      common: {
        name: "Number of instances",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
  }
  async patchDisplayName(key, value) {
    this.log.info("patch " + key + " to " + value);
    const token = await this.getToken(AUTH_URL);
    import_axios.default.patch(
      `${INSTANCES_URL}/${key}`,
      {
        displayName: value
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-request-id": (0, import_crypto.randomUUID)()
        }
      }
    ).then((response) => {
      if (response.status == 200) {
        this.log.info("patch name sucessful");
      } else {
        this.log.info("patch name failed : " + response.status);
      }
    }).catch((error) => {
      this.log.error("failed : " + error.message);
    });
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
      if (!state.ack && state.val) {
        const ident = id.split(/\./)[2];
        this.log.info("ident : " + ident);
        this.patchDisplayName(ident, state.val.toString());
      }
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
