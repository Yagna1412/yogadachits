import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface LocationNode {
  id: string;
  name: string;
  type: 'state' | 'city' | 'area' | 'route';
  expanded: boolean;
  children?: LocationNode[];
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location.html',
  styleUrls: ['./location.scss'],
})
export class LocationComponent {
  constructor(private sanitizer: DomSanitizer) {}
  activeView: string = 'tree';
  selectedMember: string = '';
  selectedLocationType: string = '';
  selectedParentLocation: string = '';
  selectedLocationName: string = '';
  selectedDistrict: string = '';
  selectedCity: string = '';
  selectedRoute: string = '';

  locationHierarchy: LocationNode[] = [
    {
      id: '1',
      name: 'Telangana',
      type: 'state',
      expanded: true,
      children: [
        {
          id: '1-1',
          name: 'Hyderabad',
          type: 'city',
          expanded: true,
          children: [
            {
              id: '1-1-1',
              name: 'Central Area',
              type: 'area',
              expanded: false,
              children: [
                { id: '1-1-1-1', name: 'Route 1 - Main Road', type: 'route', expanded: false },
                { id: '1-1-1-2', name: 'Route 2 - Business District', type: 'route', expanded: false },
              ],
            },
            {
              id: '1-1-2',
              name: 'East Area',
              type: 'area',
              expanded: false,
              children: [
                { id: '1-1-2-1', name: 'Route 1 - Tech Park', type: 'route', expanded: false },
                { id: '1-1-2-2', name: 'Route 2 - IT Corridor', type: 'route', expanded: false },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Tamil Nadu',
      type: 'state',
      expanded: true,
      children: [
        {
          id: '2-1',
          name: 'Chennai',
          type: 'city',
          expanded: true,
          children: [
            {
              id: '2-1-1',
              name: 'South Chennai',
              type: 'area',
              expanded: true,
              children: [
                { id: '2-1-1-1', name: 'Route 1 - Main Road', type: 'route', expanded: false },
                { id: '2-1-1-2', name: 'Route 2 - GN Chetty Road', type: 'route', expanded: false },
              ],
            },
            {
              id: '2-1-2',
              name: 'T. Nagar Area',
              type: 'area',
              expanded: true,
              children: [
                { id: '2-1-2-1', name: 'Route 1 - Main Street', type: 'route', expanded: false },
                { id: '2-1-2-2', name: 'Route 2 - Business Street', type: 'route', expanded: false },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '3',
      name: 'Karnataka',
      type: 'state',
      expanded: true,
      children: [
        {
          id: '3-1',
          name: 'Bangalore',
          type: 'city',
          expanded: true,
          children: [
            {
              id: '3-1-1',
              name: 'Central Bangalore',
              type: 'area',
              expanded: true,
              children: [
                { id: '3-1-1-1', name: 'Route 1 - 80 Feet Road', type: 'route', expanded: false },
                { id: '3-1-1-2', name: 'Route 2 - Inner Ring Road', type: 'route', expanded: false },
              ],
            },
            {
              id: '3-1-2',
              name: 'Koramangala Area',
              type: 'area',
              expanded: false,
              children: [
                { id: '3-1-2-1', name: 'Route 1 - 4th Block', type: 'route', expanded: false },
                { id: '3-1-2-2', name: 'Route 2 - 5th Block', type: 'route', expanded: false },
              ],
            },
          ],
        },
      ],
    },
  ];

  mapmarkers = [
    { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
    { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
    { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    { lat: 13.1436, lng: 80.2348, name: 'T. Nagar' },
    { lat: 12.935, lng: 77.6245, name: 'Koramangala' },
  ];

  members = ['Srikanth', 'Rajesh', 'Priya', 'Amit', 'Sunita'];
  locationTypes = ['City', 'Area', 'Route'];
  parentLocations = ['Telangana', 'Tamil Nadu', 'Karnataka'];
  districts = ['Hyderabad', 'Chennai', 'Bangalore'];
  cities = ['Bangalore', 'Chennai', 'Hyderabad', 'Koramangala', 'T. Nagar'];
  routes = ['Route 1 - Main Road', 'Route 2 - Business District', 'Route 3 - Residential Area'];

  // Modal and form state
  showAddModal: boolean = false;
  showSuccessModal: boolean = false;
  successMessage: string = '';

  newLocation: {
    type: string;
    parent: string;
    name: string;
    pincode: string;
    lat?: number | null;
    lng?: number | null;
  } = { type: '', parent: '', name: '', pincode: '', lat: null, lng: null };

  switchView(view: string): void {
    this.activeView = view;
  }

  openAddModal(): void {
    this.newLocation = { type: '', parent: '', name: '', pincode: '', lat: null, lng: null };
    console.log('openAddModal called');
    this.showAddModal = true;
  }

  closeAddModal(): void {
    console.log('closeAddModal called');
    this.showAddModal = false;
  }

  saveLocation(): void {
    console.log('saveLocation called', this.newLocation);
    // create node
    const nodeType = this.newLocation.type ? this.newLocation.type.toLowerCase() : 'city';
    const newNode: LocationNode = {
      id: Date.now().toString(),
      name: this.newLocation.name,
      type: (nodeType as any) || 'city',
      expanded: false,
      latitude: this.newLocation.lat ?? undefined,
      longitude: this.newLocation.lng ?? undefined,
    };

    // find parent node
    if (this.newLocation.parent) {
      const parentNode = this.findNodeByName(this.newLocation.parent, this.locationHierarchy);
      if (parentNode) {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newNode);
      } else {
        // parent not found, push to root
        this.locationHierarchy.push(newNode);
      }
    } else {
      // no parent selected -> push to root
      this.locationHierarchy.push(newNode);
    }

    this.showAddModal = false;
    this.successMessage = 'Location added successfully.';
    this.showSuccessModal = true;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  findNodeByName(name: string, nodes: LocationNode[]): LocationNode | null {
    for (const n of nodes) {
      if (n.name === name) return n;
      if (n.children && n.children.length) {
        const found = this.findNodeByName(name, n.children);
        if (found) return found;
      }
    }
    return null;
  }

  getMapPreviewUrl(): string {
    if (this.newLocation.lat && this.newLocation.lng) {
      return `https://www.google.com/maps?q=${this.newLocation.lat},${this.newLocation.lng}&output=embed`;
    }
    // default blank map
    return 'about:blank';
  }

  getMapPreviewSafeUrl(): SafeResourceUrl {
    const base = 'https://www.google.com/maps?q=';
    let query = '';

    if (this.newLocation.lat && this.newLocation.lng) {
      query = `${this.newLocation.lat},${this.newLocation.lng}`;
    } else if (this.newLocation.name) {
      // build a human-readable query from name, parent and pincode
      const parts: string[] = [];
      if (this.newLocation.name) parts.push(this.newLocation.name);
      if (this.newLocation.parent) parts.push(this.newLocation.parent);
      if (this.newLocation.pincode) parts.push(this.newLocation.pincode);
      query = parts.join(', ');
    } else {
      // fallback to a sensible default location
      query = 'HITEC City, Hyderabad';
    }

    const url = `${base}${encodeURIComponent(query)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  editInMap(): void {
    // placeholder - in real app open a map editor; here we log for now
    console.log('Edit in map clicked');
  }

  toggleExpand(node: LocationNode): void {
    node.expanded = !node.expanded;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'state':
        return 'assets/images/icons/state.png';
      case 'city':
        return 'assets/images/icons/city.png';
      case 'area':
        return 'assets/images/icons/area.png';
      case 'route':
        return 'assets/images/icons/route.png';
      default:
        return 'assets/images/icons/city.png';
    }
  }

  getIconClass(type: string): string {
    return `icon-${type}`;
  }

  addTimelineEntry(): void {
    console.log('Adding timeline entry...');
  }
}

