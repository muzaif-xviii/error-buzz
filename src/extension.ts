import * as vscode from 'vscode';
import * as path from 'path';
const player = require('play-sound')();

let lastPlayed = 0;
const cooldown = 2000;

export function activate(context: vscode.ExtensionContext) {

    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );

    statusBar.command = 'error-buzz.toggle';
    context.subscriptions.push(statusBar);

    function updateStatusBar() {
        const enabled = getEnabled();
        statusBar.text = enabled ? "🔔 Error Buzz: ON" : "🔕 Error Buzz: OFF";
        statusBar.show();
    }

    function getEnabled(): boolean {
        const config = vscode.workspace.getConfiguration('errorBuzz');
        return config.get<boolean>('enabled') ?? true;
    }

    async function toggle() {
        const config = vscode.workspace.getConfiguration('errorBuzz');
        const current = getEnabled();
        await config.update('enabled', !current, true);
        updateStatusBar();
    }

    async function selectSound() {
        const file = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: { Audio: ['mp3'] }
        });

        if (file && file[0]) {
            await context.globalState.update('customSoundPath', file[0].fsPath);
            vscode.window.showInformationMessage("Custom sound selected!");
        }
    }

    const toggleCommand = vscode.commands.registerCommand(
        'error-buzz.toggle',
        toggle
    );

    const selectSoundCommand = vscode.commands.registerCommand(
        'error-buzz.selectSound',
        selectSound
    );

    vscode.window.onDidEndTerminalShellExecution((event) => {

        if (!event || typeof event.exitCode !== 'number') {
            return;
        }

        if (!getEnabled()) {
            return;
        }

        if (event.exitCode !== 0 && Date.now() - lastPlayed > cooldown) {

            let soundPath = context.globalState.get<string>('customSoundPath');

            if (!soundPath) {
                soundPath = path.join(
                    context.extensionPath,
                    'media',
                    'faaah.mp3'
                );
            }

            player.play(soundPath, (err: any) => {
                if (err) {
                    console.error("Sound error:", err);
                }
            });

            lastPlayed = Date.now();
        }
    });

    context.subscriptions.push(toggleCommand, selectSoundCommand);
    updateStatusBar();
}

export function deactivate() {}