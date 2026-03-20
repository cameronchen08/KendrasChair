export interface Client {
  id: string;
  name: string;
  profession: string;
  profDesc: string;
  pronouns: string;
  favService: string;
  website: string;
  notes: string;
  photo: string | null;
  portfolio: string[];
  instagram: string;
  tiktok: string;
  email: string;
  phone: string;
}

export type SortMode = 'default' | 'az' | 'za' | 'profession';
