import Controls from 'controls';
import ProgressBar from 'progressBar';
import { isAudioLink } from 'utils';
import { App, normalizePath, TFile } from 'obsidian';
import Track from 'track';
import { Settings } from 'settings';

export default class Player {
	app: App
	currentDir: string
	content: string
	parent: HTMLDivElement
	container: HTMLDivElement
	controls: Controls
	selectedTrackIdx: number
	progressBar: ProgressBar
	tracks: Track[]
	settings: Settings

	constructor(app: App, parent: HTMLDivElement, content: string, currentDir: string) {
		this.app = app
		this.parent = parent;
		this.content = content;
		this.currentDir = currentDir;
		this.tracks = [];
		this.selectedTrackIdx = -1;
		this.progressBar = new ProgressBar(this)
		this.controls = new Controls(this);
		this.parseTracksFromContents();
		if (this.tracks.length === 0) return;
	}

	render() {
		this.container = this.parent.createDiv({ cls: 'mixtape-audio-links' });
		this.progressBar.render();
		this.controls.render();
		for (const track of this.tracks) {
			track.render();
		}
	}

	setContent(content: string) {
		this.content = content;
		this.parseTracksFromContents()
	}

	getSelectedTrack() {
		if (this.tracks.length === 0 || this.selectedTrackIdx >= this.tracks.length) {
			return null
		}
		if (this.tracks.length > 0 && this.selectedTrackIdx < 0) {
			this.setSelectedTrack(0)
		}
		return this.tracks[this.selectedTrackIdx]
	}

	setSelectedTrack(idx: number) {
		if (idx >= this.tracks.length) {
			throw new Error(`unexpected index [${idx}] for new track, we only have [${this.tracks.length}] tracks.`);
		}
		this.selectedTrackIdx = idx
	}

	getTracks() {
		return this.tracks
	}

	/** 
		* add a new track to the mixtape playlist.
		* will be called when looping through the audio tracks contained in the file contents.
		* the audio links will contain text defined by the user, and the (possibly relative) obisian paths.
	*/
	private appendTrackToPlayer(linkText: string, linkPath: string) {
		const path = this.handleGetResource(this.currentDir, linkPath);
		const track = new Track(this, linkText, linkPath, path);
		this.tracks.push(track);
	}

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

	private parseTracksFromContents() {
		const mdLinkRegex = /\[([^\]]*?)\]\(([^)]+)\)/g;
		for (const match of this.content.matchAll(mdLinkRegex)) {
			const linkText = match[1];
			const linkPath = match[2];
			if (isAudioLink(linkPath)) {
				this.appendTrackToPlayer(linkText, linkPath);
			}
		}

		const wikiLinkRegex = /!?\[\[([^\]]+)\]\]/g;
		for (const match of this.content.matchAll(wikiLinkRegex)) {
			const linkText = match[1];
			const [actualPath] = linkText.split('|');
			if (isAudioLink(actualPath)) {
				this.appendTrackToPlayer(actualPath, actualPath);
			}
		}
	}
}
