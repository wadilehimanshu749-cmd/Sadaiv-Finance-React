import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, LayoutGrid, ShieldCheck, Heart, Car, Plane, User, CheckCircle2, AlertCircle, FileText, Search, RefreshCw, BadgeCheck,} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./Investment.module.css";

type CategoryKey = "health" | "term-life" | "motor" | "travel";
type TabKey = "all" | CategoryKey;
type SortKey = "relevance" | "premium-asc" | "cover-desc";

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
}

type ApiProduct = Omit<Plan, "category"> & { category?: string };

interface ApiResponse {
  products?: ApiProduct[];
}

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const API_URL = env.VITE_WBI_API_URL || "https://worldbestinsurer.com/api/v1/products";
const API_KEY = env.VITE_WBI_API_KEY || "wbi_demo_2026_public";
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
const isNum = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);
const isCategory = (v: unknown): v is CategoryKey =>
  typeof v === "string" && (API_CATEGORIES as string[]).includes(v);

function formatRange(
  min?: number,
  max?: number,
  fmt: (n: number) => string = formatAmount
): string | null {
  if (!isNum(min) && !isNum(max)) return null;
  if (isNum(min) && isNum(max) && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  const only = isNum(min) ? min : isNum(max) ? max : null;
  return only === null ? null : fmt(only);
}

async function fetchCategory(category: CategoryKey, signal?: AbortSignal): Promise<Plan[]> {
  const params = new URLSearchParams({
    country: "in",
    category,
    limit: "50",
    offset: "0",
    apiKey: API_KEY,
  });
  const res = await fetch(`${API_URL}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`${CATEGORY_LABEL[category]} (HTTP ${res.status})`);
  const data = (await res.json()) as ApiResponse;
  return Array.isArray(data.products)
    ? data.products.map((p): Plan => ({ ...p, category }))
    : [];
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

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoading(true);
    setFailed([]);
    const results = await Promise.allSettled(
      API_CATEGORIES.map((c) => fetchCategory(c, signal))
    );
    if (signal?.aborted) return;
    const ok = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : "Unknown error"));
    setPlans(ok);
    setFailed(errors);
    setLoading(false);
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
    for (const p of plans) {
      if (isCategory(p.category)) c[p.category] = (c[p.category] ?? 0) + 1;
    }
    return c;
  }, [plans]);

  const filtered = useMemo<Plan[]>(() => {
    const q = query.trim().toLowerCase();
    const list = plans.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q ||
          `${p.productName} ${p.insurerName} ${p.subCategory ?? ""}`.toLowerCase().includes(q))
    );
    const keys: Partial<Record<SortKey, (p: Plan) => number>> = {
      "premium-asc": (p) => p.premiumRange?.illustrativeMin ?? Infinity,
      "cover-desc": (p) => -(p.sumInsured?.max ?? 0),
    };
    const key = keys[sort];
    return key ? [...list].sort((a, b) => key(a) - key(b)) : list;
  }, [plans, category, query, sort]);

  const allFailed = !loading && failed.length === API_CATEGORIES.length;

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
        <div className={styles.tabs} role="tablist">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={category === key}
              className={`${styles.tab} ${category === key ? styles.active : ""}`}
              onClick={() => setCategory(key)}>

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
              onChange={(e) => setQuery(e.target.value)}/>

          </label>
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort plans">

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
                  ? "We couldn’t load any plans."
                  : `Some plans didn’t load: ${failed.join(", ")}.`}
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
            filtered.slice(0, visible).map((plan, i) => {
              const cardKey = `${plan.id}-${i}`;
              return (
                <PlanCard
                  key={cardKey}
                  plan={plan}
                  open={!!expanded[cardKey]}
                  onToggle={() => setExpanded((e) => ({ ...e, [cardKey]: !e[cardKey] }))}/>
                  
              );
            })}

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
              Premiums shown are illustrative and vary by age, city and cover. Check the
              insurer’s brochure for exact terms.
            </p>
          </div>
          <div className={styles.panel}>
            <ShieldCheck size={22} />
            <h3>Verified data</h3>
            <p>Each plan shows the date its details were last verified.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  open: boolean;
  onToggle: () => void;
}

function PlanCard({ plan, open, onToggle }: PlanCardProps) {
  const premium = formatRange(plan.premiumRange?.illustrativeMin, plan.premiumRange?.illustrativeMax);
  const cover = formatRange(plan.sumInsured?.min, plan.sumInsured?.max, compactAmount);
  const age = plan.eligibility
    ? `${plan.eligibility.minAge ?? "–"} – ${plan.eligibility.maxAge ?? "–"} years`
    : null;
  const features = plan.specialFeatures ?? [];
  const shown = open ? features : features.slice(0, 4);

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
        <div><dt>Premium</dt><dd>{premium ?? "Not available"}</dd></div>
        <div><dt>Sum insured</dt><dd>{cover ?? "Not available"}</dd></div>
        <div><dt>Eligibility</dt><dd><User size={14} /> {age ?? "Not available"}</dd></div>
      </dl>

      {features.length > 0 && (
        <div className={styles.features}>
          <h4>Key features</h4>
          <ul>
            {shown.map((f, i) => (
              <li key={i}><CheckCircle2 size={15} /> {f}</li>
            ))}
          </ul>
          {features.length > 4 && (
            <button className={styles.link} onClick={onToggle}>
              {open ? "Show less" : `+${features.length - 4} more`}
            </button>
          )}
        </div>
      )}

      <footer className={styles.cardFoot}>
        <small>{plan.lastVerified ? `Verified ${plan.lastVerified}` : "Insurance plan"}</small>
        <button className={styles.btn} onClick={() => console.log("Selected plan:", plan)}>
          View plan
        </button>
      </footer>
    </article>
  );
}
