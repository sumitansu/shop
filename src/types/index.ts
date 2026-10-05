export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PrivateVaultItem {
  id: string;
  ownerId: string;
  title: string;
  secretContent: string;
  category: 'api_key' | 'secret_note' | 'credentials' | 'financial' | 'confidential';
  createdAt: string;
  updatedAt: string;
}

export interface ChangeLogEntry {
  id: string;
  date: string;
  author: string;
  scope: string;
  files: string[];
  summary: string;
  details?: string;
}

export interface BlobItem {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  contentType?: string;
  contentDisposition?: string;
}

export interface PostItem {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export interface DbStatus {
  configured: boolean;
  connected: boolean;
  database?: string;
  tableExists?: boolean;
  postCount?: number;
  host?: string;
  error?: string;
}

export type TabType = 'overview' | 'vault' | 'blob' | 'database' | 'supabase' | 'auth' | 'vercel' | 'changelog';

