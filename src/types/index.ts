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
