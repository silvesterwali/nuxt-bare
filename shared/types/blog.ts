// Shared Blog Types - digunakan oleh server & app
export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  language?: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  color: string;
  language?: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  language: string;
  status: "draft" | "published" | "archived";
  author: {
    id: number;
    name: string;
    email: string;
  };
  categories: BlogCategory[];
  tags: BlogTag[];
  featuredImage?: BlogFeaturedImage | null;
  featuredImageId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFeaturedImage {
  id: number;
  full_path: string;
  thumbnail?: {
    full_path: string;
  };
}

/**
 * Form input data - untuk submission ke API
 * Separate dari BlogPost karena format berbeda
 * (e.g., featuredImageId is number, bukan object)
 */
export interface BlogFormData {
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  status: "draft" | "published" | "archived";
  categoryIds?: number[];
  tagIds?: number[];
  featuredImageId?: number | null;
}
