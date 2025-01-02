import ObsidianMixtapeControls from 'controls';
import { getCurrentFolderPath, getPathsAndContents, isAudioLink } from 'utils';
import { Plugin, TFile, MarkdownPostProcessorContext, normalizePath } from 'obsidian';

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

	private handleGetResource(currentFolderPath: string, linkPath: string) {
		if (linkPath.startsWith('./')) {
			linkPath = linkPath.substring(2);
			linkPath = `${currentFolderPath}/${linkPath}`;
		}
		linkPath = decodeURIComponent(linkPath);
		linkPath = normalizePath(linkPath);

		let resourcePath = linkPath;
		const file = this.app.vault.getAbstractFileByPath(linkPath);
		if (file instanceof TFile) {
			resourcePath = this.app.vault.getResourcePath(file);
		}
		return resourcePath
	}

	/** renders the player inside the provided parent element */
	private renderPlayer(
		parent: HTMLDivElement,
		content: string,
		currentFolderPath: string
	) {
		const playerContainer = parent.createDiv({ cls: 'mixtape-audio-links' });
		const playbackBarContainer = playerContainer.createDiv({
			cls: 'mixtape-playback-bar-container',
		});
		const progressBar = playbackBarContainer.createEl('input', {
			cls: 'mixtape-progress-bar',
			type: 'range',
			value: '0',
		});

		const audioElements: HTMLAudioElement[] = [];
		let selectedTrackIdx = -1;
		const playerControls = new ObsidianMixtapeControls(playerContainer, audioElements, selectedTrackIdx);

		// Regex patterns for standard [title](url) links and wiki [[file]] links
		const mdLinkRegex = /\[([^\]]*?)\]\(([^)]+)\)/g;
		const wikiLinkRegex = /!?\[\[([^\]]+)\]\]/g;

		for (const match of content.matchAll(mdLinkRegex)) {
			const linkText = match[1];
			const linkPath = match[2];
			if (isAudioLink(linkPath)) {
				appendTrackToPlayer(linkText, linkPath, this.handleGetResource.bind(this));
			}
		}

		for (const match of content.matchAll(wikiLinkRegex)) {
			const linkText = match[1];
			const [actualPath] = linkText.split('|');
			if (isAudioLink(actualPath)) {
				appendTrackToPlayer(actualPath, actualPath, this.handleGetResource.bind(this));
			}
		}

		if (audioElements.length === 0) return;

		progressBar.addEventListener('input', () => {
			const audio = audioElements[selectedTrackIdx];
			const fraction = Number(progressBar.value) / 100;
			if (audio.duration && !Number.isNaN(audio.duration)) {
				audio.currentTime = fraction * audio.duration;
			}
		});

		function appendTrackToPlayer(linkText: string, linkPath: string, getResourcePathFunc: (currentFolderPath: string, linkPath: string) => string) {
			const resourcePath = getResourcePathFunc(currentFolderPath, linkPath);
			playerContainer.createDiv({ text: linkText || linkPath });
			const audioEl = playerContainer.createEl('audio', {
				attr: { src: resourcePath, controls: '' },
			});
			audioEl.addClass('mixtape-audio');
			audioEl.setText(linkText);

			audioEl.addEventListener('play', () => {
				audioElements.forEach((ae) => {
					if (ae !== audioEl && !ae.paused) {
						ae.pause();
					}
				});
				const newIndex = audioElements.indexOf(audioEl);
				if (newIndex !== selectedTrackIdx) {
					if (selectedTrackIdx >= 0) {
						audioElements[selectedTrackIdx].currentTime = 0;
					}
					selectedTrackIdx = newIndex;
					audioElements[selectedTrackIdx].currentTime = 0;
				}
			});

			audioEl.addEventListener('pause', () => {
				if (audioEl === audioElements[selectedTrackIdx]) {
					playerControls.updatePlayPauseText()
				}
			});

			audioEl.addEventListener('timeupdate', () => {
				if (audioEl === audioElements[selectedTrackIdx]) {
					const duration = audioEl.duration || 0;
					const current = audioEl.currentTime || 0;
					if (duration > 0) {
						const fraction = (current / duration) * 100;
						progressBar.value = fraction.toFixed(2);
					} else {
						progressBar.value = '0';
					}
				}
			});

			audioEl.addEventListener('loadedmetadata', () => {
				if (audioEl === audioElements[selectedTrackIdx]) {
					progressBar.value = '0';
				}
			});

			audioEl.addEventListener('ended', () => {
				playerControls.goToNext();
			});

			audioElements.push(audioEl);
			return audioElements;
		}
	}
	
	/** renders the player if a ```mixtape``` codeblock is found */
	private async handleMarkdownProcessingOnLoad(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		const wrapper = el.createDiv({ cls: 'mixtape-wrapper' });
		const currentFolderPath = getCurrentFolderPath(ctx)
		const pathsAndContents = await getPathsAndContents(source, currentFolderPath);
		const paths = pathsAndContents.paths
		const contents = pathsAndContents.contents
		let allContents = '';
		paths.forEach((rawPath, i) => {
			if (!rawPath.endsWith('.md')) {
				return
			}
			const content = contents[i];
			if (content == null) {
				return;
			}
			if (typeof content !== 'string') {
				throw new Error('Expected markdown file to have string contents')
			}
			allContents += content
		});
		if (!allContents) {
			wrapper.createDiv({ text: 'No audio files found in the provided paths' })
			return
		}
		this.renderPlayer(wrapper, allContents, currentFolderPath);
	}

	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			'mixtape',
			this.handleMarkdownProcessingOnLoad.bind(this)
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleSettingTab extends PluginSettingTab {
// 	plugin: ObsidianMixtape;
//
// 	constructor(app: App, plugin: ObsidianMixtape) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}
//
// 	display(): void {
// 		const { containerEl } = this;
//
// 		containerEl.empty();
//
// 		new Setting(containerEl)
// 			.setName('Source File Name')
// 			.setDesc("A special file name you'll use for files that contain your tracks. Defaults to `_PROJECT.md`.")
// 			.addText(text => text
// 				.setPlaceholder('_PROJECT.md')
// 				.setValue(this.plugin.settings.sourceFileName)
// 				.onChange(async (value) => {
// 					this.plugin.settings.sourceFileName = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }
