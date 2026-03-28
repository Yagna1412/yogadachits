import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mail-setup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mail-setup.html',
  styleUrls: ['./mail-setup.scss']
})
export class MailSetupComponent {
  mailForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.mailForm = this.fb.group({
      fromMail: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      smtpServer: ['', Validators.required],
      smtpPort: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      subject: ['', Validators.required]
    });
  }

  get f() {
    return this.mailForm.controls;
  }

  onSave() {
    this.submitted = true;

    if (this.mailForm.invalid) {
      return;
    }

    // Mock save logic
    alert('Mail setup saved successfully');

    // Reset form
    this.submitted = false;
    this.mailForm.reset();
  }

  onCancel() {
    this.mailForm.reset();
    this.submitted = false;
  }
}