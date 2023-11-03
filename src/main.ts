/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import axios from 'axios';
import { randomUUID } from 'crypto';
import querystring from 'querystring';
import { InstancesResponse } from './model/InstancesResponse';

const AUTH_URL = 'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token';
const BASE_URL = 'https://api.contabo.com/v1/';
const COMPUTE_URL = `${BASE_URL}compute/`;
const INSTANCES_URL = `${COMPUTE_URL}instances`;

// Load your modules here, e.g.:
// import * as fs from "fs";

class MyContabo extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'my-contabo',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here
		if (
			this.config.clientId.length === 0 ||
			this.config.clientSecret.length === 0 ||
			this.config.apiUser.length === 0 ||
			this.config.apiPassword.length === 0
		) {
			this.log.error('login credentials not configured');
		} else {
			const token = await this.getToken(AUTH_URL);
			this.setState('info.connection', { val: true, ack: true });
			if (token.length !== 0) {
				this.loadData(token);
			} else {
				this.log.error('failed to get token from api');
			}
			this.subscribeStates('*.displayName');
		}
	}

	private async getToken(authUrl: string): Promise<string> {
		let reponse = '';
		await axios
			.post(
				authUrl,
				querystring.stringify({
					grant_type: 'password',
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					username: this.config.apiUser,
					password: this.config.apiPassword,
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			)
			.then(({ data }: { data: string }) => {
				const res = typeof data === 'string' ? JSON.parse(data) : data;
				this.loadData(res.access_token);
				this.setState('info.connection', { val: true, ack: true });
				reponse = res.access_token;
			})
			.catch((error: any) => {
				console.error(error); // ...
				this.setState('info.connection', { val: false, ack: true });
				throw new Error('Failed to get token :  ' + error.message);
			});
		return reponse;
	}

	private loadData(token: string): void {
		// this.log.info('token : ' + token);
		this.loadInstances(token);
	}

	private async loadInstances(token: string): Promise<void> {
		await axios
			.get<InstancesResponse>(INSTANCES_URL, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
					'x-request-id': randomUUID(),
				},
			})
			.then((response) => {
				// ...
				this.log.info(JSON.stringify(response.data));
				this.createGeneralStates();
				this.setState('general.instancesCount', response.data._pagination.totalElements);
				response.data.data.forEach((instance) => {
					this.setObjectNotExists(`${instance.name}.instanceId`, {
						type: 'state',
						common: {
							name: 'Instance ID',
							type: 'number',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.instanceId`, { val: instance.instanceId, ack: true });
					this.setObjectNotExists(`${instance.name}.displayName`, {
						type: 'state',
						common: {
							name: 'display name',
							type: 'string',
							role: 'indicator',
							read: true,
							write: true,
						},
						native: {},
					});
					this.setState(`${instance.name}.displayName`, { val: instance.displayName, ack: true });
					this.setObjectNotExists(`${instance.name}.cpuCores`, {
						type: 'state',
						common: {
							name: 'Number of CPU cores',
							type: 'number',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.cpuCores`, { val: instance.cpuCores, ack: true });
					this.setObjectNotExists(`${instance.name}.ramMb`, {
						type: 'state',
						common: {
							name: 'amount of RAM',
							type: 'number',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.ramMb`, { val: instance.ramMb, ack: true });
					this.setObjectNotExists(`${instance.name}.diskMb`, {
						type: 'state',
						common: {
							name: 'amount of disk space',
							type: 'number',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.diskMb`, { val: instance.diskMb, ack: true });
					this.setObjectNotExists(`${instance.name}.status`, {
						type: 'state',
						common: {
							name: 'operating status',
							type: 'string',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.status`, { val: instance.status, ack: true });
					this.setObjectNotExists(`${instance.name}.region`, {
						type: 'state',
						common: {
							name: 'operating status',
							type: 'string',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.region`, { val: instance.region, ack: true });
					this.setObjectNotExists(`${instance.name}.ipV4`, {
						type: 'state',
						common: {
							name: 'IPv4',
							type: 'string',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.ipV4`, { val: instance.ipConfig.v4.ip, ack: true });
					this.setObjectNotExists(`${instance.name}.ipV6`, {
						type: 'state',
						common: {
							name: 'IPv6',
							type: 'string',
							role: 'indicator',
							read: true,
							write: false,
						},
						native: {},
					});
					this.setState(`${instance.name}.ipV6`, { val: instance.ipConfig.v6.ip, ack: true });
				});
			})
			.catch((error: any) => {
				this.log.error('error : ' + error);
			});
	}

	private createGeneralStates(): void {
		this.setObjectNotExists('general.instancesCount', {
			type: 'state',
			common: {
				name: 'Number of instances',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
	}

	private async patchDisplayName(key: string, value: string): Promise<void> {
		this.log.info('patch ' + key + ' to ' + value);
		const token = await this.getToken(AUTH_URL);
		axios
			.patch(
				`${INSTANCES_URL}/${key}`,
				{
					displayName: value,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
						'x-request-id': randomUUID(),
					},
				},
			)
			.then((response) => {
				if (response.status == 200) {
					this.log.info('patch name sucessful');
				} else {
					this.log.info('patch name failed : ' + response.status);
				}
			})
			.catch((error) => {
				this.log.error('failed : ' + error.message);
			});
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			if (!state.ack && state.val) {
				const ident = id.split(/\./)[2];
				this.log.info('ident : ' + ident);
				this.patchDisplayName(ident, state.val.toString());
			}
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new MyContabo(options);
} else {
	// otherwise start the instance directly
	(() => new MyContabo())();
}
