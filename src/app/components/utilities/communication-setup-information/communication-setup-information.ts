import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-communication-setup-information',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communication-setup-information.html',
  styleUrls: ['./communication-setup-information.scss']
})
export class CommunicationSetupInformationComponent {
  commForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.commForm = this.fb.group({
      screenName: ['', Validators.required],
      message: ['', Validators.required],
      whatsapp: [false],
      email: [false]
    }, { validators: this.atLeastOneCommunicationMode });
  }

  get f() {
    return this.commForm.controls;
  }

  atLeastOneCommunicationMode(control: AbstractControl): ValidationErrors | null {
    const whatsapp = control.get('whatsapp')?.value;
    const email = control.get('email')?.value;

    if (!whatsapp && !email) {
      return { atLeastOneRequired: true };
    }

    return null;
  }

  onSave() {
    this.submitted = true;

    if (this.commForm.invalid) {
      return;
    }

    // Mock save logic
    alert('Communication preferences saved successfully');

    // Reset form
    this.submitted = false;
    this.commForm.reset();
  }

  onCancel() {
    this.commForm.reset();
    this.submitted = false;
  }
}
