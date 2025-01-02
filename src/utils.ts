import { TFile, MarkdownPostProcessorContext } from 'obsidian';

export function getCurrentFolderPath(ctx: MarkdownPostProcessorContext) {
	const currentFilePath = ctx.sourcePath;
	const folderParts = currentFilePath.split('/');
	folderParts.pop();
	return folderParts.join('/');
}

class PathsAndContents {
	paths: string[]
	contents: unknown[]
	constructor(paths: string[], contents: unknown[]) {
		this.paths = paths;
		this.contents = contents;
	}
}


async function getContents(dir: string, rawPath: string) {
	let pathToLoad: string;
	if (!rawPath.includes('/')) {
		pathToLoad = `${dir}/${rawPath}`;
	} else {
		pathToLoad = rawPath;
	}

	const absFile = this.app.vault.getAbstractFileByPath(pathToLoad);
	if (absFile instanceof TFile) {
		return await this.app.vault.read(absFile);
	}
	return null;
}

export async function getPathsAndContents(source: string, currentFolderPath: string, defaultFileName: string) {
	const filePaths = source
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (filePaths.length === 0) {
		console.log('no paths');
		const contents = await getContents(currentFolderPath, defaultFileName);
		return new PathsAndContents([defaultFileName], [contents])	
	}

	const fileContents = await Promise.all(
		filePaths.map(async (rawPath) => await getContents(currentFolderPath, rawPath))
	);
	return new PathsAndContents(filePaths, fileContents as unknown[])
}

export function aggregateContents(pathsAndContents: PathsAndContents) {
	let contents = '';
	pathsAndContents.paths.forEach((rawPath, i) => {
		if (!rawPath.endsWith('.md')) {
			return
		}
		const content = pathsAndContents.contents[i];
		if (content == null) {
			return;
		}
		if (typeof content !== 'string') {
			throw new Error('Expected markdown file to have string contents')
		}
		contents += content
	});
	return contents
}

export function isAudioLink(link: string): boolean {
	const audioExtensions = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
	const lower = link.toLowerCase();
	return audioExtensions.some((ext) => lower.endsWith('.' + ext));
}
