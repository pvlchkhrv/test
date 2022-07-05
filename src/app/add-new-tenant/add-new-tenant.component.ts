import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";

// enabledApps: [0, -- LendingApp
//   1, -- SpendConnectApp
//   2, -- ContractApp
//   3, -- RequestApp
//   4, -- TenantManagementApp
//   5] -- UserManagementApp
// loginType: 0, -- Password
// 1  -- SSO

enum Applications {
  LendingApp = 0,
  SpendConnectApp = 1,
  ContractApp = 2,
  RequestApp = 3,
  TenantManagementApp = 4,
  UserManagementApp = 5,
}

enum LoginType {
  Password = 0,
  SSO = 1,
}

interface INewTenant {
  tenantName: string;
  siteName: string;
  connectionString: string;
  enabledApps: [Applications];
  loginType: 0;
}

interface ICheckboxData {
  name: string;
  value: Applications;
}

@Component({
  selector: "app-add-new-tenant",
  templateUrl: "./add-new-tenant.component.html",
  styleUrls: ["./add-new-tenant.component.scss"],
})
export class AddNewTenantComponent implements OnInit {
  public addNewTenantForm!: FormGroup;
  public checkboxData: ICheckboxData[] = [
    { name: "Contracts", value: Applications.ContractApp },
    { name: "Requests", value: Applications.RequestApp },
    { name: "TenantManagement", value: Applications.TenantManagementApp },
    { name: "UserManagementApp", value: Applications.UserManagementApp },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.addNewTenantForm = this.fb.group({
      tenantName: [null, [Validators.required, Validators.maxLength(100)]],
      siteName: [this.addNewTenantForm.get("tenantName")?.valueChanges],
      connectionString: [null],
      enabledApps: this.fb.array([], Validators.required),
    });
  }

  onCheckboxChange(e: MatCheckboxChange) {
    const checkArray: FormArray = this.addNewTenantForm.get(
      "enabledApps"
    ) as FormArray;
    if (e.checked) {
      checkArray.push(this.fb.control(e.source.value));
    } else {
      let i = 0;
      checkArray.controls.forEach((item: AbstractControl) => {
        if (item.value === e.source.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  onSubmit() {
    console.log(this.addNewTenantForm.value);
  }
}
