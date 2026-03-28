import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss']
})
export class UsersListComponent {
  searchTerm = '';
  users: any[] = [
    { id: 1, code: 'U001', name: 'Alice', date: '2024-01-10', role: 'System Admin' },
    { id: 2, code: 'U002', name: 'Bob', date: '2024-02-15', role: 'IT Admin' }
  ];
  filteredUsers: any[] = [...this.users];

  // form state
  showForm = false;
  newUser: any = {};
  editingUser: any = null;
  roles: string[] = ['System Admin', 'IT Admin', 'Auditor'];

  filterUsers() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredUsers = this.users.filter(u => {
      return (
        !q ||
        u.code.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }

  editUser(user: any) {
    // populate form for editing
    this.editingUser = user;
    this.newUser = { ...user };
    if (!this.showForm) {
      this.showForm = true;
    }
  }

  addNewUser() {
    // open blank form for new entry
    this.editingUser = null;
    this.newUser = {};
    this.showForm = true;
  }

  export(format: string) {
    alert('Export to ' + format);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.newUser = {};
      this.editingUser = null;
    }
  }

  saveUser() {
    // basic validation
    if (!this.newUser.code || !this.newUser.name || !this.newUser.date || !this.newUser.role) {
      alert('All fields are mandatory');
      return;
    }
    if (this.editingUser) {
      // update existing
      Object.assign(this.editingUser, this.newUser);
      alert('User updated successfully');
    } else {
      const entry = { ...this.newUser, id: Date.now() };
      this.users.push(entry);
      alert('User added successfully');
    }
    this.filterUsers();
    this.toggleForm();
  }
}
