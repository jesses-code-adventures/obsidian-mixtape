import { aggregateContents, getCurrentFolderPath, getPathsAndContents } from 'utils';
import { Plugin, MarkdownPostProcessorContext } from 'obsidian';
import ObsidianMixtapePlayer from 'player';

interface ObsidianMixtapeSettings {
	defaultSongsFile: string
	tracklistCodeblockLabel: string
}

const DEFAULT_SETTINGS: ObsidianMixtapeSettings = {
	defaultSongsFile: "_PROJECT.md",
	tracklistCodeblockLabel: "mixtape",
}

export default class ObsidianMixtape extends Plugin {
	settings: ObsidianMixtapeSettings = DEFAULT_SETTINGS

	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			this.settings.tracklistCodeblockLabel,
			this.handleMarkdownProcessingOnLoad.bind(this)
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/** renders the player if a codeblock is found with a matching tag to `this.settings.tracklistCodeblockLabel` */
	private async handleMarkdownProcessingOnLoad(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		const wrapper = el.createDiv({ cls: 'mixtape-wrapper' });
		const currentDir = getCurrentFolderPath(ctx)
		const pathsAndContents = await getPathsAndContents(source, currentDir);
		const contents = aggregateContents(pathsAndContents);
		if (!contents) {
			wrapper.createDiv({ text: 'No audio files found in the provided paths' })
			return
		}
		const player = new ObsidianMixtapePlayer(this.app, wrapper, contents, currentDir);
		player.render();
	}
}
