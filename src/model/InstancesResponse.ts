import { Instance } from './Instance';
import { Links } from './Links';
import { Pagination } from './Pagination';

export interface InstancesResponse {
	_pagination: Pagination;
	_links: Links;
	data: Array<Instance>;
}
