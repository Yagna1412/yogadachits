import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeProfile, MeService } from '../../service/me.service';

interface EditableProfile {
  mobile: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  loadError: string | null = null;
  isEditing = false;
  successMessage = '';
  validationError = '';
  profilePicture = '';

  profile: MeProfile | null = null;
  editProfile: EditableProfile = {
    mobile: '',
    address: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  };

  constructor(private meService: MeService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.loadError = null;
    this.isEditing = false;

    this.meService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profilePicture = this.resolvePhotoUrl(profile);
        this.resetEditProfile();
        this.isLoading = false;
      },
      error: (err) => {
        this.profile = null;
        this.loadError = err?.error?.message || 'Unable to load your profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.successMessage = '';
    this.validationError = '';

    if (this.isEditing) {
      this.resetEditProfile();
      this.isEditing = false;
      return;
    }

    this.resetEditProfile();
    this.isEditing = true;
  }

  resetEditProfile(): void {
    this.editProfile = {
      mobile: this.profile?.phone || '',
      address: this.displayOrEmpty(this.profile?.address),
      bankName: this.displayOrEmpty(this.profile?.bankName),
      accountNumber: this.displayOrEmpty(this.profile?.accountNumber),
      ifscCode: this.displayOrEmpty(this.profile?.ifscCode)
    };
  }

  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicture = String(reader.result || this.profilePicture);
      this.successMessage = 'Photo preview updated locally. Upload will be available soon.';
      setTimeout(() => (this.successMessage = ''), 2500);
    };
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    if (!this.profile) {
      return;
    }

    this.validationError = '';
    this.successMessage = '';

    const mobile = (this.editProfile.mobile || '').trim();
    const address = (this.editProfile.address || '').trim();
    const bankName = (this.editProfile.bankName || '').trim();
    const accountNumber = (this.editProfile.accountNumber || '').trim();
    const ifscCode = (this.editProfile.ifscCode || '').trim().toUpperCase();

    if (!mobile || !address || !bankName || !accountNumber || !ifscCode) {
      this.validationError = 'All editable fields are mandatory. Please fill out all fields.';
      return;
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) {
      this.validationError = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifscCode)) {
      this.validationError = 'Please enter a valid 11-character IFSC code (e.g. ABCD0123456).';
      return;
    }

    const accountPattern = /^\d{9,18}$/;
    if (!accountPattern.test(accountNumber)) {
      this.validationError = 'Please enter a valid bank account number (9-18 digits).';
      return;
    }

    this.isSaving = true;
    this.meService.updateProfile({
      phone: mobile,
      address,
      bankName,
      accountNumber,
      ifscCode
    }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.profilePicture = this.resolvePhotoUrl(updated);
        this.resetEditProfile();
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.validationError = err?.error?.message || 'Unable to update profile. Please try again.';
      }
    });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  displayValue(value: string | null | undefined): string {
    if (!value || value === '—') {
      return '—';
    }
    return value;
  }

  private displayOrEmpty(value: string | null | undefined): string {
    if (!value || value === '—') {
      return '';
    }
    return value;
  }

  private resolvePhotoUrl(profile: MeProfile): string {
    if (profile.photoUrl) {
      return profile.photoUrl;
    }
    const name = encodeURIComponent(profile.fullName || 'Member');
    return `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff&size=128`;
  }
}
