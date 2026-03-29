import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SuretyService } from '../../service/surety-entry.service';
import { EnrollmentsService } from '../../service/enrollments.service';
import { MemberService } from '../../service/member.service';
import { ChitGroupsService } from '../../service/chit-groups.service';

@Component({
  selector: 'app-surety-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './surety-entry.html',
  styleUrls: ['./surety-entry.scss'] // Make sure you have this file
})
export class SuretyEntryComponent implements OnInit, AfterViewInit {
  showForm = false;
  searchTerm: string = '';
  submitted = false;
  validationError = '';
  
  // Data arrays
  filteredSureties: any[] = [];
  chitGroups     : any[] = [];
  enrollments    : any[] = [];
  members        : any[] = [];
  
  // Enriched enrollment rows: enrollmentId + group + ticket + subscriber
  enrollmentOptions: any[] = [];
  
  // Form payload
  newSurety: any = {};

  constructor(
    private suretyService   : SuretyService,
    private enrollmentsService: EnrollmentsService,
    private memberService   : MemberService,
    private chitGroupsService: ChitGroupsService,
    private cdr             : ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSureties();
    this.loadFormData();   // Load Enrollments + ChitGroups + Members in parallel
  }

  ngAfterViewInit(): void {
    // data already loaded in ngOnInit
  }

  loadSureties() {
    this.suretyService.getAllSureties(this.searchTerm).subscribe({
      next: (data) => {
        this.filteredSureties = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching sureties:', err)
    });
  }

  /** Load Chit Groups, Enrollments, and Members in one parallel call */
  loadFormData() {
    forkJoin({
      groups     : this.chitGroupsService.getChitGroups(),
      enrollments: this.enrollmentsService.getEnrollments(),
      members    : this.memberService.getMembers()
    }).subscribe({
      next: ({ groups, enrollments, members }) => {
        // Map chit groups for quick lookup
        const groupMap: Record<number, string> = {};
        const groupData: any[] = (groups as any)?.data ?? groups ?? [];
        groupData.forEach((g: any) => { groupMap[g.id] = g.groupName || g.name; });

        // Enrich enrollments with the group name from ChitGroups
        const enrollData: any[] = (enrollments as any)?.data ?? enrollments ?? [];
        const activeEnrollments = enrollData.filter((e: any) => e.status?.toLowerCase() === 'active');
        this.enrollmentOptions = activeEnrollments.map((e: any) => ({
          id            : e.id,
          ticketNo      : e.ticketNo,
          chitGroupId   : e.chitGroupId,
          chitGroupName : groupMap[e.chitGroupId] || e.chitGroupName || `Group #${e.chitGroupId}`,
          memberName    : e.memberName || e.subscriberName || `Member #${e.memberId}`,
          memberId      : e.memberId
        }));

        // Members for guarantor dropdown
        this.members = (members as any[]) || [];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading form data:', err);
        this.cdr.detectChanges();
      }
    });
  }

  saveSurety() {
    this.submitted = true;
    this.validationError = '';

    if (!this.newSurety.enrollmentId || !this.newSurety.guarantorId ||
        !this.newSurety.suretyRelation || !this.newSurety.suretyDate) {
      this.validationError = 'Please fill in all required fields marked with *';
      return;
    }

    this.suretyService.createSurety(this.newSurety).subscribe({
      next: () => {
        this.newSurety = {};
        this.submitted = false;
        this.validationError = '';
        this.showForm = false;       // Switch back to table view
        this.cdr.detectChanges();   // Paint the table instantly
        this.loadSureties();        // Refresh list in background
      },
      error: (err) => {
        console.error('Error saving surety:', err);
        this.validationError = 'Failed to save surety. Please check the backend is running.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.newSurety = {};
      this.submitted = false;
      this.validationError = '';
    }
  }

  filterSureties() {
    this.loadSureties();
  }
}