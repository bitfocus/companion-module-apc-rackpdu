import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	timeout: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Rack PDU IP or DNS',
			width: 4,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Rack PDU Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 161,
		},
		{
			type: 'number',
			id: 'timeout',
			label: 'Rack PDU Connection Timeout',
			width: 4,
			min: 1,
			max: 65535,
			default: 30000,
		},
	]
}
