import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChequeStat {
    count: number;
    amount: number;
}

interface PastAuction {
    auctionNumber: number;
    winner: string;
    amount: number;
    date: string;
}

@Component({
    selector: 'app-company-setup',
    imports: [CommonModule, FormsModule],
    templateUrl: './company-setup.html',
    styleUrl: './company-setup.scss',
})
export class CompanySetupComponent {
    pendingStats: ChequeStat = { count: 3, amount: 60000 };
    clearedStats: ChequeStat = { count: 2, amount: 35000 };
    bouncedStats: ChequeStat = { count: 1, amount: 25000 };
    showAddMemberModal: boolean = false;
    currentStep: number = 1;
    totalSteps: number = 5;

    steps = [
        { number: 1, title: 'Company Details', completed: false },
        { number: 2, title: 'Charges', completed: false },
        { number: 3, title: 'Auction Rules', completed: false },
        { number: 4, title: 'Accounting', completed: false },
        { number: 5, title: 'SMS Settings', completed: false }
    ];

    pastAuctions: PastAuction[] = [
        { auctionNumber: 7, winner: 'Rajesh Kumar', amount: 25000, date: 'Mar 19,2023 9:00AM' },
        { auctionNumber: 8, winner: 'Priya Sharma', amount: 25000, date: 'Mar 19,2023 9:00AM' },
        { auctionNumber: 6, winner: 'Amit Patel', amount: 25000, date: 'Mar 19,2023 9:00AM' },
        { auctionNumber: 5, winner: 'Sunita Devi', amount: 25000, date: 'Mar 19,2023 9:00AM' },
    ];

    newMember: any = {
        // Step 1 - Basic
        fullName: '',
        mobileNumber: '',
        emailAddress: '',
        aadharNumber: '',
        address: '',
        // Step 2 - Personal
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        fatherName: '',
        motherName: '',
        // Step 3 - Bank
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: '',
        // Step 4 - Occupation
        occupation: '',
        companyName: '',
        monthlyIncome: '',
        workExperience: '',
        officeAddress: '',
        // Step 5 - Nominee
        nomineeName: '',
        nomineeRelation: '',
        nomineeMobile: '',
        nomineeAddress: ''
    };

    searchTerm: string = '';

    formatCurrency(amount: number): string {
        return (
            '₹' +
            amount.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })
        );
    }

    saveContinue(): void {
        this.showAddMemberModal = true;
        this.currentStep = 1;
    }

    goToStep(step: number): void {
        this.currentStep = step;
    }
    closeAddMemberModal(): void {
        this.showAddMemberModal = false;
        this.currentStep = 1;
    }
    nextStep(): void {
        if (this.currentStep < this.totalSteps) {
            this.steps[this.currentStep - 1].completed = true;
            this.currentStep++;
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
            this.steps[this.currentStep - 1].completed = false;
            this.currentStep--;
        }
    }


}
