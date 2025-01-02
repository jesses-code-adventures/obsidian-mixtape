import { TFile, MarkdownPostProcessorContext } from 'obsidian';

export function getCurrentFolderPath(ctx: MarkdownPostProcessorContext) {
	const currentFilePath = ctx.sourcePath;
	const folderParts = currentFilePath.split('/');
	folderParts.pop();
	return folderParts.join('/');
}

export async function getPathsAndContents(source: string, currentFolderPath: string) {
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

export function isAudioLink(link: string): boolean {
	const audioExtensions = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
	const lower = link.toLowerCase();
	return audioExtensions.some((ext) => lower.endsWith('.' + ext));
}
