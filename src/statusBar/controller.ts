/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the MIT License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { Disposable, window, workspace } from "vscode";
import { FileAccess } from "./../constants";
import { Container } from "./../container";
import { StatusBar } from "./statusBar";

export class Controller {
    private statusBar: StatusBar;
    private disposable: Disposable;

    private timeout: NodeJS.Timeout | null;

    constructor() {
        this.statusBar = new StatusBar();
        this.statusBar.update();

        Container.context.subscriptions.push(this.statusBar);

        window.onDidChangeActiveTextEditor(_editor => {
            this.statusBar.update();
        }, null, Container.context.subscriptions);

        workspace.onDidChangeConfiguration(cfg => {
            if (cfg.affectsConfiguration("fileAccess.position")) {
                this.statusBar.dispose();
                this.statusBar = undefined;
                
                this.statusBar = new StatusBar();
            }
            if (cfg.affectsConfiguration("fileAccess")) {
                this.updateStatusBar();
            }
        }, null, Container.context.subscriptions);

        workspace.onWillSaveTextDocument(e => {
            const local = this.timeout;
            if (local) {
                clearTimeout(local);
            }
            this.timeout = setTimeout(() => {
                this.statusBar.update();
            }, 50);
        });
    }

    public dispose() {
        this.disposable.dispose();
    }

    public updateStatusBar(fileAccess?: FileAccess) {
        this.statusBar.update(fileAccess);
    }
}
