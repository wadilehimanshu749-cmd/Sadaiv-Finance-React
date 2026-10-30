import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, LayoutGrid, ShieldCheck, Heart, Car, Plane, CheckCircle2, AlertCircle, FileText, Search, RefreshCw, BadgeCheck, ExternalLink, LoaderCircle,} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./Investment.module.css";

type CategoryKey = "health" | "term-life" | "motor" | "travel";
type TabKey = "all" | CategoryKey;
type SortKey = "relevance" | "premium-asc" | "cover-desc";
type JsonObject = Record<string, unknown>;

interface PolicyFact {
  key?: string;
  section?: string;
  display?: string;
  lablel?: string;
  label: string;
  value: string;
  clause?: string;
  page?: string;
  status?: string;
}

interface PolicyDocument {
  title: string;
  url?: string;
  type?: string;
}

interface Plan {
  id: string;
  productName: string;
  insurerName: string;
  insurerSlug?: string;
  category: CategoryKey;
  subCategory?: string;
  premiumRange?: { illustrativeMin?: number; illustrativeMax?: number };
  sumInsured?: { min?: number; max?: number };
  eligibility?: { minAge?: number; maxAge?: number };
  specialFeatures?: string[];
  lastVerified?: string;
  productUrl?: string;
  status?: string;
  policyFacts?: PolicyFact[];
}

interface PlanDetails {
  facts: PolicyFact[];
  documents: PolicyDocument[];
  productUrl?: string;
  raw: JsonObject;
}

interface FactSpec {
  key?: string;
  label: string;
  keywords: string[];
  exclude?: string[];
  base?: "cover" | "age";
}

interface ShownFact {
  section?: string;
  label: string;
  value: string;
  clause?: string;
  page?: string;
}

const API_BASE = "https://indiainsurances.com/api/v1";
const PAGE_SIZE = 12;
const API_CATEGORIES: CategoryKey[] = ["health", "term-life", "motor", "travel"];

const TABS: { key: TabKey; label: string; Icon: LucideIcon }[] = [
  { key: "all", label: "All", Icon: LayoutGrid },
  { key: "health", label: "Health Insurance", Icon: ShieldCheck },
  { key: "term-life", label: "Term Life", Icon: Heart },
  { key: "motor", label: "Motor Insurance", Icon: Car },
  { key: "travel", label: "Travel Insurance", Icon: Plane },
];

const CATEGORY_LABEL: Record<TabKey, string> = {
  all: "All",
  health: "Health Insurance",
  "term-life": "Term Life",
  motor: "Motor Insurance",
  travel: "Travel Insurance",
};

const LOGOS: Record<string, string> = {
  "hdfc-ergo": "hdfc-ergo.png",
  "icici-lombard": "icici-lombard.png",
  "bajaj-allianz": "bajaj-allianz.png",
  "tata-aig": "tata.png",
  "star-health": "star-health.png",
  "niva-bupa": "niva-bupa.jpg",
  "care-health": "care-health.png",
  "hdfc-life": "hdfc-ergo.png",
};

const BLANK_LOGO = "/assets/insurer/blank.png";
const logoFor = (slug?: string): string =>
  slug && LOGOS[slug] ? `/assets/insurer/${LOGOS[slug]}` : BLANK_LOGO;

