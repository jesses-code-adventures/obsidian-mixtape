import { Plugin, TFile, MarkdownPostProcessorContext, normalizePath } from 'obsidian';

interface ObsidianMixtapeSettings { }

const DEFAULT_SETTINGS: ObsidianMixtapeSettings = {}

function getCurrentFolderPath(ctx: MarkdownPostProcessorContext) {
	const currentFilePath = ctx.sourcePath;
	const folderParts = currentFilePath.split('/');
	folderParts.pop(); // remove the filename
	return folderParts.join('/');
}

async function getPathsAndContents(source: string, currentFolderPath: string) {
	const filePaths = source
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	const fileContents = await Promise.all(
		filePaths.map(async (rawPath) => {
			let pathToLoad: string;
			if (!rawPath.includes('/')) {
				pathToLoad = `${currentFolderPath}/${rawPath}`;
			} else {
				pathToLoad = rawPath;
			}

			const absFile = this.app.vault.getAbstractFileByPath(pathToLoad);
			if (absFile instanceof TFile) {
				return await this.app.vault.read(absFile);
			}

			return null;
		})
	);
	return [filePaths, fileContents]
}

export default class ObsidianMixtape extends Plugin {
	settings: ObsidianMixtapeSettings = DEFAULT_SETTINGS
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			'mixtape',
			async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				const wrapper = el.createDiv({ cls: 'mixtape-wrapper' });
				const currentFolderPath = getCurrentFolderPath(ctx)
				const [filePaths, fileContents] = await getPathsAndContents(source, currentFolderPath);
				filePaths.forEach((rawPath, i) => {
					const content = fileContents[i];
					if (content == null) {
						wrapper.createDiv({ text: `File not found: ${rawPath}` });
						return;
					}

					if (rawPath.endsWith('.md')) {
						this.asAudioElements(wrapper, content, currentFolderPath)
					}
				});
			}
		);
	}

	asAudioElements(
		wrapper: HTMLDivElement,
		content: string,
		currentFolderPath: string
	) {
		const audioContainer = wrapper.createDiv({ cls: 'mixtape-audio-links' });

		const playbackBarContainer = audioContainer.createDiv({
			cls: 'mixtape-playback-bar-container',
		});
		const progressBar = playbackBarContainer.createEl('input', {
			type: 'range',
			value: '0',
		});
		progressBar.addClass('mixtape-progress-bar');

		const nowPlayingEl = audioContainer.createDiv({ cls: 'mixtape-now-playing' });
		nowPlayingEl.setText('Nothing playing yet');

		const mixtapeControlsContainer = audioContainer.createDiv({
			cls: 'mixtape-controls-container',
		});
		const controlBar = mixtapeControlsContainer.createDiv({
			cls: 'mixtape-controls',
		});

		const btnPrev = controlBar.createEl('button', { text: 'Prev' });
		const btnPlayPause = controlBar.createEl('button', { text: 'Play' });
		const btnNext = controlBar.createEl('button', { text: 'Next' });

		const audioElements: HTMLAudioElement[] = [];
		let currentIndex = 0;

		const updatePlayPauseText = () => {
			const currentAudio = audioElements[currentIndex];
			if (currentAudio && !currentAudio.paused) {
				btnPlayPause.setText('Pause');
			} else {
				btnPlayPause.setText('Play');
			}
		};

		const audioExtensions = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
		const isAudioLink = (link: string): boolean => {
			const lower = link.toLowerCase();
			return audioExtensions.some((ext) => lower.endsWith('.' + ext));
		};

		const createAudioElement = (linkText: string, linkPath: string) => {
			if (linkPath.startsWith('./')) {
				linkPath = linkPath.substring(2);
				linkPath = `${currentFolderPath}/${linkPath}`;
			}
			linkPath = decodeURIComponent(linkPath);
			linkPath = normalizePath(linkPath);

			let finalSrc = linkPath;
			const file = this.app.vault.getAbstractFileByPath(linkPath);
			if (file instanceof TFile) {
				finalSrc = this.app.vault.getResourcePath(file);
			}

			audioContainer.createDiv({ text: linkText || linkPath });
			const audioEl = audioContainer.createEl('audio', {
				attr: { src: finalSrc, controls: '' },
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
				if (newIndex !== currentIndex) {
					audioElements[currentIndex].currentTime = 0;
					currentIndex = newIndex;
					audioElements[currentIndex].currentTime = 0;
				}
				nowPlayingEl.setText(`Now Playing: ${linkText}`);
				updatePlayPauseText();
			});

			audioEl.addEventListener('pause', () => {
				if (audioEl === audioElements[currentIndex]) {
					// If it's the current track, show "Paused"
					nowPlayingEl.setText(`Paused: ${linkText}`);
					updatePlayPauseText();
				}
			});

			audioEl.addEventListener('timeupdate', () => {
				if (audioEl === audioElements[currentIndex]) {
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
				if (audioEl === audioElements[currentIndex]) {
					progressBar.value = '0';
				}
			});

			audioEl.addEventListener('ended', () => {
				if (currentIndex < audioElements.length - 1) {
					currentIndex += 1;
				} else {
					currentIndex = 0;
				}
				playCurrent();
			});

			audioElements.push(audioEl);
		};

		// Regex patterns for standard [title](url) links and wiki [[file]] links
		const mdLinkRegex = /\[([^\]]*?)\]\(([^)]+)\)/g;
		const wikiLinkRegex = /!?\[\[([^\]]+)\]\]/g;

		for (const match of content.matchAll(mdLinkRegex)) {
			const linkText = match[1];
			const linkPath = match[2];
			if (isAudioLink(linkPath)) {
				createAudioElement(linkText, linkPath);
			}
		}

		for (const match of content.matchAll(wikiLinkRegex)) {
			const linkText = match[1];
			const [actualPath] = linkText.split('|');
			if (isAudioLink(actualPath)) {
				createAudioElement(actualPath, actualPath);
			}
		}

		if (audioElements.length === 0) return;

		const playCurrent = () => {
			const audio = audioElements[currentIndex];
			if (audio) {
				audio.currentTime = 0;
				audio.play();
				nowPlayingEl.setText(`Now Playing: ${audio.textContent}`);
				updatePlayPauseText();
			}
		};

		const pauseCurrent = () => {
			const audio = audioElements[currentIndex];
			if (audio) {
				audio.pause();
				nowPlayingEl.setText(`Paused: ${audio.textContent}`);
				updatePlayPauseText();
			}
		};

		const goToNext = () => {
			pauseCurrent();
			audioElements[currentIndex].currentTime = 0;
			currentIndex = (currentIndex + 1) % audioElements.length;
			playCurrent();
		};

		const goToPrev = () => {
			pauseCurrent();
			audioElements[currentIndex].currentTime = 0;
			currentIndex = (currentIndex - 1 + audioElements.length) % audioElements.length;
			playCurrent();
		};

		btnPrev.addEventListener('click', () => {
			goToPrev();
		});

		btnPlayPause.addEventListener('click', () => {
			const currentAudio = audioElements[currentIndex];
			if (currentAudio.paused) {
				currentAudio.play(); // triggers 'play' event
			} else {
				currentAudio.pause(); // triggers 'pause' event
			}
		});

		btnNext.addEventListener('click', () => {
			goToNext();
		});

		progressBar.addEventListener('input', () => {
			const audio = audioElements[currentIndex];
			const fraction = Number(progressBar.value) / 100;
			if (audio.duration && !Number.isNaN(audio.duration)) {
				audio.currentTime = fraction * audio.duration;
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}
//
// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}
//
// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

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
