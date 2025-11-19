import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { testNumber } from './actions.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const max = self.getVariableValue('OutletsCount') ? Number(self.getVariableValue('OutletsCount')) : 8

	self.setFeedbackDefinitions({
		OutletOn: {
			name: 'Outlet On',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Outlet',
					default: 1,
					min: 1,
					max,
				},
			],
			callback: async (feedback) => {
				const value = await self.parseVariablesInString(String(feedback.options.num))
				const outletNum = testNumber(self, value, max)

				if (outletNum !== null) {
					return self.getVariableValue(`OutletState_${outletNum - 1}`) === 'On'
				} else {
					return false
				}
			},
		},
		OutletOff: {
			name: 'Outlet Off',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'num',
					type: 'number',
					label: 'Outlet',
					default: 1,
					min: 1,
					max,
				},
			],
			callback: async (feedback) => {
				const value = await self.parseVariablesInString(String(feedback.options.num))
				const outletNum = testNumber(self, value, max)

				if (outletNum !== null) {
					return self.getVariableValue(`OutletState_${outletNum - 1}`) === 'Off'
				} else {
					return false
				}
			},
		},
	})
}