const inr = new Intl.NumberFormat("en-IN");
const formatAmount = (n: number): string => `₹${inr.format(n)}`;
const compactAmount = (n: number): string => {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} L`;
  return formatAmount(n);
};

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isObject = (v: unknown): v is JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isCategory = (v: unknown): v is CategoryKey =>
  typeof v === "string" && (API_CATEGORIES as string[]).includes(v);

function firstValue(obj: JsonObject, keys: string[]): unknown {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (isObject(value)) {
    const nested = firstValue(value, ["name", "title", "label", "slug", "value"]);
    if (nested !== undefined) return stringValue(nested);
  }
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  if (isNum(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    if (match) {
      const n = Number(match[0]);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function getArrayFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isObject(data)) return [];

  for (const key of ["policies", "products", "items", "results", "records"]) {
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  if (isObject(data.data)) return getArrayFromResponse(data.data);
  if (Array.isArray(data.data)) return data.data;
  if (isObject(data.result)) return getArrayFromResponse(data.result);
  return [];
}

function normaliseFeatures(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!isObject(item)) return "";
      return stringValue(firstValue(item, ["label", "name", "title", "value", "description"])) ?? "";
    })
    .filter(Boolean);
}

function mapProduct(value: unknown, category: CategoryKey, index: number): Plan | null {
  if (!isObject(value)) return null;
  const insurerValue = firstValue(value, ["insurerName", "insurer_name", "insurer", "company", "provider"]);
  const productName = stringValue(
    firstValue(value, ["productName", "product_name", "name", "title", "policy_name", "display_name"])
  );
  const uin = stringValue(firstValue(value, ["uin", "productUin", "product_uin", "product_id", "id"]));
  if (!productName && !uin) return null;

  const insurerObject = isObject(insurerValue) ? insurerValue : undefined;
  const insurerName =
    stringValue(insurerValue) ??
    (insurerObject ? stringValue(firstValue(insurerObject, ["name", "insurer_name", "title"])) : undefined) ??
    "Insurer not specified";
  const insurerSlug =
    stringValue(firstValue(value, ["insurerSlug", "insurer_slug"])) ??
    (insurerObject ? stringValue(firstValue(insurerObject, ["slug", "insurer_slug"])) : undefined);

  const premiumObject = firstValue(value, ["premiumRange", "premium_range", "premium"]);
  const premium = isObject(premiumObject) ? premiumObject : {};
  const coverObject = firstValue(value, ["sumInsured", "sum_insured", "cover", "coverage"]);
  const cover = isObject(coverObject) ? coverObject : {};
  const eligibilityObject = firstValue(value, ["eligibility", "age_eligibility", "entry_age"]);
  const eligibility = isObject(eligibilityObject) ? eligibilityObject : {};
  const categoryValue = stringValue(firstValue(value, ["category", "category_slug"]));
  const mappedCategory = isCategory(categoryValue) ? categoryValue : category;
  const productUrl = stringValue(firstValue(value, ["url", "product_url", "page_url", "canonical_url", "href"]));

  const premiumMin = numberValue(firstValue(premium, ["illustrativeMin", "illustrative_min", "min", "minimum", "min_amount"]));
  const premiumMax = numberValue(firstValue(premium, ["illustrativeMax", "illustrative_max", "max", "maximum", "max_amount"]));
  const coverMin = numberValue(firstValue(cover, ["min", "minimum", "min_amount", "sum_insured_min"]));
  const coverMax = numberValue(firstValue(cover, ["max", "maximum", "max_amount", "sum_insured_max"]));
  const minAge = numberValue(firstValue(eligibility, ["minAge", "min_age", "minimum", "min"]));
  const maxAge = numberValue(firstValue(eligibility, ["maxAge", "max_age", "maximum", "max"]));

  return {
    id: uin ?? `policy-${category}-${index}`,
    productName: productName ?? uin ?? "Insurance product",
    insurerName,
    insurerSlug,
    category: mappedCategory,
    subCategory: stringValue(firstValue(value, ["subCategory", "sub_category", "line", "type", "product_type"])),
    premiumRange:
      premiumMin !== undefined || premiumMax !== undefined
        ? { illustrativeMin: premiumMin, illustrativeMax: premiumMax }
        : undefined,
    sumInsured: coverMin !== undefined || coverMax !== undefined ? { min: coverMin, max: coverMax } : undefined,
    eligibility: minAge !== undefined || maxAge !== undefined ? { minAge, maxAge } : undefined,
    specialFeatures: normaliseFeatures(firstValue(value, ["specialFeatures", "special_features", "features", "benefits", "highlights"])),
    lastVerified: stringValue(firstValue(value, ["lastVerified", "last_verified", "verified_at", "updated_at", "last_updated"])),
    productUrl,
    status: stringValue(firstValue(value, ["status", "product_status"])),
    policyFacts: collectFacts(value),
  };
}

function formatRange(min?: number, max?: number, fmt: (n: number) => string = formatAmount): string | null {
  if (!isNum(min) && !isNum(max)) return null;
  if (isNum(min) && isNum(max) && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  const only = isNum(min) ? min : isNum(max) ? max : null;
  return only === null ? null : fmt(only);
}

function displayStatus(status?: string): string | undefined {
  if (!status) return undefined;
  if (status.toLowerCase() === "not-stated" || status.toLowerCase() === "not stated") {
    return "Not stated in policy documents";
  }
  return status.replace(/[-_]/g, " ");
}

function conciseText(value: string, maxLength = 150): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function shortValue(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const first = clean.match(/^.+?[.;](?=\s|$)/)?.[0]?.replace(/[.;]$/, "");
  return conciseText(first && first.length >= 8 && first.length <= max ? first : clean, max);
}

const NOT_STATED = /^(not[\s-]?stated|not available|not specified|n\/a|unknown)/i;

function isStated(fact: PolicyFact): boolean {
  const value = fact.value.trim();
  if (!value || NOT_STATED.test(value)) return false;
  const status = (fact.status ?? "").toLowerCase();
  return status !== "not-stated" && status !== "not stated";
}

const LABEL_KEYS = ["lablel", "label", "field", "name", "question", "topic", "title", "key"];
const STATUS_KEYS = ["status", "check_status", "verification_status"];
const VALUE_KEYS = ["display", "value", "answer", "result", "summary", "finding", "description", "details", "detail", "explanation", "plain_english"];
const QUOTE_KEYS = ["quote", "source_quote", "verbatim", "verbatim_quote", "excerpt", "text", "evidence"];
const CLAUSE_KEYS = ["clause", "clause_title", "section", "clause_id"];
const PAGE_KEYS = ["page", "page_number", "pages"];
const META_KEYS = new Set([
  ...LABEL_KEYS,
  ...STATUS_KEYS,
  ...CLAUSE_KEYS,
  ...PAGE_KEYS,
  "section",
  "display",
  "lablel",
  "key",
  "id",
  "uin",
  "url",
  "slug",
  "type",
  "category",
  "law",
  "document",
  "document_id",
  "source",
  "confidence",
  "created_at",
  "updated_at",
]);
const STATUS_ONLY = /^(cross[\s-]?checked|verified|confirmed|extracted|stated|checked|reviewed|pending|ok)$/i;

function richText(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const parts = value.map(richText).filter((p): p is string => !!p);
    return parts.length ? parts.join("; ") : undefined;
  }
  if (isObject(value)) {
    const parts = Object.entries(value)
      .map(([k, v]) => {
        const t = richText(v);
        return t ? `${k.replace(/[-_]/g, " ")}: ${t}` : "";
      })
      .filter(Boolean);
    return parts.length ? parts.join("; ") : undefined;
  }
  return stringValue(value);
}

function collectFacts(value: unknown): PolicyFact[] {
  const found: PolicyFact[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown, depth = 0): void => {
    if (depth > 5 || !isObject(node)) return;
    for (const [key, child] of Object.entries(node)) {
      if (["facts", "fields", "key_facts", "keyFacts", "answers"].includes(key)) {
        const entries: unknown[] = Array.isArray(child)
          ? child
          : isObject(child)
            ? Object.entries(child).map(([factKey, factValue]) =>
                isObject(factValue) ? { field: factKey, ...factValue } : { field: factKey, value: factValue }
              )
            : [];
        for (const entry of entries) {
          if (!isObject(entry)) continue;
          const label = stringValue(firstValue(entry, LABEL_KEYS));
          if (!label) continue;
          const status = stringValue(firstValue(entry, STATUS_KEYS));

          let valueText: string | undefined;
          for (const k of VALUE_KEYS) {
            const t = richText(entry[k]);
            if (t && !STATUS_ONLY.test(t.trim())) {
              valueText = t;
              break;
            }
          }

          if (!valueText) {
            valueText = Object.entries(entry)
              .filter(([k]) => !META_KEYS.has(k) && !VALUE_KEYS.includes(k) && !QUOTE_KEYS.includes(k))
              .map(([, v]) => richText(v))
              .filter((t): t is string => !!t && !STATUS_ONLY.test(t.trim()))
              .sort((a, b) => b.length - a.length)[0];
          }

          const text = valueText ?? richText(entry.value) ?? displayStatus(status) ?? "Not stated in policy documents";
          const signature = `${label.toLowerCase()}|${text.toLowerCase()}`;
          if (seen.has(signature)) continue;
          seen.add(signature);
          found.push({
            key: stringValue(entry.key),
            section: stringValue(entry.section),
            display: stringValue(entry.display),
            lablel: stringValue(entry.lablel),
            label: stringValue(firstValue(entry, ["lablel", "label", "field", "name", "question", "topic", "title"])) ?? label,
            value: stringValue(entry.display) ?? text,
            clause: richText(firstValue(entry, CLAUSE_KEYS)),
            page: richText(firstValue(entry, PAGE_KEYS)),
            status,
          });
        }
      }
      if (isObject(child)) visit(child, depth + 1);
    }
  };
  visit(value);
  return found;
}

const FACT_SPECS: Record<CategoryKey, { card: FactSpec[]; detail: FactSpec[] }> = {
  health: {
    card: [
      { key: "premium_modes", label: "Premium payment modes", keywords: ["premium mode", "premium payment mode"] },
      { key: "eligibility_entry_age", label: "Entry age", keywords: ["entry age", "age at entry", "eligibility"], base: "age" },
      { key: "grace_period", label: "Grace period", keywords: ["grace period", "grace"] },
      { key: "lifelong_renewal", label: "Lifelong renewal", keywords: ["lifelong renewal", "life-long renewal", "renewal for life"] },
      { key: "sum_insured_options", label: "Sum insured options", keywords: ["sum insured options", "sum insured", "cover amount", "coverage amount"], base: "cover" },
      { key: "illness_list", label: "Illness list", keywords: ["illness list", "list of illnesses", "covered illnesses"] },
    ],
    detail: [
      { label: "Pre-hospitalisation", keywords: ["pre-hospital", "pre hospital"] },
      { label: "Post-hospitalisation", keywords: ["post-hospital", "post hospital"] },
      { label: "Day-care treatments", keywords: ["day-care", "day care"] },
      { label: "Pre-existing waiting", keywords: ["pre-existing"] },
      { label: "Specific illness waiting", keywords: ["specific disease", "specific illness", "named ailment"] },
      { label: "Restoration", keywords: ["restoration", "recharge", "reinstatement"] },
      { label: "No-claim bonus", keywords: ["no claim bonus", "no-claim", "cumulative bonus"] },
      { label: "Newborn cover", keywords: ["newborn", "new born", "new-born"] },
      { label: "Modern treatments", keywords: ["modern treatment", "advanced treatment"] },
      { label: "Policy term", keywords: ["policy term", "policy period", "period of insurance"] },
      { label: "Key exclusions", keywords: ["exclusion"] },
    ],
  },
  "term-life": {
    card: [
      { key: "policy_term", label: "Policy term", keywords: ["policy term", "policy period", "coverage period"] },
      { key: "sum_assured", label: "Sum assured", keywords: ["sum assured", "life cover", "cover amount"], base: "cover" },
      { key: "death_benefit", label: "Death benefit", keywords: ["death benefit", "payout option"] },
      { key: "premium_paying_term", label: "Premium paying term", keywords: ["premium paying term", "premium payment term", "payment term"] },
      { key: "revival", label: "Policy revival", keywords: ["revival", "revive policy"] },
      { key: "policy_loan", label: "Policy loan", keywords: ["policy loan", "loan facility"] },
      { key: "grace_period", label: "Grace period", keywords: ["grace period", "grace"] },
      { key: "eligibility_entry_age", label: "Entry age", keywords: ["entry age", "age at entry", "eligibility"], base: "age" },
      { key: "premium_modes", label: "Premium payment modes", keywords: ["premium mode", "premium payment mode"] },
    ],
    detail: [
      { label: "Maturity benefit", keywords: ["maturity benefit", "survival benefit"] },
      { label: "Suicide clause", keywords: ["suicide"] },
      { label: "Riders", keywords: ["rider", "accidental death", "critical illness"] },
      { label: "Free-look period", keywords: ["free look", "free-look"] },
      { label: "Surrender / paid-up", keywords: ["surrender", "paid-up", "paid up"] },
      { label: "Waiting period", keywords: ["waiting period"] },
      { label: "Key exclusions", keywords: ["exclusion"] },
    ],
  },
  motor: {
    card: [
      { key: "pa_owner_driver", label: "Owner-driver personal accident", keywords: ["owner driver", "owner-driver", "personal accident"] },
      { key: "cover_types", label: "Cover types", keywords: ["cover types", "own damage", "third party", "comprehensive", "coverage type"] },
      { key: "perils", label: "Covered perils", keywords: ["perils", "covered risks", "risks covered"] },
      { key: "policy_term", label: "Policy term", keywords: ["policy term", "policy period", "period of insurance"] },
    ],
    detail: [
      { label: "Vehicle eligibility", keywords: ["vehicle type", "vehicle eligibility", "eligible vehicle"] },
      { label: "Insured value (IDV)", keywords: ["idv", "insured declared"] },
      { label: "Roadside assistance", keywords: ["roadside"] },
      { label: "Deductible / excess", keywords: ["deductible", "excess"] },
      { label: "No-claim bonus", keywords: ["no claim bonus", "ncb", "claim bonus"] },
      { label: "Add-on covers", keywords: ["add-on", "add on", "zero depreciation"] },
      { label: "Claim conditions", keywords: ["claim", "conditions"] },
      { label: "Key exclusions", keywords: ["exclusion"] },
    ],
  },
  travel: {
    card: [
      { key: "eligibility_entry_age", label: "Entry age", keywords: ["entry age", "traveller age", "eligibility", "age limit"], base: "age" },
      { key: "max_trip_days", label: "Maximum trip duration", keywords: ["maximum trip", "trip duration", "travel duration", "days per trip"] },
      { key: "passport_loss", label: "Passport loss", keywords: ["passport"] },
      { key: "trip_cancellation", label: "Trip cancellation", keywords: ["trip cancellation", "cancellation"] },
      { key: "medical_cover", label: "Medical cover", keywords: ["medical expenses", "emergency medical", "medical cover"] },
    ],
    detail: [
      { label: "Destination", keywords: ["destination", "geographical scope", "region", "territory"] },
      { label: "Emergency assistance", keywords: ["emergency assistance", "repatriation", "evacuation"] },
      { label: "Trip delay", keywords: ["delay"] },
      { label: "Baggage", keywords: ["baggage", "checked-in baggage", "lost luggage"] },
      { label: "Deductible", keywords: ["deductible", "excess"] },
      { label: "Pre-existing conditions", keywords: ["pre-existing"] },
      { label: "Key exclusions", keywords: ["exclusion"] },
    ],
  },
};

function baseValue(plan: Plan, base?: FactSpec["base"]): string | undefined {
  if (base === "cover") {
    return formatRange(plan.sumInsured?.min, plan.sumInsured?.max, compactAmount) ?? undefined;
  }
  if (base === "age") {
    const age = plan.eligibility;
    if (!age) return undefined;
    const range = formatRange(age.minAge, age.maxAge, (n) => `${n}`);
    return range ? `${range} yrs` : undefined;
  }
  return undefined;
}

function matchFact(facts: PolicyFact[], spec: FactSpec, used: Set<number>): number {
  return facts.findIndex((fact, i) => {
    if (used.has(i) || !isStated(fact)) return false;
    const label = fact.label.toLowerCase();
    if (spec.key && fact.key?.toLowerCase() === spec.key.toLowerCase()) return true;
    if (spec.key && fact.key) return false;
    if (spec.exclude?.some((word) => label.includes(word))) return false;
    return spec.keywords.some((keyword) => label.includes(keyword));
  });
}

function resolveFacts(
  plan: Plan,
  facts: PolicyFact[],
  specs: FactSpec[],
  used: Set<number>,
  valueMax: number,
  limit: number
): { shown: ShownFact[]; missing: string[] } {
  const shown: ShownFact[] = [];
  const missing: string[] = [];
  for (const spec of specs) {
    if (shown.length >= limit) break;
    const index = matchFact(facts, spec, used);
    if (index >= 0) {
      used.add(index);
      const fact = facts[index];
      shown.push({
        section: fact.section,
        label: fact.label,
        value: shortValue(fact.value, valueMax),
        clause: fact.clause,
        page: fact.page,
      });
      continue;
    }
    const fromList = baseValue(plan, spec.base);
    if (fromList) shown.push({ label: spec.label, value: fromList });
    else missing.push(spec.label);
  }
  return { shown, missing };
}

function dedupeFacts(facts: PolicyFact[]): PolicyFact[] {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = `${fact.label}|${fact.value}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectDocuments(value: unknown): PolicyDocument[] {
  const docs: PolicyDocument[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown, depth = 0): void => {
    if (depth > 5 || !isObject(node)) return;
    for (const [key, child] of Object.entries(node)) {
      if (["documents", "sources", "policy_documents", "policyDocuments"].includes(key) && Array.isArray(child)) {
        for (const entry of child) {
          if (!isObject(entry)) continue;
          const title = stringValue(firstValue(entry, ["title", "name", "label", "document_type", "type"])) ?? "Policy document";
          const url = stringValue(firstValue(entry, ["url", "href", "document_url", "download_url", "source_url"]));
          const signature = `${title}|${url ?? ""}`;
          if (!seen.has(signature)) {
            seen.add(signature);
            docs.push({ title, url, type: stringValue(firstValue(entry, ["type", "document_type"])) });
          }
        }
      }
      if (isObject(child)) visit(child, depth + 1);
    }
  };
  visit(value);
  return docs;
}

