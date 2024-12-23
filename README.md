# obsidian-mixtape (WIP)

this is an obsidian plugin for the three people in the world that make music on the computer and are also obsidian power users.

if you'd like a workflow where you can keep info about songs, including embedded audio, across a bunch of files and then have them scraped together and turned into aplaylist/media player, then this plugin is for you.

## installation

1. Navigate to your vault's directory in the terminal.
2. run `cd .obsidian && mkdir -p plugins && cd plugins && git clone https://github.com/jesses-code-adventures/obsidian-mixtape obsidian-mixtape`
3. In Obsidian, run `Reload app without saving` from the command palette.

## usage

1. In your current folder there should be a file, or a collection of files, that contain audio links.
2. Create a file in that folder (I like to call it \_mixtape.md) and create a `mixtape` element in triple backticks. Inside the element, list the file or files to scrape the audio from.

````text
```mixtape
_PROJECT.md
```
````

3. Go into presentation mode to see your media player.

<img width="600" alt="Screenshot 2024-12-24 at 2 37 42 am" src="https://github.com/user-attachments/assets/136bc2b7-96f5-4d56-93d1-d09b0bed00cf" />
