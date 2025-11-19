import { Job, scheduleJob } from 'node-schedule'
import { ModuleInstance } from './main.js'

let job: Job | null = null

export const createScheduledJob = async (self: ModuleInstance): Promise<void> => {
	if (!job) {
		const runJob = async (): Promise<void> => {
			const client = self.getClient()
			if (client) {
				const outletCount = (await client.getOutletsCount()) || 0

				const payload = {
					Name: (await client.getName()) || null,
					HardwareRevision: (await client.getHardwareRevision()) || null,
					FirmwareRevision: (await client.getFirmwareRevision()) || null,
					DayOfManufacture: (await client.getDayOfManufacture()) || null,
					ModelNumber: (await client.getModelNumber()) || null,
					SerialNumber: (await client.getSerialNumber()) || null,
					Description: (await client.getDescription()) || null,
					Uptime: (await client.getUptime()) || 0,
					PowerDraw: (await client.getPowerDraw()) || 0,
					OutletsCount: outletCount,
					LastUpdate: new Date().toISOString(),
				}

				self.setVariableValues(payload)

				const outletNames = (await client.getOutletsNames()) || null
				const outletStates = (await client.getOutletsStates()) || null
				for (let i = 0; i < outletCount; i++) {
					self.setVariableValues({
						[`OutletName_${i}`]: outletNames[i + 1],
						[`OutletState_${i}`]: outletStates[i + 1] == 1 ? 'On' : 'Off',
					})
				}

				self.log('debug', 'Successfully updated pdu variables.')
			}
		}

		job = scheduleJob('*/5 * * * *', runJob)

		// einmalig sofort ausführen
		runJob().catch((err) => self.log('error', 'Immediate scheduled job error:' + JSON.stringify(err)))
	}
}

export const stopScheduler = (self: ModuleInstance): void => {
	if (job) {
		job.cancel()
		job = null
		self.log('debug', 'Scheduler stopped.')
	}
}
