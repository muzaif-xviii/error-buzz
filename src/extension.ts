import * as vscode from 'vscode';
import * as path from 'path';
const player = require('play-sound')();

let lastPlayed = 0;
const cooldown = 2000;

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.window.onDidEndTerminalShellExecution((event) => {

        if (!event || typeof event.exitCode !== 'number') {
            return;
        }

        console.log("Terminal finished. Exit code:", event.exitCode);

        if (event.exitCode !== 0 && Date.now() - lastPlayed > cooldown) {

            const soundPath = path.join(
                context.extensionPath,
                'media',
                'faaah.mp3'
            );

            player.play(soundPath, (err: any) => {
                if (err) {
                    console.error("Sound error:", err);
                }
            });

            lastPlayed = Date.now();
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}