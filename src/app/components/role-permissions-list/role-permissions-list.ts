import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-permissions-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './role-permissions-list.html',
  styleUrls: ['./role-permissions-list.scss']
})
export class RolePermissionsListComponent {
  roles = ['System Admin', 'IT Admin', 'Auditor'];
  modules = ['Dashboard', 'Transactions', 'Reports', 'Settings'];
  subModules = ['Members', 'Accounts', 'Security', 'Admin'];

  selectedRole = '';
  selectedModule = '';
  selectedSubModule = '';

  permissions: any[] = [];

  viewPermissions() {
    if (!this.selectedRole) { alert('Role selection is mandatory'); return; }
    // dummy data generation based on filters
    this.permissions = [
      { role: this.selectedRole, module: this.selectedModule || 'Any', subModule: this.selectedSubModule || 'Any' }
    ];
  }
}
