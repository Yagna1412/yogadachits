import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  name: string;
  memberId: string;
  joinDate: string;
  mobile: string;
  email: string;
  aadharNumber: string;
  panNumber: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  status: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  isEditing = false;
  successMessage = '';
  validationError = '';
  profilePicture = 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=6366f1&color=fff&size=128';

  // Original Profile Data
  profile: UserProfile = {
    name: 'Rajesh Kumar',
    memberId: '#YCF-2026-001',
    joinDate: '15 Jan 2024',
    mobile: '9876543210',
    email: 'rajesh.kumar@example.com',
    aadharNumber: 'XXXX-XXXX-1234',
    panNumber: 'ABCPE1234F',
    address: '123, Anna Salai, Chennai, Tamil Nadu - 600002',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXXXXXXX1234',
    ifscCode: 'HDFC0001234',
    status: 'Active Member'
  };

  // Mutable copy for editing
  editProfile: Partial<UserProfile> = {};

  ngOnInit() {
    this.resetEditProfile();
  }

  toggleEditMode() {
    this.successMessage = '';
    this.validationError = '';
    
    if (this.isEditing) {
      // Cancel Edit
      this.resetEditProfile();
      this.isEditing = false;
    } else {
      // Enter Edit Mode
      this.resetEditProfile();
      this.isEditing = true;
    }
  }

  resetEditProfile() {
    this.editProfile = {
      mobile: this.profile.mobile,
      email: this.profile.email,
      address: this.profile.address,
      bankName: this.profile.bankName,
      accountNumber: this.profile.accountNumber,
      ifscCode: this.profile.ifscCode
    };
  }

  onProfilePictureChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicture = e.target.result;
        this.successMessage = 'Profile picture updated locally!';
        setTimeout(() => (this.successMessage = ''), 2000);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.validationError = '';
    this.successMessage = '';

    // Validation Rules: Mandatory fields required
    if (!this.editProfile.mobile || !this.editProfile.email || !this.editProfile.address || 
        !this.editProfile.bankName || !this.editProfile.accountNumber || !this.editProfile.ifscCode) {
      this.validationError = 'All editable fields are mandatory. Please fill out all fields.';
      return;
    }

    // Email format validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.editProfile.email)) {
      this.validationError = 'Please enter a valid email address.';
      return;
    }

    // Mobile validation (simplified 10 digit)
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(this.editProfile.mobile)) {
      this.validationError = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    // IFSC Code validation (Standard IFSC pattern)
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(this.editProfile.ifscCode)) {
      this.validationError = 'Please enter a valid 11-character IFSC code (e.g. ABCD0123456).';
      return;
    }

    // Account Number validation (Generic range 9 to 18 characters)
    const accountPattern = /^\d{9,18}$/;
    if (!accountPattern.test(this.editProfile.accountNumber)) {
      this.validationError = 'Please enter a valid bank account number (9-18 digits).';
      return;
    }

    // Update real profile with edit copy (Limited Edit Access)
    // Note: Name, memberId, joinDate, aadhar, pan are NOT transferred over
    Object.assign(this.profile, this.editProfile);
    
    this.isEditing = false;
    this.successMessage = 'Profile updated successfully!';
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
