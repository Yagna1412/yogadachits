import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './suit-file.html',
  styleUrl: './suit-file.scss',
})
export class SuitFileInfoComponent {
  searchQuery: string = '';
  selectedMember: Member | null = null;
  showAddSuitModal: boolean = false;
  showSuccessModal: boolean = false;

  newSuit: any = {
    memberId: '',
    eventType: '',
    suitCause: '',
    suitDate: '',
    courtName: '',
    lawyerDetails: '',
    date: '',
    time: '',
    caseNumber: '',
    description: '',
    principal: null,
    interest: null,
    legalCost: null,
    incCharges: null,
    claimAmount: null,
    legalNoticeDate: ''
  };

  // Timeline modal state
  showTimelineModal: boolean = false;
  showTimelineSuccess: boolean = false;

  notifyUsers: string[] = ['Suresh Babu', 'Mahesh Naidu', 'Priya Sharma'];

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

  uploadedFiles: Array<{name: string; size: string; raw?: File}> = [];

  members: Member[] = [
    {
      id: '1',
      name: 'Srikanth Yadav',
      avatar: 'https://i.pravatar.cc/150?img=1',
      joinedDate: 'Mar 2023',
      status: 'Case Filed',
      outstandingAmount: '₹ 25,000',
      enrolledGroups: ['Golden Circle 2024', 'Silver Star 50']
    },
    {
      id: '2',
      name: 'Anjali Reddy',
      avatar: 'https://i.pravatar.cc/150?img=2',
      joinedDate: 'Mar 2023',
      status: 'Pending',
      outstandingAmount: '₹ 30,000',
      enrolledGroups: ['Golden Circle 2024']
    },
    {
      id: '3',
      name: 'Ravi Kumar Goud',
      avatar: 'https://i.pravatar.cc/150?img=3',
      joinedDate: 'Mar 2023',
      status: 'Active',
      outstandingAmount: '₹ 15,000',
      enrolledGroups: ['Silver Star 50']
    },
    {
      id: '4',
      name: 'Mahesh Naidu',
      avatar: 'https://i.pravatar.cc/150?img=4',
      joinedDate: 'Mar 2023',
      status: 'Active',
      outstandingAmount: '₹ 20,000',
      enrolledGroups: ['Golden Circle 2024', 'Silver Star 50']
    }
  ];

  suggestedMembers: Member[] = [
    this.members[1],
    this.members[2],
    this.members[3]
  ];

  searchResults: Member[] = [];

  timelineEntries: TimelineEntry[] = [
    {
      title: 'Legal Notice Sent',
      subtitle: 'First notice sent via registered post',
      date: 'Mar 19,2026',
      time: '03:30 PM'
    },
    {
      title: 'Notice Received',
      subtitle: 'Acknowledgement received',
      date: 'Mar 19,2026',
      time: '03:30 PM'
    },
    {
      title: 'Case Filed',
      subtitle: 'Case filed at Dist. Court - Case No. 2024/CH/1234',
      date: 'May 19,2026',
      time: '03:30 PM'
    },
    {
      title: 'First Hearing',
      subtitle: 'Defendant requested adjournment',
      date: 'June 19,2026',
      time: '03:30 PM',
      document: {
        name: 'First Hearing Imp.pdf',
        size: '5.3 MB'
      }
    },
    {
      title: 'Second Hearing',
      subtitle: 'OverviEvidence submission - Next hearing: Mar 19,2027 • 2 Hrs',
      date: '',
      time: '',
      document: {
        name: 'Second Hearing Imp.pdf',
        size: '5.3 MB'
      },
      notify: ['Suresh Babu', 'Mahesh Naidu']
    }
  ];

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.searchResults = [];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.searchResults = this.members.filter(member => 
        member.name.toLowerCase().includes(query)
      );
    }
  }

  selectMember(member: Member) {
    this.selectedMember = member;
    this.searchQuery = '';
    this.searchResults = [];
  }

  openAddSuitDialog() {
    this.showAddSuitModal = true;
  }

  closeAddSuitDialog() {
    this.showAddSuitModal = false;
  }

  submitSuitForm() {
    // Normally send `newSuit` to backend. Close form and show success dialog immediately.
    this.showAddSuitModal = false;
    this.showSuccessModal = true;

    // reset form
    this.newSuit = {
      memberId: '',
      eventType: '',
      suitCause: '',
      suitDate: '',
      courtName: '',
      lawyerDetails: '',
      date: '',
      time: '',
      caseNumber: '',
      description: '',
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

  // Timeline modal handlers
  openTimelineDialog() {
    this.showTimelineModal = true;
  }

  closeTimelineDialog() {
    this.showTimelineModal = false;
  }

  handleFileInput(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.uploadedFiles.push({ name: f.name, size: this.humanFileSize(f.size), raw: f });
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    const files = event.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.uploadedFiles.push({ name: f.name, size: this.humanFileSize(f.size), raw: f });
    }
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
    // create a timeline entry from form fields
    const entry: TimelineEntry = {
      title: this.newTimeline.title || 'Untitled',
      subtitle: this.newTimeline.details || '',
      date: this.newTimeline.date,
      time: this.newTimeline.time,
      document: this.uploadedFiles.length ? { name: this.uploadedFiles[0].name, size: this.uploadedFiles[0].size } : undefined,
      notify: this.newTimeline.notify && this.newTimeline.notify.length > 0 ? this.newTimeline.notify : undefined
    };
    // add to timeline
    this.timelineEntries.unshift(entry);

    // close modal and show success
    this.showTimelineModal = false;
    this.showTimelineSuccess = true;

    // reset form
    this.newTimeline = { title: '', date: '', time: '', details: '', notify: [] };
    this.uploadedFiles = [];
  }

  closeTimelineSuccess() {
    this.showTimelineSuccess = false;
  }

  private humanFileSize(size: number) {
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  }
}
