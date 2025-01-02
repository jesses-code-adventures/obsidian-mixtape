import { aggregateContents as aggregateContent, getCurrentFolderPath as getCurrentDir, getPathsAndContents } from 'utils';
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
	/** the html div that contains the entire plugin */
	private container: HTMLDivElement
	/** the raw content of the files that have been parsed from the filenames in the plugin's codeblock */
	private content: string
	/** the directory in which the plugin was loaded */
	private dir: string
	/** the player object that contains plugin functionality */
	private player: ObsidianMixtapePlayer
	/** user-modifiable settings for the app, currently not editable but intended to be */
	settings: ObsidianMixtapeSettings = DEFAULT_SETTINGS
	/** the content contained inside the codeblock where the plugin is being rendered */
	private source: string

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

	private async refresh() {
		const pathsAndContents = await getPathsAndContents(this.source, this.dir);
		this.content = aggregateContent(pathsAndContents);
		if (!this.content) {
			this.container.createDiv({ text: 'No audio files found in the provided paths' })
			return
		} else {
			this.player.setContent(this.content)
		}
		this.player.render();
	}

	/** renders the player if a codeblock is found with a matching tag to `this.settings.tracklistCodeblockLabel` */
	private async handleMarkdownProcessingOnLoad(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		this.container = el.createDiv({ cls: 'mixtape-wrapper' });
		this.dir = getCurrentDir(ctx)
		this.content = ''
		this.player = new ObsidianMixtapePlayer(this.app, this.container, this.content, this.dir);
		this.source = source
		await this.refresh()
	}
}
