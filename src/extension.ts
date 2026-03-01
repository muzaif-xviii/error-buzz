import * as vscode from 'vscode';
import * as path from 'path';
const player = require('play-sound')();

let lastPlayed = 0;
const cooldown = 2000;

export function activate(context: vscode.ExtensionContext) {

    vscode.window.onDidCloseTerminal((terminal) => {
        console.log('Terminal closed');
    });

    vscode.window.onDidEndTerminalShellExecution((event: any) => {

        const exitCode = event.exitCode;
		console.log("Terminal finished. Exit code:", event.exitCode);

        if (exitCode !== 0 && Date.now() - lastPlayed > cooldown) {

            const soundPath = path.join(
                context.extensionPath,
                'media',
                'faaah.mp3'
            );

            player.play(soundPath, function (err: any) {
                if (err) {
                    console.log('Sound error:', err);
                }
            });

            lastPlayed = Date.now();
        }
    });
}