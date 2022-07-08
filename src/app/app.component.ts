import { Component } from "@angular/core";
import { AddNewTenantComponent } from "./add-new-tenant/add-new-tenant.component";
import { DialogService } from "./dialog.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "test1";
  constructor(private readonly dialogService: DialogService) {}

  onClick() {
    this.dialogService.openComponentModal(
      {
        width: "560px",
        height: "604px",
        data: {
          pasha: "krasav4ik",
        },
      },
      AddNewTenantComponent,
      () => console.warn("DIALOG SUCCESS CALLBACK"),
      () => console.warn("DIALOG ERROR CALLBACK")
    );
  }
}
