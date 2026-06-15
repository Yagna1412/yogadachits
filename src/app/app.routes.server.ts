import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/auctions',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/auctions/view/:auctionId',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/re-auction',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/member-management',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/bid-payments',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/bid-advance',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
