import type { BlogPost } from "@/types/blog";

export interface PublicBlogListMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface PublicBlogListResponse {
  message: string;
  data: BlogPost[];
  meta: PublicBlogListMeta;
}

export interface PublicBlogDetailResponse {
  message: string;
  data: BlogPost;
}

export interface PublicBlogParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  lang?: string;
}

export function usePublicPostsQuery(params: Ref<PublicBlogParams>) {
  return useAsyncData(
    () => `blog-list-${JSON.stringify(params.value)}`,
    () =>
      $fetch<PublicBlogListResponse>("/api/blog", {
        query: params.value,
      }),
    { watch: [params] },
  );
}

export function usePublicPostQuery(slug: Ref<string>, lang?: Ref<string>) {
  return useAsyncData(
    () => `blog-detail-${slug.value}-${lang?.value ?? ""}`,
    () =>
      $fetch<PublicBlogDetailResponse>(`/api/blog/${slug.value}`, {
        query: lang?.value ? { lang: lang.value } : undefined,
      }),
  );
}