async function requestJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`IndiaInsurances API returned HTTP ${response.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }
  return response.json() as Promise<unknown>;
}

async function fetchCategory(category: CategoryKey, signal?: AbortSignal): Promise<Plan[]> {
  const params = new URLSearchParams({
    category,
    status: "active",
    limit: "50",
    offset: "0",
  });
  const data = await requestJson(`${API_BASE}/policies?${params.toString()}`, signal);
  return getArrayFromResponse(data)
    .map((item, index) => mapProduct(item, category, index))
    .filter((item): item is Plan => item !== null);
}

async function fetchProductDetails(plan: Plan, signal?: AbortSignal): Promise<PlanDetails> {
  const uin = plan.id;
  if (!uin || uin.startsWith("policy-")) {
    throw new Error("This product does not include a UIN, so detailed policy information cannot be loaded.");
  }
  const raw = await requestJson(`${API_BASE}/policy/${encodeURIComponent(uin)}`, signal);
  const root = isObject(raw) ? raw : { data: raw };
  return {
    facts: collectFacts(root),
    documents: collectDocuments(root),
    productUrl: stringValue(firstValue(root, ["url", "product_url", "page_url", "canonical_url"])) ?? plan.productUrl,
    raw: root,
  };
}

export default function Investment() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [category, setCategory] = useState<TabKey>("all");
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [visible, setVisible] = useState<number>(PAGE_SIZE);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, PlanDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});
  const [detailsError, setDetailsError] = useState<Record<string, string>>({});

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoading(true);
    setFailed([]);
    try {
      const results = await Promise.allSettled(API_CATEGORIES.map((c) => fetchCategory(c, signal)));
      if (signal?.aborted) return;
      const ok = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .map((r) => (r.reason instanceof Error ? r.reason.message : "Unknown error"));
      const deduped = new Map<string, Plan>();
      for (const plan of ok) {
        const key = plan.id || `${plan.productName}|${plan.insurerName}`;
        if (!deduped.has(key)) deduped.set(key, plan);
      }
      setPlans(Array.from(deduped.values()));
      setFailed(errors);
    } catch (error) {
      if (signal?.aborted) return;
      setPlans([]);
      setFailed([error instanceof Error ? error.message : "Unable to load insurance products."]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [category, query, sort]);

  const counts = useMemo(() => {
    const c: Partial<Record<TabKey, number>> = { all: plans.length };
    for (const p of plans) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [plans]);

  const filtered = useMemo<Plan[]>(() => {
    const q = query.trim().toLowerCase();
    const list = plans.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || `${p.productName} ${p.insurerName} ${p.subCategory ?? ""} ${p.id}`.toLowerCase().includes(q))
    );
    const keys: Partial<Record<SortKey, (p: Plan) => number>> = {
      "premium-asc": (p) => p.premiumRange?.illustrativeMin ?? Infinity,
      "cover-desc": (p) => -(p.sumInsured?.max ?? 0),
    };
    const key = keys[sort];
    return key ? [...list].sort((a, b) => key(a) - key(b)) : list;
  }, [plans, category, query, sort]);

  const allFailed = !loading && plans.length === 0 && failed.length > 0;

  const toggleDetails = useCallback(
    async (plan: Plan) => {
      const key = plan.id;
      if (expanded[key]) {
        setExpanded((current) => ({ ...current, [key]: false }));
        return;
      }
      setExpanded((current) => ({ ...current, [key]: true }));
      if (details[key] || detailsLoading[key]) return;
      setDetailsLoading((current) => ({ ...current, [key]: true }));
      setDetailsError((current) => ({ ...current, [key]: "" }));
      try {
        const result = await fetchProductDetails(plan);
        setDetails((current) => ({ ...current, [key]: result }));
      } catch (error) {
        setDetailsError((current) => ({
          ...current,
          [key]: error instanceof Error ? error.message : "Could not load policy details.",
        }));
      } finally {
        setDetailsLoading((current) => ({ ...current, [key]: false }));
      }
    },
    [details, detailsLoading, expanded]
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => window.history.back()} aria-label="Go back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>Investment</h1>
          <p>Grow your wealth, secure your future</p>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h2>Smart Investments for a Better Tomorrow</h2>
          <p>Explore insurance plans and secure your future with the right protection</p>
          <button className={`${styles.btn} ${styles.btnPill}`} onClick={() => setCategory("all")}>
            View All Plans <ArrowRight size={16} />
          </button>
        </div>
        <img className={styles.heroImg} src="/images/heroimage.png" alt="" />
      </section>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Insurance categories">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={category === key}
              className={`${styles.tab} ${category === key ? styles.active : ""}`}
              onClick={() => setCategory(key)}
            >
              <Icon size={16} />
              {label}
              {!loading && <span className={styles.tabCount}>{counts[key] ?? 0}</span>}
            </button>
          ))}
        </div>
        <div className={styles.controls}>
          <label className={styles.search}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search plan or insurer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort plans"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="premium-asc">Premium: low to high</option>
            <option value="cover-desc">Highest cover</option>
          </select>
        </div>
      </div>

      <div className={styles.layout}>
        <main>
          <div className={styles.sectionHead}>
            <h2>Insurance Plans</h2>
            {!loading && <span>{filtered.length} plans</span>}
          </div>

          {failed.length > 0 && (
            <div className={styles.alert} role="alert">
              <AlertCircle size={20} />
              <p>
                {allFailed
                  ? `We couldn’t load insurance plans. ${failed[0]}`
                  : `Some categories didn’t load: ${failed.join("; ")}.`}
              </p>
              <button className={styles.btn} onClick={() => void load()}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {loading && [0, 1, 2].map((i) => <div key={i} className={styles.skeleton} />)}

          {!loading && !allFailed && filtered.length === 0 && (
            <div className={styles.empty}>
              <FileText size={44} />
              <h3>No plans found</h3>
              <p>Try another category or clear your search.</p>
            </div>
          )}

          {!loading &&
            filtered.slice(0, visible).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                open={!!expanded[plan.id]}
                details={details[plan.id]}
                detailsLoading={!!detailsLoading[plan.id]}
                detailsError={detailsError[plan.id]}
                onToggle={() => void toggleDetails(plan)}
              />
            ))}

          {!loading && filtered.length > visible && (
            <button className={styles.more} onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Show more plans ({filtered.length - visible} left)
            </button>
          )}
        </main>

        <aside className={styles.aside}>
          <div className={styles.panel}>
            <BadgeCheck size={22} />
            <h3>Compare before you buy</h3>
            <p>
              Premiums are shown only when supplied by the source. Actual premiums may vary by age, city and cover.
              Confirm exact terms with the insurer.
            </p>
          </div>
          <div className={styles.panel}>
            <ShieldCheck size={22} />
            <h3>Source-backed policy details</h3>
            <p>
              Detailed policy facts may include limits, waiting periods, co-payments and exclusions with references to
              source clauses and pages.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  open: boolean;
  details?: PlanDetails;
  detailsLoading: boolean;
  detailsError?: string;
  onToggle: () => void;
}

function PlanCard({ plan, open, details, detailsLoading, detailsError, onToggle }: PlanCardProps) {
  const planType = plan.subCategory || CATEGORY_LABEL[plan.category] || "Insurance plan";
  const statusLabel = plan.status ? (displayStatus(plan.status) ?? "Listed by source") : "Listed by source";
  const isActive = plan.status?.trim().toLowerCase() === "active";
  const features = plan.specialFeatures ?? [];
  const shownFeatures = open ? features : features.slice(0, 3);

  const apiFacts = dedupeFacts([...(details?.facts ?? []), ...(plan.policyFacts ?? [])]);
  const specs = FACT_SPECS[plan.category];
  const used = new Set<number>();
  const premiumText = formatRange(plan.premiumRange?.illustrativeMin, plan.premiumRange?.illustrativeMax, formatAmount);
  const key = resolveFacts(plan, apiFacts, specs.card, used, Infinity, specs.card.length);
  const keyFacts: ShownFact[] = premiumText
    ? [{ label: "Premium (illustrative)", value: premiumText }, ...key.shown]
    : key.shown;
  let detailFacts: ShownFact[] = [];
  let notStated: string[] = [];

  if (open && details) {
    const more = resolveFacts(plan, apiFacts, specs.detail, used, Infinity, 8);
    detailFacts = more.shown;
    if (detailFacts.length < 5) {
      apiFacts.forEach((fact, i) => {
        if (used.has(i) || !isStated(fact) || detailFacts.length >= 6) return;
        used.add(i);
        detailFacts.push({
          section: fact.section,
          label: fact.label,
          value: fact.value,
          clause: fact.clause,
          page: fact.page,
        });
      });
    }
    notStated = [...key.missing, ...more.missing].slice(0, 5);
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <img
          className={styles.cardLogo}
          src={logoFor(plan.insurerSlug)}
          alt={plan.insurerName}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.src.endsWith(BLANK_LOGO)) img.src = BLANK_LOGO;
          }}
        />
        <div className={styles.cardTitle}>
          <span title={plan.insurerName}>{plan.insurerName}</span>
          <h3>{plan.productName}</h3>
          {plan.subCategory && <em>{plan.subCategory}</em>}
        </div>
        <span className={styles.badge}>{CATEGORY_LABEL[plan.category] ?? "Insurance"}</span>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt>Plan type</dt>
          <dd>{planType}</dd>
        </div>
        <div>
          <dt>Policy status</dt>
          <dd className={isActive ? styles.statusActive : undefined}>
            {isActive && <span className={styles.statusDot} aria-hidden="true" />}
            {statusLabel}
          </dd>
        </div>
        <div>
          <dt>Policy ID (UIN)</dt>
          <dd>{plan.id.startsWith("policy-") ? "Not provided" : plan.id}</dd>
        </div>
      </dl>

      {features.length > 0 && (
        <div className={styles.features}>
          <h4>Highlights</h4>
          <ul>
            {shownFeatures.map((feature, index) => (
              <li key={`${feature}-${index}`}>
                <CheckCircle2 size={15} /> {feature}
              </li>
            ))}
          </ul>
          {features.length > 3 && (
            <button className={styles.link} onClick={onToggle}>
              {open ? "Show less" : `+${features.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {keyFacts.length > 0 && (
        <div className={styles.policyFacts}>
          <dl className={styles.factGrid}>
            {keyFacts.map((fact) => (
              <div className={styles.fact} key={fact.label}>
                {fact.section && <span className={styles.factSection}>{fact.section}</span>}
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>
                  {fact.value}
                  {(fact.clause || fact.page) && (
                    <span className={styles.detailMeta}>
                      {" "}
                      ({[fact.clause && `Clause ${fact.clause}`, fact.page && `p. ${fact.page}`].filter(Boolean).join(", ")})
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {open && (
        <div className={styles.features}>
          {detailFacts.length > 0 && <h4 className={styles.subHead}>More policy details</h4>}
          {detailsLoading && !details && (
            <p className={styles.detailsNote}>
              <LoaderCircle size={15} /> Loading policy details…
            </p>
          )}
          {detailsError && (
            <p role="alert" className={styles.detailsNote}>
              {detailsError}
            </p>
          )}
          {details && (
            <>
              {detailFacts.length > 0 ? (
                <ul className={styles.detailList}>
                  {detailFacts.map((fact) => (
                    <li key={fact.label}>
                      <CheckCircle2 size={15} />
                      <span>
                        <strong>{fact.label}:</strong> {fact.value}
                        {(fact.clause || fact.page) && (
                          <span className={styles.detailMeta}>
                            {" "}
                            ({[fact.clause && `Clause ${fact.clause}`, fact.page && `p. ${fact.page}`].filter(Boolean).join(", ")})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {notStated.length > 0 && (
                <p className={styles.detailsNote}>Not stated in the returned data: {notStated.join(", ")}.</p>
              )}
              {details.documents.length > 0 && (
                <>
                  <h4 className={styles.subHead}>Policy documents</h4>
                  <ul>
                    {details.documents.slice(0, 3).map((doc, index) => (
                      <li key={`${doc.title}-${index}`}>
                        <FileText size={15} />
                        {doc.url ? (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.title} <ExternalLink size={12} />
                          </a>
                        ) : (
                          doc.title
                        )}
                      </li>
                    ))}
                  </ul>
                  {details.documents.length > 3 && (
                    <p className={styles.detailsNote}>Showing 3 documents. See the source for all documents.</p>
                  )}
                </>
              )}
              {(details.productUrl || plan.productUrl) && (
                <p className={styles.detailsNote}>
                  <a href={details.productUrl ?? plan.productUrl} target="_blank" rel="noopener noreferrer">
                    Open IndiaInsurances source <ExternalLink size={12} />
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      )}

      <footer className={styles.cardFoot}>
        <small>
          {plan.lastVerified
            ? `Source updated ${plan.lastVerified}`
            : plan.status
              ? `Status: ${plan.status}`
              : `UIN: ${plan.id}`}
        </small>
        <button className={styles.btn} onClick={onToggle} aria-expanded={open}>
          {open && detailsLoading && !details ? (
            <>
              <LoaderCircle size={14} /> Loading
            </>
          ) : open ? (
            "Hide details"
          ) : (
            "View details"
          )}
        </button>
      </footer>
    </article>
  );
}