export const MOVEMENT_TYPES = [
  "resistance",
  "subculture",
  "student",
  "state",
  "political",
  "civic",
  "militaryYouth",
  "scouting",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type HistoricalImage = {
  src: string;
  alt: string;
  caption: string;
  year?: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl: string;
};

export type HistoricalSource = {
  title: string;
  publisher: string;
  url: string;
  type: "encyclopedia" | "archive" | "book" | "article" | "museum" | "official";
};

export type TimelineEvent = {
  year: string;
  title: string;
  text: string;
};

export type StorySection = {
  heading: string;
  body: string;
  /** Gallery image `src` values to show under this section on the full article page. */
  imageSrcs?: string[];
};

export type MovementFact = {
  label: string;
  value: string;
};

export const CONTENT_STATUSES = ["verified", "review", "weak"] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export type Movement = {
  slug: string;
  mapFeatureIds: string[];
  mapFeatureNames: string[];
  currentCountryName: string;
  historicalCountryName: string;
  title: string;
  originalTitle: string;
  alternativeNames: string[];
  fromYear: number;
  toYear: number;
  type: MovementType;
  types?: MovementType[];
  location: string;
  /** Internal review flag. Never render in public UI. */
  contentStatus: ContentStatus;
  /** Honest 1950-map caveat when the CShapes polygon is only an approximation. */
  geographyNote?: string;
  shortDescription: string;
  intro: string;
  timeline: TimelineEvent[];
  facts: MovementFact[];
  storySections: StorySection[];
  gallery: HistoricalImage[];
  sources: HistoricalSource[];
  tags: string[];
};

export type MovementSummary = {
  slug: string;
  mapFeatureIds: string[];
  mapFeatureNames: string[];
  currentCountryName: string;
  historicalCountryName: string;
  title: string;
  originalTitle: string;
  fromYear: number;
  toYear: number;
  type: MovementType;
  types: MovementType[];
  shortDescription: string;
};
