import moment from 'moment';
import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface DailyCanvasSettings {
	folderPath: string;
}

const DEFAULT_SETTINGS: DailyCanvasSettings = {
	folderPath: ''
}

export default class DailyCanvas extends Plugin {
	settings: DailyCanvasSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('pen-tool', 'Daily Canvas', async () => {
			const { app, settings } = (this)
			const { workspace } = (app as any)
			
			let folderPath = settings.folderPath
			if (folderPath.endsWith('/') || folderPath.endsWith('\\')) {
				folderPath = folderPath.slice(0, -1);
			}
			if (!app.vault.getAbstractFileByPath(folderPath)) {
				await app.vault.createFolder(folderPath)
			}
			const title = folderPath + "/" + `${moment().format("YYYY-MM-DD")}.canvas`
			const files = app.vault.getFiles()
			for (const file of files) {
				if (file.path === title) {
					await workspace.activeLeaf.openFile(file)
					return
				}
			}

			const leaf = await workspace.getLeaf('tab')
				.setViewState({
					active: true,
				});

			await (this.app as any).commands.executeCommandById(
				"canvas:new-file"
			);

			setTimeout(async () => {
				const file = workspace.getActiveFile()
				await this.app.fileManager.renameFile(
					file as TFile, title)
			}, 150)
		});

		this.addSettingTab(new DailyCanvasSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = {
			...DEFAULT_SETTINGS, ...await this.loadData()
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class DailyCanvasSettingTab extends PluginSettingTab {
	constructor(app: App, public plugin: DailyCanvas) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Folder path')
			.setDesc('enter the folder path')
			.addText(text => text
				.setPlaceholder("Example: folder1/folder2")
				.setValue(this.plugin.settings.folderPath)
				.onChange(async (value) => {
					this.plugin.settings.folderPath = value;
					await this.plugin.saveSettings();
				}));
	}
}