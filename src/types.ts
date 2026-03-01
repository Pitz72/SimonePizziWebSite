export enum Category {
  VIDEOGIOCHI = 'videogiochi',
  PROGETTI_SOFTWARE = 'progetti-software',
  NARRATIVA_E_PUBBLICAZIONI = 'narrativa-e-pubblicazioni',
  PODCAST_AUDIO_ALTRO = 'podcast-audio-altro',
  BLOG_E_RIFLESSIONI = 'blog-e-riflessioni'
}

export interface PortfolioItem {
  id: number;
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
}
