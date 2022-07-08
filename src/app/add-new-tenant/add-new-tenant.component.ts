import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { map } from "rxjs/operators";

// enabledApps: [0, -- LendingApp
//   1, -- SpendConnectApp
//   2, -- ContractApp
//   3, -- RequestApp
//   4, -- TenantManagementApp
//   5] -- UserManagementApp
// loginType: 0, -- Password
// 1  -- SSO

enum ApplicationCode {
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

type CheckEnabledAppOptionsType = "contracts" | "requests" | "both";

interface INewTenant {
  tenantName: string;
  siteName: string;
  connectionString: string;
  enabledApps: [ApplicationCode];
  loginType: 0;
}

interface ICheckboxData {
  name: string;
  value: ApplicationCode;
}

interface IRadioData {
  name: string;
  value: LoginType;
  checked: boolean;
  disabled: boolean;
}

@Component({
  selector: "app-add-new-tenant",
  templateUrl: "./add-new-tenant.component.html",
  styleUrls: ["./add-new-tenant.component.scss"],
})
export class AddNewTenantComponent implements OnInit {
  public addNewTenantForm!: FormGroup;
  public tenantForEdit?: INewTenant;
  public checkboxData: ICheckboxData[] = [
    { name: "Contracts", value: ApplicationCode.ContractApp },
    { name: "Requests", value: ApplicationCode.RequestApp },
    { name: "TenantManagement", value: ApplicationCode.TenantManagementApp },
    { name: "UserManagementApp", value: ApplicationCode.UserManagementApp },
  ];
  public loginTypeRadioData: IRadioData[] = [
    {
      name: "Password",
      value: LoginType.Password,
      checked: true,
      disabled: false,
    },
    {
      name: "SSO",
      value: LoginType.SSO,
      checked: false,
      disabled: true,
    },
  ];
  public enabledAppsForSpendConnect = {
    contracts: false,
    requests: false,
    both: false,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AddNewTenantComponent>
  ) {}

  public get isEdit(): boolean {
    return !!this.tenantForEdit;
  }

  public ngOnInit(): void {
    this.addNewTenantForm = this.fb.group({
      tenantName: [
        null,
        {
          validators: [Validators.required],
          asyncValidators: [],
          updateOn: "blur",
        },
      ],
      siteName: [
        null,
        {
          validators: [
            Validators.required,
            Validators.pattern("^[a-zA-Z0-9]*$"),
          ],
          asyncValidators: [],
        },
      ],
      connectionString: [null],
      enabledApps: this.fb.array([], {
        validators: [this.checkboxesToBeCheckedValidator(1)],
        updateOn: "blur",
      }),
      loginType: [LoginType.Password],
    });

    this.addNewTenantForm.get("tenantName")?.valueChanges.subscribe((value) => {
      this.addNewTenantForm
        .get("siteName")
        ?.patchValue(this.manageTenantName(value));
    });

    this.addNewTenantForm.statusChanges.subscribe((value) =>
      console.log(value)
    );

    this.dialogRef.addPanelClass("form-dialog");
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.addNewTenantForm.controls;
  }

  public onCheckboxChange(e: MatCheckboxChange) {
    if (e.checked) {
      this.checkArray.push(this.fb.control(e.source.value));
    } else {
      let i = 0;
      this.checkArray.controls.forEach((item: AbstractControl) => {
        if (item.value === e.source.value) {
          this.checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    this.enabledAppsForSpendConnect.contracts =
      this.checkContractsOrRequestsAppsAreEnabled("contracts");
    this.enabledAppsForSpendConnect.requests =
      this.checkContractsOrRequestsAppsAreEnabled("requests");
    this.enabledAppsForSpendConnect.both =
      this.checkContractsOrRequestsAppsAreEnabled("both");
  }

  public onSubmit() {
    console.log(this.addNewTenantForm.value);
  }

  private checkContractsOrRequestsAppsAreEnabled(
    option: CheckEnabledAppOptionsType
  ): boolean {
    switch (option) {
      case "contracts":
        console.log(this.isAppEnabled(ApplicationCode.ContractApp));
        return this.isAppEnabled(ApplicationCode.ContractApp);
      case "requests":
        return this.isAppEnabled(ApplicationCode.RequestApp);
      case "both":
        return (
          this.isAppEnabled(ApplicationCode.ContractApp) &&
          this.isAppEnabled(ApplicationCode.RequestApp)
        );
    }
  }

  private isAppEnabled(appCode: ApplicationCode): boolean {
    let result = false;
    this.checkArray.controls.forEach((control: AbstractControl) => {
      if (+control.value === appCode) {
        result = true;
      }
    });
    return result;
  }

  private manageTenantName(tenantName: string): string {
    return tenantName.trim().replace(/[^a-zA-Z0-9]/g, "");
  }

  private tenantExistsAsyncValidator(tenantsService: any): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return tenantsService
        .findTenantByName(control.value)
        .pipe(map((tenant) => (tenant ? { tenantExists: true } : null)));
    };
  }

  private get checkArray(): FormArray {
    return this.addNewTenantForm.get("enabledApps") as FormArray;
  }

  private checkboxesToBeCheckedValidator(minRequired: number = 1): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      let checked = 0;

      (formArray as FormArray).controls.forEach((control) => {
        if (control.value) {
          checked++;
          formArray.markAsTouched();
        }
      });

      if (checked < minRequired && formArray.touched) {
        return {
          lessThanRequired: true,
        };
      }
      return null;
    };
  }

  // private validateForm(): void {
  //   this.addNewTenantForm.
  // }

  // formhelper
  private isControlInvalid(controlName: string): boolean {
    let control = this.addNewTenantForm.get(controlName);
    let result = control!.invalid && control!.touched;
    return result;
  }

  public closeDialog(): void {
    this.dialogRef.removePanelClass("form-dialog");
    this.dialogRef.close();
  }
}
