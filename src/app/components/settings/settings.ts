import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProfileData {
  fullName: string;
  profileUrl: string;
  bioDescription: string;
  profilePicture: string;
}

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  activeTab: string = 'profile';

  profileData: ProfileData = {
    fullName: 'Manas Kilaru',
    profileUrl: 'https://slothui.com/ X_AE_A-22',
    bioDescription: '',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
  };

  bioCharCount = 0;
  maxBioChars = 300;

  tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'chit-details', label: 'Chit Details' },
    { id: 'members', label: 'Members' },
    { id: 'draw-settings', label: 'Draw Settings' },
    { id: 'payments', label: 'Payments' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'documents', label: 'Documents' },
    { id: 'security', label: 'Security' },
  ];

  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onBioInput(value: string): void {
    this.profileData.bioDescription = value;
    this.bioCharCount = value.length;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileData.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges(): void {
    console.log('Saving changes:', this.profileData);
    // Add API call here
  }

  exportData(): void {
    console.log('Exporting data...');
    // Add export logic here
  }

  cancel(): void {
    console.log('Cancelled');
    // Reset or navigate away
  }
}
