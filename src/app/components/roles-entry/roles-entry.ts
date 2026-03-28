import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-entry.html',
  styleUrls: ['./roles-entry.scss']
})
export class RolesEntryComponent {
  showForm = false;
  searchTerm = '';

  roles: any[] = [
    { id:1, name:'System Admin', description:'Full access to all modules' },
    { id:2, name:'IT Admin', description:'Manage system configuration and users' }
  ];
  filteredRoles: any[] = [...this.roles];
  newRole: any = {};

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterRoles() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredRoles = this.roles.filter(r => {
      return (!q || r.name.toLowerCase().includes(q));
    });
  }

  saveRole() {
    if (!this.newRole.name) {
      alert('Role Name is mandatory');
      return;
    }
    // unique check
    const exists = this.roles.some(r => r.name.toLowerCase() === (this.newRole.name||'').toLowerCase());
    if (exists) {
      alert('Role Name must be unique');
      return;
    }
    const entry = { ...this.newRole, id: Date.now() };
    this.roles.push(entry);
    this.newRole = {};
    this.showForm = false;
    this.filterRoles();
    alert('Role created successfully');
  }
}
