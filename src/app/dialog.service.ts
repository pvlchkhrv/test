/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from "@angular/cdk/portal";
import { Injectable, TemplateRef } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { takeWhile } from "rxjs/operators";

interface IComponentModalOptions {
  data?: any;
  [propName: string]: any;
}

@Injectable({
  providedIn: "root",
})
export class DialogService {
  constructor(public dialog: MatDialog) {}

  public openComponentModal(
    options: IComponentModalOptions,
    component: ComponentType<any> | TemplateRef<any>,
    successCallback: (result?: any) => void = () => {},
    rejectCallback: () => void = () => {}
  ): MatDialogRef<any, any> {
    let popupAlive = true;
    const dialogRef: MatDialogRef<any, any> = this.dialog.open(component, {
      data: options.data,
      width: options["width"] || "auto",
      height: options["height"] || "auto",
      disableClose: true,
      restoreFocus: options["restoreFocus"],
    });

    dialogRef
      .afterClosed()
      .pipe(takeWhile(() => popupAlive))
      .subscribe((res: boolean) => {
        popupAlive = false;
        if (res) {
          successCallback(res);
        } else if (res === false) {
          rejectCallback();
        }
      });

    return dialogRef;
  }
}
