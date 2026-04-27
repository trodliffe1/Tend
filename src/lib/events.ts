import { supabase } from './supabase';

export interface Borough {
  slug: string;
  name: string;
}

export type EventCategory =
  | 'film'
  | 'food_and_drink'
  | 'music'
  | 'comedy'
  | 'theatre'
  | 'art'
  | 'market'
  | 'talks'
  | 'outdoor'
  | 'other';

export interface EventRow {
  id: string;
  source: string;
  external_id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  image_url: string | null;
  is_free: boolean | null;
  price_min_gbp: number | null;
  price_max_gbp: number | null;
  event_date: string;
  start_at: string;
  metadata: Record<string, any> | null;
  venue_name: string | null;
  venue_postcode: string | null;
  borough: string | null;
  lat: number | null;
  lon: number | null;
  url: string;
}

export interface EventFilters {
  boroughs?: string[];
  categories?: EventCategory[];
  startDate?: string;
  endDate?: string;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  film: 'Film',
  food_and_drink: 'Food & Drink',
  music: 'Music',
  comedy: 'Comedy',
  theatre: 'Theatre',
  art: 'Art',
  market: 'Market',
  talks: 'Talks',
  outdoor: 'Outdoor',
  other: 'Other',
};

export const SELECTABLE_CATEGORIES: EventCategory[] = [
  'film',
  'music',
  'theatre',
  'comedy',
  'art',
  'food_and_drink',
  'market',
  'talks',
  'outdoor',
];

export async function fetchBoroughs(): Promise<Borough[]> {
  const { data, error } = await supabase
    .from('boroughs')
    .select('slug, name')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

// Supabase/PostgREST default max row cap. We pull IDs (lightweight) up to this,
// then fetch only the chosen rows.
const ID_POOL_LIMIT = 1000;

function applyFilters<T extends { eq: any; in: any; gte: any; lte: any }>(
  query: T,
  filters: EventFilters
): T {
  let q = query;
  if (filters.boroughs && filters.boroughs.length > 0) {
    q = q.in('borough', filters.boroughs);
  }
  if (filters.categories && filters.categories.length > 0) {
    q = q.in('category', filters.categories);
  }
  if (filters.startDate) {
    q = q.gte('event_date', filters.startDate);
  }
  if (filters.endDate) {
    q = q.lte('event_date', filters.endDate);
  }
  return q;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Greedy diversity in 3 passes, strictest first:
//   1. distinct source AND distinct category
//   2. distinct source only (relax category)
//   3. anything goes (fill remaining slots)
// Picks the first time a candidate qualifies; later passes only see rows
// that didn't qualify earlier.
type Candidate = { id: string; source: string; category: string };

function diversifyPick(candidates: Candidate[], count: number): string[] {
  const picked: string[] = [];
  const usedSources = new Set<string>();
  const usedCategories = new Set<string>();
  const passOneLeftovers: Candidate[] = [];
  const passTwoLeftovers: Candidate[] = [];

  // Pass 1: distinct source AND distinct category
  for (const c of candidates) {
    if (picked.length >= count) break;
    if (usedSources.has(c.source) || usedCategories.has(c.category)) {
      passOneLeftovers.push(c);
      continue;
    }
    picked.push(c.id);
    usedSources.add(c.source);
    usedCategories.add(c.category);
  }

  // Pass 2: distinct source only
  for (const c of passOneLeftovers) {
    if (picked.length >= count) break;
    if (usedSources.has(c.source)) {
      passTwoLeftovers.push(c);
      continue;
    }
    picked.push(c.id);
    usedSources.add(c.source);
  }

  // Pass 3: fill the rest
  for (const c of passTwoLeftovers) {
    if (picked.length >= count) break;
    picked.push(c.id);
  }

  return picked;
}

export async function fetchRandomEvents(
  filters: EventFilters,
  count = 3
): Promise<EventRow[]> {
  // Step 1: pull (id, source, category) for the filtered set — lightweight payload.
  const idQuery = applyFilters(
    supabase.from('events').select('id, source, category').order('id'),
    filters
  ).limit(ID_POOL_LIMIT);

  const { data: idRows, error: idErr } = await idQuery;
  if (idErr) throw idErr;
  if (!idRows || idRows.length === 0) return [];

  // Step 2: shuffle, then greedily pick `count` IDs maximizing
  // (source, category) diversity.
  const shuffled = shuffleInPlace([...(idRows as Candidate[])]);
  const ids = diversifyPick(shuffled, count);

  // Step 3: fetch the chosen rows.
  const { data, error } = await supabase.from('events').select('*').in('id', ids);
  if (error) throw error;

  // Preserve the order we picked, since `.in()` doesn't guarantee it.
  const byId = new Map<string, EventRow>();
  for (const row of (data ?? []) as EventRow[]) byId.set(row.id, row);
  return ids.map(id => byId.get(id)).filter((r): r is EventRow => r !== undefined);
}
