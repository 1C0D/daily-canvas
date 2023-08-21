import moment from 'moment';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile, WorkspaceLeaf, WorkspaceSidedock, normalizePath } from 'obsidian';
import { unlink } from 'fs/promises'
import { basename } from "path";
// Remember to rename these classes and interfaces!

interface DailyCanvasSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: DailyCanvasSettings = {
	mySetting: 'default'
}

export default class DailyCanvas extends Plugin {
	settings: DailyCanvasSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('pen-tool', 'Daily Canvas', async () => {
			const { workspace } = (this.app as any)
			// add new active tab
			const title = `${moment().format("YYYY-MM-DD")}.canvas`
			const files = this.app.vault.getFiles()
			for (const file of files) {
				if (file.name === title) {
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

			const path = "tutu.canvas"
			setTimeout(async () => {
				const file = workspace.getActiveFile()
				await this.app.fileManager.renameFile(
					file as TFile, title)


				// const fullPath = normalizePath(await (this.app as any).vault.adapter.getFullPath(file.path))
				// // const oldPath = workspace.activeLeaf.view.file.path
				// workspace.activeLeaf.view.file.path = path
				// workspace.activeLeaf.detach()
				// await this.app.fileManager.renameFile(
				// 	file as TFile, `tutu.canvas`)
				// this.deleteFile(fullPath)
				// const leaf = await workspace.getLeaf('tab')
				// 	.setViewState({
				// 		active: true,
				// 	});

				// const newPath = normalizePath(fullPath.replace(basename(fullPath), path))
				// console.log("newPath", newPath)
				// setTimeout(async () => {
				// 	const newFile = this.app.vault.getAbstractFileByPath(
				// 		newPath)
				// 	console.log("newFile", newFile)
				// },300)
				// // await leaf.openFile(newFile)
				// window.location.reload()

			}, 150)


			// console.log("file", file)
			// this.app.fileManager.renameFile(
			// 	file as TAbstractFile, `${moment().format("YYYY-MM-DD")}.canvas`)

			// if (file?.path)
			// 	setTimeout(async () => (await this.app.fileManager.renameFile(
			// 		leaf?.view?.file as TFile, `tutu.canvas`)), 400)
		});

		this.addSettingTab(new DailyCanvasSettingTab(this.app, this));
	}

	async deleteFile(filePathToDelete: string) {
		{
			if (filePathToDelete) unlink(filePathToDelete)
		};
	}

	getLeaves = (title: string): WorkspaceLeaf[] => {
		const { workspace } = this.app
		const leavesList: WorkspaceLeaf[] = [];

		workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
			console.log("title", title)
			console.log("leaf", leaf.getViewState())
			console.log("this.getPath(leaf)", this.getPath(leaf))
			if (this.getPath(leaf) && this.getPath(leaf) === title) {
				return []
			}
		});
		return leavesList;
	}

	getPath(leaf: WorkspaceLeaf | null | undefined) {
		return leaf?.getViewState().state.file.path || ""
	}

	absolutePath(file: string) {
		const vaultName = this.app.vault.getName();
		return (
			"obsidian://open?vault=" +
			encodeURIComponent(vaultName) +
			String.raw`&file=` +
			encodeURIComponent(file)
		);
	}

	getFileFromVault(path: string) {
		this.app.vault.getAbstractFileByPath(
			normalizePath(path)
		)
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
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}



// setTimeout(async () => {
// 	const oldState = workspace.getLeaf(false).getViewState()
// 	await workspace.activeLeaf.setViewState({
// 		...oldState,
// 		state: {
// 			...oldState.state,
// 			file: path
// 		}
// 	});
// 	const newState = await workspace.activeLeaf.getViewState()
// 	console.log("newState", newState)

// }, 500)