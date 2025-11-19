import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { createScheduledJob, stopScheduler } from './scheduler.js'
import { RackPDU } from 'rackpdu'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	client: RackPDU | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.BadConfig)

		this.updateActions()
		this.updateFeedbacks()

		await this.tryConnectPDU()
	}

	async tryConnectPDU(): Promise<void> {
		if (
			Object.prototype.hasOwnProperty.call(this.config, 'host') &&
			Object.prototype.hasOwnProperty.call(this.config, 'port') &&
			Object.prototype.hasOwnProperty.call(this.config, 'timeout')
		) {
			await this.connectPDU()
		} else {
			this.log('debug', 'missing config properties, skipping connectPDU')
		}
	}

	async connectPDU(): Promise<void> {
		if (this.config.host !== null && this.config.host.length > 0 && this.config.port > 0) {
			this.updateStatus(InstanceStatus.Connecting)

			this.log('debug', `Attempting to connect to PDU at ${this.config.host}:${this.config.port}`)

			this.client = new RackPDU(this.config.host + ':' + this.config.port, {
				timeout: this.config.timeout,
			})

			if (await this.client.isAlive()) {
				this.log('debug', 'Successfully connected to PDU.')

				this.updateStatus(InstanceStatus.Ok)
				await createScheduledJob(this)
				await this.updateVariableDefinitions()
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('error', 'Failed to connect to PDU: No response from device.')
			}
		} else {
			this.log('error', 'Invalid configuration: Host and Port must be set correctly.')
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		stopScheduler(this)

		if (this.client) {
			await this.client.close()
			this.log('debug', 'Connection to PDU closed.')
		}

		this.log('info', 'Module instance destroyed.')
	}

	getClient(): RackPDU | null {
		return this.client
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		await this.tryConnectPDU()

		this.log('info', 'Config updated')
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	async updateVariableDefinitions(): Promise<void> {
		await UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
