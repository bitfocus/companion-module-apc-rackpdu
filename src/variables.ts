import type { ModuleInstance } from './main.js'

export async function UpdateVariableDefinitions(self: ModuleInstance): Promise<void> {
	if (self.getClient()) {
		const variables = [
			{ variableId: 'Name', name: 'Name' },
			{ variableId: 'HardwareRevision', name: 'HardwareRevision' },
			{ variableId: 'FirmwareRevision', name: 'FirmwareRevision' },
			{ variableId: 'DayOfManufacture', name: 'DayOfManufacture' },
			{ variableId: 'ModelNumber', name: 'ModelNumber' },
			{ variableId: 'SerialNumber', name: 'SerialNumber' },
			{ variableId: 'Description', name: 'Description' },
			{ variableId: 'Uptime', name: 'Uptime' },
			{ variableId: 'PowerDraw', name: 'PowerDraw' },
			{ variableId: 'OutletsCount', name: 'OutletsCount' },
			{ variableId: 'LastUpdate', name: 'LastUpdate' },
		]

		const outletCounts = (await self.getClient()?.getOutletsCount()) || 0
		for (let i = 0; i < outletCounts; i++) {
			variables.push({ variableId: `OutletName_${i}`, name: `OutletName_${i}` })
			variables.push({ variableId: `OutletState_${i}`, name: `OutletState_${i}` })
		}

		self.setVariableDefinitions(variables)

		self.log('debug', 'Variable definitions updated.')
	}
}
