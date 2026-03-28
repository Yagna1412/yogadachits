import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-repeated-persons',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './repeated-persons.html',
  styleUrls: ['./repeated-persons.scss']
})
export class RepeatedPersonsComponent {
  personForm: FormGroup;
  submitted = false;
  repeatedPersons: any[] = [];
  showPersons = false;

  constructor(private fb: FormBuilder) {
    this.personForm = this.fb.group({
      mode: ['', Validators.required],
      personName: ['', Validators.required]
    });
  }

  get f() {
    return this.personForm.controls;
  }

  onRetrieve() {
    this.submitted = true;

    if (this.personForm.invalid) {
      return;
    }

    // Mock data for repeated persons
    this.repeatedPersons = [
      { id: 1, name: this.personForm.value.personName, phone: '9876543210', email: 'john@example.com', address: 'Address 1', duplicateCount: 2 },
      { id: 2, name: this.personForm.value.personName + ' (Duplicate)', phone: '9876543211', email: 'john.dup@example.com', address: 'Address 2', duplicateCount: 2 },
      { id: 3, name: this.personForm.value.personName + ' (Another)', phone: '9876543212', email: 'john2@example.com', address: 'Address 3', duplicateCount: 3 }
    ];

    this.showPersons = true;
  }

  onClear() {
    this.personForm.reset();
    this.submitted = false;
    this.showPersons = false;
    this.repeatedPersons = [];
  }
}