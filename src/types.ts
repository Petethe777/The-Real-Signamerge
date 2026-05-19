export interface DemandResult {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn' | 'Reddit' | 'YouTube';
  content: string;
  views: string;
  likes: string;
  hashtags: string[];
  location: string;
  contactStatus: 'Verified Lead' | 'Hot Prospect';
  time: string;
  sourceUrl: string;
}
