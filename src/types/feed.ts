export type Alignment = "west" | "neutral" | "both";

export type CategoryId =
  | "geopolitical"
  | "cyber"
  | "maritime"
  | "aviation"
  | "environmental"
  | "dark-web";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: CategoryId;
  alignment: Alignment;
  country?: string;
  description?: string;
}

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceId: string;
  sourceName: string;
  category: CategoryId;
  alignment: Alignment;
  publishedAt: string;
  imageUrl?: string;
  tags?: string[];
}

export interface AlertKeyword {
  id: string;
  keyword: string;
  categories?: CategoryId[];
  createdAt: string;
}

export interface AlertMatch {
  itemId: string;
  keyword: string;
  item: FeedItem;
  matchedAt: string;
}

export interface FeedState {
  items: FeedItem[];
  lastRefreshed: string | null;
  error?: string;
}
