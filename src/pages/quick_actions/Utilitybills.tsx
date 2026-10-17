import { useState } from "react";
import type { IconType } from "react-icons";
import { Link } from "react-router-dom";
import { IoArrowBack, IoBulbOutline, IoBusinessOutline, IoCalendarOutline, IoCardOutline, IoCarSportOutline, IoChevronForward,} from "react-icons/io5";
import { IoClose, IoEllipsisHorizontal, IoFlameOutline, IoHomeOutline, IoSchoolOutline, IoSearchOutline, IoShieldCheckmarkOutline, IoTvOutline, IoWaterOutline, IoWifiOutline,} from "react-icons/io5";
import styles from "./Utilitybills.module.css";


interface Service {
  id: string;
  label: string;
  Icon: IconType;
  color: string;
  bg: string;
  to: string;
}

const SERVICES: Service[] = [
  { id: "electricity", label: "Electricity", Icon: IoBulbOutline, color: "#b07a00", bg: "#fef3c2", to: "/bills/electricity" },
  { id: "water", label: "Water", Icon: IoWaterOutline, color: "#2b6fba", bg: "#d8edfd", to: "/bills/water" },
  { id: "gas", label: "Gas", Icon: IoFlameOutline, color: "#d35e42", bg: "#fedecb", to: "/bills/gas" },
  { id: "broadband", label: "Broadband", Icon: IoWifiOutline, color: "#2a714f", bg: "#ddf4e1", to: "/bills/broadband" },
  { id: "dth", label: "DTH", Icon: IoTvOutline, color: "#5721b2", bg: "#e9dbfd", to: "/bills/dth" },
  { id: "fastag", label: "FASTag", Icon: IoCarSportOutline, color: "#1f7a5f", bg: "#d4f4eb", to: "/fasttag" },
  { id: "credit-card", label: "Credit Card", Icon: IoCardOutline, color: "#b73d66", bg: "#fedde9", to: "/credit_card_bill" },
  { id: "insurance", label: "Insurance", Icon: IoShieldCheckmarkOutline, color: "#2a7d90", bg: "#d1f2f9", to: "/bills/insurance" },
  { id: "education", label: "Education", Icon: IoSchoolOutline, color: "#2b6fba", bg: "#d6ecfd", to: "/bills/education" },
  { id: "rent", label: "Rent", Icon: IoHomeOutline, color: "#c2476f", bg: "#fde4ec", to: "/bills/rent" },
  { id: "municipal-tax", label: "Municipal Tax", Icon: IoBusinessOutline, color: "#a8780f", bg: "#fef3c2", to: "/bills/municipal-tax" },
];

const MORE_SERVICES: Service = {
  id: "more",
  label: "More Services",
  Icon: IoEllipsisHorizontal,
  color: "#3e6b4a",
  bg: "#f2f7f3",
  to: "/bills/all",
};

interface RecentBill {
  id: string;
  serviceId: string;
  name: string;
  number: string;
  amount: number;
  due: string;
  to: string;
}

const RECENT_BILLS: RecentBill[] = [
  { id: "b1", serviceId: "electricity", name: "MSEDCL Electricity", number: "Consumer No. 0123456789", amount: 1248, due: "Due on 18 May", to: "/bills/electricity" },
  { id: "b2", serviceId: "broadband", name: "Airtel Broadband", number: "98765 43210", amount: 799, due: "Due on 19 May", to: "/bills/broadband" },
  { id: "b3", serviceId: "credit-card", name: "HDFC Bank Credit Card", number: "•••• 1234", amount: 3250, due: "Due on 21 May", to: "/credit_card_bill" },
];

const ROUTES = {
  reminders: "/bill-reminders",
  allBills: "/bills/recent",
};

const formatInr = (value: number) =>
  "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


export default function UtilityBills() {
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const visibleServices = search
    ? SERVICES.filter((s) => s.label.toLowerCase().includes(search))
    : [...SERVICES, MORE_SERVICES];

  const serviceById = (id: string) => SERVICES.find((s) => s.id === id);

  return (
    <main className={styles.page}>
      <div className={styles.topBanner} aria-hidden="true" />

      <div className={`${styles.container} ${styles.content}`}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.headerIconBtn} aria-label="Back to dashboard">
            <IoArrowBack size={23} />
          </Link>
          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Utility Bills</h1>
            <p className={styles.headerSubtitle}>Pay all your bills and services in one place</p>
          </div>
        </div>

        <div className={styles.searchBox} role="search">
          <IoSearchOutline size={22} color="#6f7772" aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search bills & services"
            aria-label="Search bills and services"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}/>
            
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery("")}
              aria-label="Clear search">

              <IoClose size={18} />
            </button>
          )}
        </div>

        <div className={styles.layout}>
          <section className={`${styles.card} ${styles.servicesCard}`} aria-labelledby="services-heading">
            <h2 id="services-heading" className={styles.sectionTitle}>
              {search ? "Search results" : "Pay Bills & Services"}
            </h2>

            {visibleServices.length > 0 ? (
              <ul className={styles.serviceGrid}>
                {visibleServices.map(({ id, label, Icon, color, bg, to }) => (
                  <li key={id}>
                    <Link to={to} className={styles.service}>
                      <span className={styles.serviceIcon} style={{ background: bg, color }}>
                        <Icon size={24} aria-hidden="true" />
                      </span>
                      <span className={styles.serviceLabel}>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState} role="status">
                No service found for “{query.trim()}”. Try a different name.
              </p>
            )}
          </section>

          <section className={styles.reminderCard} aria-label="Bill reminders">
            <span className={styles.reminderIcon} aria-hidden="true">
              <IoCalendarOutline size={24} />
            </span>
            <div className={styles.reminderText}>
              <p className={styles.reminderTitle}>Never miss a due date</p>
              <p className={styles.reminderSubtitle}>Set reminders and pay on time.</p>
            </div>
            <Link to={ROUTES.reminders} className={styles.reminderButton}>
              Set Reminder
            </Link>
          </section>

          <section className={`${styles.card} ${styles.recentCard}`} aria-labelledby="recent-heading">
            <div className={styles.recentHead}>
              <h2 id="recent-heading" className={styles.sectionTitle}>
                Recent Bills
              </h2>
              <Link to={ROUTES.allBills} className={styles.viewAll}>
                View All
              </Link>
            </div>

            <ul className={styles.billList}>
              {RECENT_BILLS.map((bill) => {
                const svc = serviceById(bill.serviceId);
                const Icon = svc?.Icon ?? IoCardOutline;
                return (
                  <li key={bill.id}>
                    <Link to={bill.to} className={styles.bill}>
                      <span
                        className={styles.billIcon}
                        style={{ background: svc?.bg, color: svc?.color }}
                        aria-hidden="true">

                        <Icon size={20} />
                      </span>
                      <span className={styles.billInfo}>
                        <span className={styles.billName}>{bill.name}</span>
                        <span className={styles.billNumber}>{bill.number}</span>
                      </span>
                      <span className={styles.billAmount}>
                        <span className={styles.amount}>{formatInr(bill.amount)}</span>
                        <span className={styles.dueDate}>{bill.due}</span>
                      </span>
                      <IoChevronForward size={20} className={styles.billArrow} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerContent}`}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Sadaiv Finance. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/support">Help & Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
