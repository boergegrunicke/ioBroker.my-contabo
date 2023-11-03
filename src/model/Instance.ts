import { IpConfig } from './IpConfig';

export interface Instance {
	name: string;
	displayName: string;
	instanceId: number;
	dataCenter: string;
	region: string;
	regionName: string;
	productId: string;
	ipConfig: {
		v4: IpConfig;
		v6: IpConfig;
	};
	macAddress: string;
	ramMb: number;
	cpuCores: number;
	osType: string;
	diskMb: number;
	createdDate: string;
	status: string;
	vHostId: string;
	productType: string;
	defaultUser: string;
}
