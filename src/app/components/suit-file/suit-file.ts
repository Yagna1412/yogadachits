import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SuitFileService,
  SuitMemberOption,
  SuitTimelineEntry,
  SuitFileRecord
} from '../../service/suit-file.service';
import { environment } from '../../../enviornment/enviornment';

interface Member {
  id: string;
  name: string;
  avatar: string;
  joinedDate: string;
  status: string;
  outstandingAmount: string;
  enrolledGroups: string[];
}

interface TimelineEntry {
  title: string;
  subtitle: string;
  date?: string;
  time?: string;
  document?: {
    name: string;
    size: string;
  };
  notify?: string[];
}

@Component({
  selector: 'app-suit-file',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suit-file.html',
  styleUrl: './suit-file.scss',
})
export class SuitFileInfoComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private readonly defaultAvatar = 'assets/images/icons/user.png';

  searchQuery: string = '';
  selectedMember: Member | null = null;
  showAddSuitModal: boolean = false;
  showSuccessModal: boolean = false;
  isSavingSuit: boolean = false;
  isSavingTimeline: boolean = false;

  newSuit: any = {
    memberId: '',
    suitCause: '',
    suitDate: '',
    courtName: '',
    lawyerDetails: '',
    caseNumber: '',
    principal: null,
    interest: null,
    legalCost: null,
    incCharges: null,
    claimAmount: null,
    legalNoticeDate: ''
  };

  showTimelineModal: boolean = false;
  showTimelineSuccess: boolean = false;
  currentCaseNumber: string = '';
  hasSuitFile: boolean = false;
  activeSuitFile: SuitFileRecord | null = null;

  notifyUsers: string[] = [];

  newTimeline: any = {
    title: '',
    date: '',
    time: '',
    details: '',
    notify: []
  };

  notifySearchInput: string = '';
  filteredNotifyUsers: string[] = [];
  showNotifyDropdown: boolean = false;

  uploadedFiles: Array<{ name: string; size: string; raw?: File }> = [];

  members: Member[] = [];
  suggestedMembers: Member[] = [];
  searchResults: Member[] = [];
  timelineEntries: TimelineEntry[] = [];
  timelineLoadError = '';
  pageMessage = '';

  suitErrorMessage: string = '';
  timelineErrorMessage: string = '';

  constructor(
    private suitFileService: SuitFileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadMembers();
    this.suitFileService.getNotifyUsers().subscribe({
      next: (users) => {
        this.notifyUsers = users;
        this.cdr.detectChanges();
      }
    });
  }

  loadMembers(searchTerm?: string) {
    this.suitFileService.getMembers(searchTerm).subscribe({
      next: (data) => {
        const mapped = data.map(m => this.mapMemberOption(m));
        this.members = mapped;
        if (!searchTerm?.trim()) {
          this.suggestedMembers = mapped.slice(0, 4);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.pageMessage = 'Unable to load members. Please ensure the backend is running on port 8080.';
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    const term = this.searchQuery.trim();
    if (!term) {
      this.searchResults = [];
      return;
    }

    this.suitFileService.getMembers(term).subscribe({
      next: (data) => {
        this.searchResults = data.map(m => this.mapMemberOption(m));
        this.cdr.detectChanges();
      },
      error: () => {
        this.searchResults = [];
        this.cdr.detectChanges();
      }
    });
  }

  selectMember(member: Member) {
    this.selectedMember = { ...member };
    this.searchQuery = '';
    this.searchResults = [];
    this.timelineLoadError = '';
    this.pageMessage = '';

    this.refreshMemberSummary(Number(member.id));
    this.loadSuitFile(Number(member.id));
    this.loadTimeline(Number(member.id));
  }

  refreshMemberSummary(memberId: number) {
    this.suitFileService.getMemberSummary(memberId).subscribe({
      next: (summary) => {
        if (summary?.id) {
          this.selectedMember = {
            id: String(summary.id),
            name: summary.name,
            avatar: this.resolveAvatar(summary.photoUrl),
            joinedDate: summary.joinedDate || '',
            status: this.formatStatus(summary.status),
            outstandingAmount: summary.outstandingAmount || '₹ 0',
            enrolledGroups: summary.enrolledGroups || []
          };
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadSuitFile(memberId: number) {
    this.suitFileService.getSuitFileForMember(memberId).subscribe({
      next: (suit) => {
        if (suit?.legalCaseId) {
          this.activeSuitFile = suit;
          this.hasSuitFile = true;
          this.currentCaseNumber = suit.caseNumber || '';
          this.cdr.detectChanges();
          return;
        }
        this.suitFileService.getLatestCaseNumber(memberId).subscribe({
          next: (caseNo) => {
            this.hasSuitFile = !!caseNo?.trim();
            this.currentCaseNumber = caseNo || '';
            this.activeSuitFile = this.hasSuitFile
              ? {
                  legalCaseId: 0,
                  memberId,
                  memberName: this.selectedMember?.name || '',
                  caseNumber: caseNo
                }
              : null;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  loadTimeline(memberId: number) {
    this.timelineLoadError = '';
    this.suitFileService.getTimeline(memberId).subscribe({
      next: (entries) => {
        this.timelineEntries = (entries || []).map(e => this.mapTimelineEntry(e));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.timelineEntries = [];
        this.timelineLoadError = err?.error?.message || 'Unable to load timeline. Please ensure the backend is running on port 8080.';
        this.cdr.detectChanges();
      }
    });
  }

  openAddSuitDialog() {
    this.loadMembers();
    this.showAddSuitModal = true;
    this.suitErrorMessage = '';
    this.newSuit.memberId = this.selectedMember?.id || '';
  }

  closeAddSuitDialog() {
    this.showAddSuitModal = false;
    this.suitErrorMessage = '';
  }

  submitSuitForm() {
    this.suitErrorMessage = '';
    if (!this.newSuit.memberId) {
      this.suitErrorMessage = 'Please select a member';
      return;
    }
    if (!this.newSuit.suitCause?.trim()) {
      this.suitErrorMessage = 'Suit cause is required';
      return;
    }

    this.isSavingSuit = true;
    this.suitFileService.createSuitFile({
      memberId: Number(this.newSuit.memberId),
      suitCause: this.newSuit.suitCause.trim(),
      suitDate: this.newSuit.suitDate || undefined,
      caseNumber: this.newSuit.caseNumber || undefined,
      courtName: this.newSuit.courtName || undefined,
      lawyerDetails: this.newSuit.lawyerDetails || undefined,
      principal: this.newSuit.principal ?? undefined,
      interest: this.newSuit.interest ?? undefined,
      legalCost: this.newSuit.legalCost ?? undefined,
      incCharges: this.newSuit.incCharges ?? undefined,
      claimAmount: this.newSuit.claimAmount ?? undefined,
      legalNoticeDate: this.newSuit.legalNoticeDate || undefined,
    }).subscribe({
      next: (response) => {
        this.isSavingSuit = false;
        if (!response?.legalCaseId) {
          this.suitErrorMessage = 'Save failed. Please check the backend is running.';
          this.cdr.detectChanges();
          return;
        }
        this.applySavedSuit(response);
        this.showAddSuitModal = false;
        this.showSuccessModal = true;
        this.resetSuitForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingSuit = false;
        this.suitErrorMessage = err?.error?.message || 'Failed to save suit information.';
        this.cdr.detectChanges();
      }
    });
  }

  private applySavedSuit(response: SuitFileRecord) {
    this.activeSuitFile = response;
    this.hasSuitFile = true;
    this.currentCaseNumber = response.caseNumber || '';

    const memberId = String(response.memberId);
    const existing = this.members.find(m => m.id === memberId);
    this.selectedMember = {
      id: memberId,
      name: response.memberName || existing?.name || 'Member',
      avatar: existing?.avatar || this.defaultAvatar,
      joinedDate: existing?.joinedDate || '',
      status: this.formatStatus(response.status || 'filed'),
      outstandingAmount: response.claimAmount != null ? `₹ ${response.claimAmount}` : (existing?.outstandingAmount || '₹ 0'),
      enrolledGroups: existing?.enrolledGroups || []
    };

    this.loadTimeline(Number(response.memberId));
    this.refreshMemberSummary(Number(response.memberId));
  }

  resetSuitForm() {
    this.newSuit = {
      memberId: this.selectedMember?.id || '',
      suitCause: '',
      suitDate: '',
      courtName: '',
      lawyerDetails: '',
      caseNumber: '',
      principal: null,
      interest: null,
      legalCost: null,
      incCharges: null,
      claimAmount: null,
      legalNoticeDate: ''
    };
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  openTimelineDialog() {
    if (!this.selectedMember) {
      this.pageMessage = 'Please select a member first.';
      return;
    }

    this.timelineErrorMessage = '';
    this.pageMessage = '';

    if (!this.hasSuitFile) {
      this.pageMessage = 'No suit file for this member. Click "+ Add Suit File" and save suit information first.';
      return;
    }

    this.currentCaseNumber = this.activeSuitFile?.caseNumber || this.currentCaseNumber || '—';
    this.resetTimelineForm();
    this.showTimelineModal = true;
    this.cdr.detectChanges();
  }

  closeTimelineDialog() {
    this.showTimelineModal = false;
    this.timelineErrorMessage = '';
    this.showNotifyDropdown = false;
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.addFiles(input.files);
    input.value = '';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files?.length) return;
    this.addFiles(event.dataTransfer.files);
  }

  addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.uploadedFiles.push({
        name: file.name,
        size: this.humanFileSize(file.size),
        raw: file
      });
    }
    this.cdr.detectChanges();
  }

  removeUploadedFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  filterNotifyUsers(searchTerm: string) {
    this.notifySearchInput = searchTerm;
    if (searchTerm.trim() === '') {
      this.filteredNotifyUsers = this.notifyUsers.filter(u => !this.newTimeline.notify.includes(u));
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredNotifyUsers = this.notifyUsers.filter(u =>
        u.toLowerCase().includes(term) && !this.newTimeline.notify.includes(u)
      );
    }
    this.showNotifyDropdown = this.filteredNotifyUsers.length > 0;
  }

  addNotifyUser(user: string) {
    if (!this.newTimeline.notify.includes(user)) {
      this.newTimeline.notify.push(user);
    }
    this.notifySearchInput = '';
    this.showNotifyDropdown = false;
    this.filteredNotifyUsers = [];
  }

  removeNotifyUser(user: string) {
    const index = this.newTimeline.notify.indexOf(user);
    if (index > -1) {
      this.newTimeline.notify.splice(index, 1);
    }
  }

  submitTimelineForm() {
    if (!this.selectedMember) {
      return;
    }

    this.timelineErrorMessage = '';
    if (!this.newTimeline.title?.trim()) {
      this.timelineErrorMessage = 'Title is required';
      return;
    }

    const firstFile = this.uploadedFiles.length ? this.uploadedFiles[0] : null;

    this.isSavingTimeline = true;
    this.suitFileService.createTimelineEntry(Number(this.selectedMember.id), {
      title: this.newTimeline.title.trim(),
      details: this.newTimeline.details?.trim() || undefined,
      hearingDate: this.newTimeline.date || undefined,
      hearingTime: this.newTimeline.time || undefined,
      documentName: firstFile?.name,
      documentSize: firstFile?.size,
      notifyUsers: [...this.newTimeline.notify]
    }).subscribe({
      next: () => {
        this.isSavingTimeline = false;
        this.showTimelineModal = false;
        this.showTimelineSuccess = true;
        this.resetTimelineForm();
        this.loadTimeline(Number(this.selectedMember!.id));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingTimeline = false;
        this.timelineErrorMessage = err?.error?.message || 'Failed to save timeline entry.';
        this.cdr.detectChanges();
      }
    });
  }

  closeTimelineSuccess() {
    this.showTimelineSuccess = false;
  }

  private resetTimelineForm() {
    this.newTimeline = { title: '', date: '', time: '', details: '', notify: [] };
    this.uploadedFiles = [];
    this.notifySearchInput = '';
    this.filteredNotifyUsers = [];
    this.showNotifyDropdown = false;
    this.timelineErrorMessage = '';
  }

  private mapMemberOption(m: SuitMemberOption): Member {
    return {
      id: String(m.id),
      name: m.name,
      avatar: this.resolveAvatar(m.photoUrl),
      joinedDate: m.joinedDate || '',
      status: 'Active',
      outstandingAmount: '₹ 0',
      enrolledGroups: []
    };
  }

  private resolveAvatar(photoUrl?: string): string {
    if (photoUrl && photoUrl !== 'string') {
      if (photoUrl.startsWith('http') || photoUrl.startsWith('assets/')) {
        return photoUrl;
      }
      if (photoUrl.startsWith('/')) {
        try {
          const urlObj = new URL(environment.apiUrl);
          return `${urlObj.protocol}//${urlObj.host}${photoUrl}`;
        } catch {
          return photoUrl;
        }
      }
    }
    return this.defaultAvatar;
  }

  private mapTimelineEntry(e: SuitTimelineEntry): TimelineEntry {
    const notify = Array.isArray(e.notify) ? e.notify : (e.notify ? [e.notify as unknown as string] : []);
    return {
      title: e.title,
      subtitle: e.subtitle,
      date: e.date,
      time: e.time,
      document: e.document,
      notify
    };
  }

  private formatStatus(status: string): string {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  private humanFileSize(size: number) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  }
}
