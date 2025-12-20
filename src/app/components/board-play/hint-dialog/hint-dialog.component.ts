import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { GameContainer } from "src/app/classes/model/game/game-container.class";
import { EWorkerResult, WorkerResult } from "src/app/classes/solution-controller.class";

export interface HintDialogData {
    containers: GameContainer[];
}

@Component({
    selector: 'app-hint-dialog',
    templateUrl: './hint-dialog.component.html',
    styleUrls: ['./hint-dialog.component.scss']
})
export class HintDialogComponent {

    protected hintMessage: string = "..."

    constructor(
            private translate: TranslateService,
            private dialogRef: MatDialogRef<HintDialogComponent, void>,
            @Inject(MAT_DIALOG_DATA) data: HintDialogData) {

        const containers = GameContainer.cloneContainers(data.containers);
        if (typeof Worker !== undefined) {
            const worker = new Worker(new URL('src/app/classes/web-worker.worker', import.meta.url));
            worker.onmessage = ({ data }) => {
                worker.terminate();
                const messageData: WorkerResult = data;
                if (messageData.result === EWorkerResult.SOLUTION) {
                    this.hintMessage = this.translate.instant('PLAY.HINT.YES_SOLUTION');
                } else {
                    this.hintMessage = this.translate.instant('PLAY.HINT.NO_SOLUTION');
                }
            };
            // start work
            worker.postMessage(containers);
        } else {
            console.error("Web Workers are not supported in this environment.");
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
}