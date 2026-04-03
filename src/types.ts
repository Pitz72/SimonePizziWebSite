export enum Category {
  VIDEOGIOCHI = 'videogiochi',
  PROGETTI_SOFTWARE = 'progetti-software',
  NARRATIVA_E_PUBBLICAZIONI = 'narrativa-e-pubblicazioni',
  PODCAST_AUDIO_ALTRO = 'podcast-audio-altro',
  BLOG_E_RIFLESSIONI = 'blog-e-riflessioni'
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  category: string;
  cover_image?: string;
  button_a_label?: string;
  button_a_url?: string;
  button_b_label?: string;
  button_b_url?: string;
  is_visible: number;
  sort_order: number;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  category: Category;
  tags: string[];
  link?: string;
  buttonText?: string;
  extraLink?: string;
  extraLinkText?: string;
  relatedLink?: string;
  relatedLinkText?: string;
  isVisible?: boolean;
  hasLetter?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  publishedAt?: string;
}
