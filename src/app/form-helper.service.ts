import { Injectable } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormHelperService {
  constructor() {}

  public validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  public serverSideValidateAllFormFields(
    formGroup: FormGroup,
    validationErrors: any
  ): void {
    if (validationErrors) {
      validationErrors.forEach(({ field, message }) => {
        const formControl = formGroup.get(this.lowercaseFirstLetter(field));
        if (formControl) {
          formControl.setErrors({
            serverError: message,
          });
        }
      });
    }
  }

  public checkClosingForm(event: any, form: FormGroup): void {
    if (this.hasValueInForm(form)) {
      event.returnValue =
        "Are you sure you want to leave this page? All provided information will be lost.";
    }
  }

  public hasValueInForm(abstractControl: AbstractControl): boolean {
    if (abstractControl) {
      if (!abstractControl.controls) {
        if (
          (Array.isArray(abstractControl.value) &&
            abstractControl.value.length) ||
          (!Array.isArray(abstractControl.value) && abstractControl.value)
        ) {
          return true;
        }
      }
      const key = "controls";
      if (abstractControl[key]) {
        for (const controlName in abstractControl[key]) {
          if (abstractControl[key][controlName]) {
            if (this.hasValueInForm(abstractControl[key][controlName])) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private lowercaseFirstLetter(word: string) {
    return word.charAt(0).toLowerCase() + word.slice(1);
  }
}
