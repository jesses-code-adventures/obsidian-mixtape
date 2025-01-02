import { PluginSettingTab, App, Setting } from 'obsidian';
import Mixtape from 'mixtape';

export interface Settings {
	defaultSongsFile: string
	codeblockLabel: string
}

export const DEFAULT_SETTINGS: Settings = {
	defaultSongsFile: "_PROJECT.md",
	codeblockLabel: "mixtape",
}

export class SettingsTab extends PluginSettingTab {
	plugin: Mixtape;

	constructor(app: App, plugin: Mixtape) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Mixtape' });

		new Setting(containerEl)
			.setName('Default Tracks Filename')
			.setDesc('Searches for this file in the current directory and scrapes audio files from it into the mixtape player, if found.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.defaultSongsFile)
					.onChange(async (value) => {
						this.plugin.settings.defaultSongsFile = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Player Codeblock Label')
			.setDesc('We inject the mixtape player into the codeblock with this label.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.codeblockLabel)
					.onChange(async (value) => {
						this.plugin.settings.codeblockLabel = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

