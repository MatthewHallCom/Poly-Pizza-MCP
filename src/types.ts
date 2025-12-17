export interface Model {
  id: string;
  title: string;
  description: string;
  attribution: string;
  thumbnail: string;
  download: string;
  triCount: number;
  creator: {
    name: string;
    url: string;
  };
  uploadDate: string;
  category: number;
  license: string;
  animated: boolean;
  orbit: {
    phi: number;
    theta: number;
    radius: number;
  };
}

export interface List {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    url: string;
  };
  models: Model[];
}

export interface SearchResult {
  total: number;
  results: Model[];
}

export interface User {
  username: string;
  displayPicture: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  models: Model[];
  lists: string[];
}

export type Category =
  | 'food-drink'
  | 'clutter'
  | 'weapons'
  | 'transport'
  | 'furniture-decor'
  | 'objects'
  | 'nature'
  | 'animals'
  | 'buildings-architecture'
  | 'people-characters'
  | 'scenes-levels'
  | 'other';

export type License = 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-ND' | 'CC-BY-NC' | 'CC-BY-NC-SA' | 'CC-BY-NC-ND';
