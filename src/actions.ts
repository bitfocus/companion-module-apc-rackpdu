import type { ModuleInstance } from './main.js'
import { OutletCommand } from 'rackpdu'

const executePDUAction = async (self: ModuleInstance, command: OutletCommand, outletNum: number): Promise<void> => {
	self.log('debug', `Executing command ${OutletCommand[command]} on outlet ${outletNum}`)
	const client = self.getClient()
	if (!client) return

	await client.runOutletsCommand(command, [outletNum])

	self.setVariableValues({
		[`OutletState_${outletNum - 1}`]: (await client.getOutletState(outletNum)) == 1 ? 'On' : 'Off',
	})

	self.checkFeedbacks('OutletOn', 'OutletOff')
}

export const testNumber = (self: ModuleInstance, value: string, max: number): number | null => {
	if (!/^\d+$/.test(value)) {
		self.log('error', `Invalid number: ${value}`)
		return null
	}

	if (Number(value) > 0 && Number(value) <= max) {
		self.log('error', `Invalid outlet number: ${value}`)

		return Number(value)
	} else {
		return null
	}
}

export function UpdateActions(self: ModuleInstance): void {
	const max = self.getVariableValue('OutletsCount') ? Number(self.getVariableValue('OutletsCount')) : 8

	self.setActionDefinitions({
		switchOutletOff: {
			name: 'Switch Outlet Off',
			options: [
				{
					id: 'num',
					type: 'textinput',
					useVariables: true,
					label: 'Outlet Number',
				},
			],
			callback: async (event) => {
				const value = await self.parseVariablesInString(String(event.options.num))
				const outletNum = testNumber(self, value, max)

				if (outletNum !== null) {
					await executePDUAction(self, OutletCommand.ImmediateOff, outletNum)
				}
			},
		},
		toggleOutlet: {
			name: 'Toggle Outlet State immediately',
			options: [
				{
					id: 'num',
					type: 'textinput',
					useVariables: true,
					label: 'Outlet Number',
				},
			],
			callback: async (event) => {
				const value = await self.parseVariablesInString(String(event.options.num))
				const outletNum = testNumber(self, value, max)

				if (outletNum !== null) {
					if (self.getVariableValue('OutletState_' + (outletNum - 1)) == 'On') {
						await executePDUAction(self, OutletCommand.ImmediateOff, outletNum)
					} else {
						await executePDUAction(self, OutletCommand.ImmediateOn, outletNum)
					}
				}
			},
		},
		switchOutletOn: {
			name: 'Switch Outlet On',
			options: [
				{
					id: 'num',
					type: 'textinput',
					useVariables: true,
					label: 'Outlet Number',
				},
			],
			callback: async (event) => {
				const value = await self.parseVariablesInString(String(event.options.num))
				const outletNum = testNumber(self, value, max)

				if (outletNum !== null) {
					await executePDUAction(self, OutletCommand.ImmediateOn, outletNum)
				}
			},
		},
		rebootOutlet: {
			name: 'Reboot Outlet',
			options: [
				{
					id: 'num',
					type: 'textinput',
					useVariables: true,
					label: 'Outlet Number',
				},
			],
			callback: async (event) => {
				const value = await self.parseVariablesInString(String(event.options.num))

				if (!/^\d+$/.test(value)) {
					return
				}

				if (Number(value) > 0 && Number(value) <= max) {
					await executePDUAction(self, OutletCommand.ImmediateReboot, Number(value))
				}
			},
		},
		genericExecutor: {
			name: 'Generic Action',
			options: [
				{
					id: 'action',
					type: 'dropdown',
					label: 'Select Action',
					choices: [
						{ id: 'ImmediateOn', label: 'ImmediateOn' },
						{ id: 'ImmediateOff', label: 'ImmediateOff' },
						{ id: 'ImmediateReboot', label: 'ImmediateReboot' },
						{ id: 'DelayedOn', label: 'DelayedOn' },
						{ id: 'DelayedOff', label: 'DelayedOff' },
						{ id: 'DelayedReboot', label: 'DelayedReboot' },
						{ id: 'CancelPendingCommand', label: 'CancelPendingCommand' },
					],
					default: 'ImmediateOn',
				},
				{
					id: 'num',
					type: 'textinput',
					useVariables: true,
					label: 'Outlet Number',
				},
			],
			callback: async (event) => {
				const value = await self.parseVariablesInString(String(event.options.num))
				const action = event.options.action as keyof typeof OutletCommand
				const outletNum = testNumber(self, value, max)

				if (outletNum !== null) {
					let actionCommand = null

					switch (action) {
						case 'ImmediateOn':
							actionCommand = OutletCommand.ImmediateOn
							break
						case 'ImmediateOff':
							actionCommand = OutletCommand.ImmediateOff
							break
						case 'ImmediateReboot':
							actionCommand = OutletCommand.ImmediateReboot
							break
						case 'DelayedOn':
							actionCommand = OutletCommand.DelayedOn
							break
						case 'DelayedOff':
							actionCommand = OutletCommand.DelayedOff
							break
						case 'DelayedReboot':
							actionCommand = OutletCommand.DelayedReboot
							break
						case 'CancelPendingCommand':
							actionCommand = OutletCommand.CancelPendingCommand
							break
					}

					if (actionCommand) {
						await executePDUAction(self, actionCommand, outletNum)
					}
				}
			},
		},
	})
}
