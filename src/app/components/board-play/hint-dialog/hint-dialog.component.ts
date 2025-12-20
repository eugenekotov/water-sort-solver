import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-hint-dialog',
    templateUrl: './hint-dialog.component.html',
    styleUrls: ['./hint-dialog.component.scss']
})
export class HintDialogComponent {


    constructor(
            private dialogRef: MatDialogRef<HintDialogComponent, void>,
            // @Inject(MAT_DIALOG_DATA) data: PlayedDialogData
        ) {

    }

    closeDialog() {
        this.dialogRef.close();
    }
}