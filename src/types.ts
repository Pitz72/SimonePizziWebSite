export enum Category {
  VIDEOGIOCHI = 'videogiochi',
  PROGETTI_SOFTWARE = 'progetti-software',
  NARRATIVA_E_PUBBLICAZIONI = 'narrativa-e-pubblicazioni',
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
  isVisible?: boolean;
}
