import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, api, getStoredSession, storeSession } from "./api";
import type {
  Account,
  AssistantMessage,
  AuthSession,
  BackOfficeReport,
  ClientBusinessReport,
  DashboardOverview,
  Instrument,
  InvestmentOrder,
  Page,
  Profile,
  RegulatoryReport,
  Subscription,
  Transaction,
} from "./types";
import { Icon } from "./icons";
import {
  Badge,
  Button,
  EmptyState,
  Metric,
  Modal,
  SectionHeader,
  Spinner,
} from "./ui";

const demoAccounts = [
  {
    label: "Marie Jean",
    email: "marie.jean@demo.profin.ht",
    password: "ProfinDemo!2026",
    description: "Investisseuse individuelle",
  },
  {
    label: "Caribe Investissements",
    email: "caribe.invest@demo.profin.ht",
    password: "ProfinDemo!2026",
    description: "Compte institutionnel",
  },
  {
    label: "Paul Joseph",
    email: "paul.observer@demo.profin.ht",
    password: "ProfinDemo!2026",
    description: "Rôle observateur",
  },
  {
    label: "Sophie Laurent",
    email: "sophie.checker@demo.profin.ht",
    password: "ProfinDemo!2026",
    description: "Mandataire de validation",
  },
];

type Theme = "light" | "dark";
const THEME_KEY = "profin.core.theme";

function ProFinLogo({ className = "" }: { className?: string }) {
  return <img className={`profin-logo ${className}`} src="/profin-logo.png" alt="ProFin" />;
}

const money = (value: number | string | null | undefined, currency = "USD") =>
  new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const number = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("fr-CA", { maximumFractionDigits: 2 }).format(
    Number(value || 0),
  );
const date = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const liquidityByCurrency = (accounts: Account[]) =>
  Object.entries(
    accounts.reduce<Record<string, number>>((totals, account) => {
      totals[account.currency] =
        (totals[account.currency] || 0) + Number(account.available_balance || 0);
      return totals;
    }, {}),
  )
    .map(([currency, value]) => money(value, currency))
    .join(" · ") || "—";

function getClientName(session: AuthSession) {
  return (
    session.client.nom_entreprise ||
    [session.client.prenom, session.client.nom].filter(Boolean).join(" ") ||
    session.client.email.split("@")[0]
  );
}

function statusTone(
  status: string,
): "neutral" | "success" | "warning" | "danger" | "purple" {
  if (["EXECUTED", "ACTIVE", "DISPONIBLE", "MATURE"].includes(status))
    return "success";
  if (["PENDING_APPROVAL", "MATURITE_EN_ATTENTE", "SUBMITTED", "COMPLIANCE_REVIEW", "BACK_OFFICE_REVIEW", "READY_FOR_CHECKER"].includes(status))
    return "warning";
  if (["REJECTED", "FAILED"].includes(status)) return "danger";
  if (["RACHETEE"].includes(status)) return "purple";
  return "neutral";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    EXECUTED: "Exécutée",
    ACTIVE: "Active",
    DISPONIBLE: "Disponible",
    MATURE: "À maturité",
    PENDING_APPROVAL: "À valider",
    MATURITE_EN_ATTENTE: "Maturité à valider",
    REJECTED: "Rejetée",
    RACHETEE: "Rachetée",
    FAILED: "Échec",
    SUBMITTED: "Soumis",
    COMPLIANCE_REVIEW: "Vérification en cours",
    BACK_OFFICE_REVIEW: "Traitement en cours",
    READY_FOR_CHECKER: "Dernière validation",
    CANCELLED: "Annulé",
  };
  return labels[status] || status.replaceAll("_", " ");
}

function transactionLabel(type: string) {
  return (
    (
      {
        DEPOT: "Dépôt",
        RETRAIT: "Retrait",
        TRANSFERT: "Transfert",
        SOUSCRIPTION: "Souscription",
        RACHAT: "Rachat",
        REMBOURSEMENT_MATURITE: "Remboursement à maturité",
      } as Record<string, string>
    )[type] || type
  );
}

function workflowStepLabel(step: string) {
  return (
    {
      CONFORMITE: "Vérification du dossier",
      BACK_OFFICE: "Traitement de la demande",
      CHECKER: "Validation finale",
    } as Record<string, string>
  )[step] || step.replaceAll("_", " ");
}

function Sparkline({ positive = true }: { positive?: boolean }) {
  const points = positive
    ? "0,44 18,39 36,42 54,30 72,34 90,22 108,26 126,12 144,18 162,4"
    : "0,10 18,18 36,14 54,28 72,25 90,38 108,34 126,45 144,42 162,50";
  return (
    <svg
      className="sparkline"
      viewBox="0 0 162 54"
      preserveAspectRatio="none"
      aria-label="Évolution du portefeuille"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" stopOpacity=".28" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${points} L 162,54 L 0,54 Z`} fill="url(#spark-fill)" />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#c4b5fd" : "#fb7185"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginScreen({ onLogin, notice = "" }: { onLogin: (session: AuthSession) => void; notice?: string }) {
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState(demoAccounts[0].password);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api.login(email, password);
      const session = { tokens: result.tokens, client: result.client };
      storeSession(session);
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <div className="auth-orb orb-one" />
      <div className="auth-orb orb-two" />
      <section className="auth-visual">
        <ProFinLogo className="profin-logo-auth" />
        <div className="auth-kicker">PROFIN / PORTAIL CLIENT</div>
        <h1>
          Suivre vos investissements
          <br />
          <em>en toute clarté.</em>
        </h1>
        <p>
          Consultez vos comptes, soumettez vos ordres et suivez chaque étape de validation.
        </p>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand"><ProFinLogo className="profin-logo-mobile" /></div>
          <div className="eyebrow">Espace sécurisé</div>
          <h2>Connexion</h2>
          <p className="auth-subtitle">
            Accédez à vos comptes, positions et ordres en cours.
          </p>
          <form onSubmit={submit} className="auth-form">
            {notice && <div className="form-notice">{notice}</div>}
            <label>
              Email professionnel
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Mot de passe
              <div className="input-with-icon">
                <Icon name="lock" size={17} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>
            {error && (
              <div className="form-error">
                <Icon name="alert" size={16} />
                {error}
              </div>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Spinner /> Connexion…
                </>
              ) : (
                <>
                  Ouvrir ma console <Icon name="arrow" size={17} />
                </>
              )}
            </Button>
          </form>
          <div className="demo-heading">
            <span>Accès de démonstration</span>
            <span className="demo-line" />
          </div>
          <div className="demo-list">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                className="demo-account"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                <span className="avatar small">{initials(account.label)}</span>
                <span>
                  <strong>{account.label}</strong>
                  <small>{account.description}</small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
          </div>
          <div className="auth-note">
            <Icon name="shield" size={15} /> Votre espace personnel ProFin.
          </div>
        </div>
      </section>
    </main>
  );
}

function normalizeAssistantText(value: string) {
  return value
    .replaceAll("\u00c3\u00a0", "\u00e0")
    .replaceAll("\u00c3\u00a9", "\u00e9")
    .replaceAll("\u00c3\u00a8", "\u00e8")
    .replaceAll("\u00c3\u00aa", "\u00ea")
    .replaceAll("\u00c3\u00a7", "\u00e7")
    .replaceAll("\u00c3\u00bb", "\u00fb");
}

function AssistantPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: "assistant", content: "Bonjour. Je peux vous aider à comprendre vos comptes, vos placements, vos ordres et vos prochaines échéances." },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const suggestions = [
    "Quelle est la valeur de mon portefeuille ?",
    "Pourquoi mon ordre est-il en attente ?",
    "Quelle est ma prochaine échéance ?",
  ];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const send = async (event?: React.FormEvent, suggestedMessage?: string) => {
    event?.preventDefault();
    const message = normalizeAssistantText((suggestedMessage ?? draft).trim());
    if (!message || busy) return;
    setDraft("");
    setError("");
    const nextMessages: AssistantMessage[] = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setBusy(true);
    try {
      const result = await api.assistantChat(token, message, nextMessages.slice(-8));
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'assistant est temporairement indisponible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="assistant-scrim" onClick={onClose} aria-hidden="true" />
      <section className="assistant-panel" role="dialog" aria-modal="true" aria-label="Assistant ProFin">
      <div className="assistant-panel-head">
        <div className="assistant-title"><span className="assistant-icon"><Icon name="spark" size={17} /></span><div><strong>Assistant ProFin</strong><small>Vos données, expliquées simplement</small></div></div>
        <button className="icon-button" onClick={onClose} aria-label="Fermer l'assistant"><Icon name="close" size={17} /></button>
      </div>
      <div className="assistant-messages" aria-live="polite">
        {messages.map((item, index) => <div className={`assistant-message ${item.role}`} key={`${item.role}-${index}`}><span>{normalizeAssistantText(item.content)}</span></div>)}
        {busy && <div className="assistant-message assistant"><span className="assistant-typing"><i /><i /><i /></span></div>}
      </div>
      {messages.length === 1 && <div className="assistant-suggestions">{suggestions.map((item) => <button key={item} onClick={() => void send(undefined, item)}>{normalizeAssistantText(item)}</button>)}</div>}
      {error && <div className="assistant-error"><Icon name="alert" size={14} />{error}</div>}
      <form className="assistant-composer" onSubmit={send}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Posez votre question..." aria-label="Question à l'assistant" maxLength={2000} />
        <button className="assistant-send" type="submit" disabled={busy || !draft.trim()} aria-label="Envoyer"><Icon name="arrow" size={17} /></button>
      </form>
      <p className="assistant-disclaimer">Réponse informative. Les opérations financières suivent toujours le parcours de validation.</p>
      </section>
    </>
  );
}

function Shell({
  session,
  page,
  setPage,
  onLogout,
  theme,
  onToggleTheme,
  canAccessBackOffice,
  children,
}: {
  session: AuthSession;
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  canAccessBackOffice: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const name = getClientName(session);
  const nav = [
    { id: "overview" as Page, label: "Vue d’ensemble", icon: "grid" as const },
    { id: "investments" as Page, label: "Investir", icon: "trend" as const },
    {
      id: "operations" as Page,
      label: "Flux de trésorerie",
      icon: "swap" as const,
    },
    { id: "accounts" as Page, label: "Comptes", icon: "wallet" as const },
    ...(canAccessBackOffice ? [{ id: "backoffice" as Page, label: "Pilotage opérationnel", icon: "building" as const }] : []),
  ];
  const go = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand-lockup"><ProFinLogo className="profin-logo-sidebar" /></div>
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="main-nav" aria-label="Navigation principale">
          <span className="nav-label">Pilotage</span>
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => go(item.id)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.id === "accounts" ? "Comptes" : item.id === "operations" ? "Flux" : item.id === "overview" ? "Vue" : item.id === "investments" ? "Investir" : item.id === "backoffice" ? "Pilotage" : item.label}</span>
              {item.id === "operations" && (
                <span className="nav-notification">!</span>
              )}
            </button>
          ))}
          <span className="nav-label nav-spacer">Compte</span>
          <button
            className={`nav-item ${page === "profile" ? "active" : ""}`}
            onClick={() => go("profile")}
          >
            <Icon name="user" size={19} />
            <span>Mon profil</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-button" onClick={onLogout}>
            <Icon name="logout" size={18} /> Déconnexion
          </button>
        </div>
      </aside>
      <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button menu-trigger"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Icon name="menu" />
          </button>
          <div className="mobile-topbar-brand">
            <ProFinLogo className="profin-logo-topbar-mobile" />
          </div>
          <div className="breadcrumbs">
            <strong>
              {nav.find((item) => item.id === page)?.label || "Mon profil"}
            </strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" onClick={onToggleTheme} aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"} title={theme === "light" ? "Mode sombre" : "Mode clair"}>
              <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
            </button>
            <button className={`assistant-trigger ${assistantOpen ? "active" : ""}`} onClick={() => setAssistantOpen((current) => !current)} aria-label="Ouvrir l'assistant" title="Assistant ProFin">
              <Icon name="spark" size={17} /><span>Assistant</span>
            </button>
            <button className="icon-button" aria-label="Rechercher">
              <Icon name="search" size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Icon name="bell" size={19} />
              <b />
            </button>
            <button className="user-chip" onClick={() => go("profile")}>
              <span className="avatar">{initials(name)}</span>
              <span className="user-chip-name">{name}</span>
              <Icon name="chevron" size={14} />
            </button>
          </div>
        </header>
        <div className="page-content">{children}</div>
        {assistantOpen && <AssistantPanel token={session.tokens.access_token} onClose={() => setAssistantOpen(false)} />}
        <nav className="mobile-nav" aria-label="Navigation mobile">
          {nav.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => go(item.id)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

function DashboardPage({
  session,
  overview,
  report,
  recent,
  investments,
  go,
}: {
  session: AuthSession;
  overview: DashboardOverview | null;
  report: ClientBusinessReport | null;
  recent: Transaction[];
  investments: Subscription[];
  go: (page: Page) => void;
}) {
  const currency = overview?.currency || "USD";
  const pending = recent.filter((item) => item.status === "PENDING_APPROVAL");
  const name = getClientName(session).split(" ")[0];
  return (
    <div className="page-stack page-enter">
      <div className="hero-row">
        <div>
          <div className="eyebrow">
            {new Intl.DateTimeFormat("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </div>
          <h1>Bonjour, {name}.</h1>
          <p className="hero-copy">
            Consultez vos positions, vos liquidités et les opérations en attente.
          </p>
        </div>
        <Button icon="plus" onClick={() => go("operations")}>
          Nouvelle opération
        </Button>
      </div>
      <div className="signal-strip">
        <div className="signal-mark">
          <Icon name="spark" size={18} />
        </div>
        <div>
          <strong>Synthèse du portefeuille</strong>
          <span>Rendement consolidé des positions actives.</span>
        </div>
        <div className="signal-value">
          +{number(overview?.return_percentage)}
          <small>% depuis l’origine</small>
        </div>
        <div className="signal-chart">
          <Sparkline positive={(overview?.total_return || 0) >= 0} />
        </div>
      </div>
      <div className="metric-grid">
        <Metric
          label="Valeur du portefeuille"
          value={money(overview?.total_value, currency)}
          helper={`${overview?.active_subscriptions || 0} positions actives`}
          trend={`+${number(overview?.return_percentage)}%`}
          icon="trend"
        />
        <Metric
          label="Capital investi"
          value={money(overview?.total_invested, currency)}
          helper="Valeur nette engagée"
          icon="bank"
        />
        <Metric
          label="Liquidités disponibles"
          value={liquidityByCurrency(overview?.accounts || [])}
          helper={`${overview?.accounts?.length || 0} comptes rattachés`}
          icon="wallet"
        />
        <Metric
          label="Flux à traiter"
          value={String(pending.length).padStart(2, "0")}
          helper="Demandes en cours de validation"
          icon="swap"
        />
      </div>
      <ClientReportPanels report={report} />
      <div className="dashboard-grid">
        <section className="panel allocation-panel">
          <SectionHeader
            eyebrow="Vision patrimoniale"
            title="Vos actifs, en un regard"
            action={
              <button className="text-button" onClick={() => go("investments")}>
                Voir les positions <Icon name="arrow" size={15} />
              </button>
            }
          />
          <div className="allocation-visual">
            <div className="donut">
              <div className="donut-inner">
                <strong>{overview?.active_subscriptions || 0}</strong>
                <span>positions</span>
              </div>
            </div>
            <div className="allocation-legend">
              <div>
                <i className="legend-dot violet" />
                <span>Obligations</span>
                <strong>{money(overview?.total_value, currency)}</strong>
              </div>
              <div>
                <i className="legend-dot gold" />
                <span>Liquidités</span>
                <strong>
                  {liquidityByCurrency(overview?.accounts || [])}
                </strong>
              </div>
              <div>
                <i className="legend-dot slate" />
                <span>En attente</span>
                <strong>{money(0, currency)}</strong>
              </div>
            </div>
          </div>
          <div className="panel-footnote">
            <Icon name="shield" size={15} /> Valorisation des positions actives
          </div>
        </section>
        <section className="panel attention-panel">
          <SectionHeader eyebrow="À surveiller" title="Centre d’attention" />
          <div className="attention-list">
            {pending.length ? (
              pending.slice(0, 3).map((transaction) => (
                <div className="attention-item" key={transaction.id}>
                  <span className="attention-icon">
                    <Icon name="alert" size={17} />
                  </span>
                  <div>
                    <strong>
                      {transactionLabel(transaction.transaction_type)}
                    </strong>
                    <span>
                      {money(transaction.amount, transaction.currency)} · En
                      attente de validation
                    </span>
                  </div>
                  <Icon name="arrow" size={16} />
                </div>
              ))
            ) : (
              <div className="quiet-state">
                <span className="quiet-check">
                  <Icon name="check" size={17} />
                </span>
                <div>
                  <strong>Tout est à jour</strong>
                  <span>Aucune validation urgente pour le moment.</span>
                </div>
              </div>
            )}
          </div>
          <button className="attention-cta" onClick={() => go("operations")}>
            Ouvrir le centre des opérations <Icon name="arrow" size={16} />
          </button>
        </section>
      </div>
      <section className="panel table-panel">
        <SectionHeader
          eyebrow="Activité récente"
          title="Les derniers mouvements"
          action={
            <button className="text-button" onClick={() => go("operations")}>
              Tout voir <Icon name="arrow" size={15} />
            </button>
          }
        />
        {recent.length ? (
          <TransactionTable transactions={recent.slice(0, 5)} />
        ) : (
          <EmptyState
            title="Votre activité apparaîtra ici"
            description="Créez une première opération pour commencer à suivre vos flux."
            action={
              <Button onClick={() => go("operations")} icon="plus">
                Créer une opération
              </Button>
            }
          />
        )}
      </section>
      <section className="investment-preview">
        <SectionHeader
          eyebrow="Positions actives"
          title="Vos investissements"
          action={
            <button className="text-button" onClick={() => go("investments")}>
              Explorer le marché <Icon name="arrow" size={15} />
            </button>
          }
        />
        {investments.length ? (
          <div className="investment-mini-grid">
            {investments.slice(0, 3).map((item) => (
              <div className="investment-mini" key={item.id}>
                <div className="investment-mini-top">
                  <span className="instrument-logo">
                    {item.instrument_code?.slice(-2) || "PF"}
                  </span>
                  <Badge tone="success">Active</Badge>
                </div>
                <strong>{item.instrument_name}</strong>
                <span>
                  {item.instrument_code} · échéance{" "}
                  {date(item.effective_maturity_date)}
                </span>
                <div className="investment-mini-value">
                  <strong>
                    {money(item.current_value, item.currency || currency)}
                  </strong>
                  <span>
                    +
                    {money(
                      Number(item.current_value) - Number(item.invested_amount),
                      item.currency || currency,
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel">
            <EmptyState
              title="Aucune position active"
              description="Découvrez les instruments disponibles pour construire votre allocation."
              action={
                <Button onClick={() => go("investments")}>
                  Voir les opportunités
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

function ClientReportPanels({ report }: { report: ClientBusinessReport | null }) {
  if (!report) return null;
  const upcoming = report.maturities.slice(0, 3);
  const cashflow = report.cashflow.slice(-6);
  const maxFlow = Math.max(...cashflow.map((item) => Math.abs(Number(item.net))), 1);
  return (
    <div className="report-grid">
      <section className="panel report-panel report-currency-panel">
        <SectionHeader eyebrow="Votre patrimoine" title="Un suivi par devise" description="Retrouvez vos placements et vos liquidités dans chaque devise." />
        <div className="currency-report-list">
          {report.summary_by_currency.map((item) => (
            <div className="currency-report-row" key={item.currency}>
              <div><span className="currency-pill">{item.currency}</span><strong>{item.active_positions} position(s)</strong><small>TMA {Number(item.tma_percentage).toFixed(2)}% · frais {money(item.fees, item.currency)}</small></div>
              <div><strong>{money(item.current_value, item.currency)}</strong><small>{item.return_amount >= 0 ? "+" : ""}{money(item.return_amount, item.currency)} de variation</small></div>
              <div><span>Disponible</span><strong>{money(item.available_cash, item.currency)}</strong></div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel report-panel">
        <SectionHeader eyebrow="Calendrier" title="Les prochaines échéances" description="Anticipez les remboursements qui arrivent dans les 90 prochains jours." />
        {upcoming.length ? <div className="report-list">{upcoming.map((item) => <div className="report-list-row" key={item.subscription_id}><span className="report-date">{item.days_to_maturity} j</span><div><strong>{item.instrument_name}</strong><small>{item.instrument_code} · {date(item.maturity_date)}</small></div><b>{money(item.current_value, item.currency)}</b></div>)}</div> : <EmptyState title="Aucune échéance proche" description="Vos positions ne présentent pas de remboursement à anticiper." />}
      </section>
      <section className="panel report-panel">
        <SectionHeader eyebrow="Flux exécutés" title="Tendance de trésorerie" description="Dépôts, investissements et remboursements sur les derniers mois." />
        {cashflow.length ? <div className="cashflow-list">{cashflow.map((item) => <div className="cashflow-row" key={`${item.month}-${item.currency}`}><div><strong>{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(item.month))}</strong><small>{item.currency}</small></div><div className="cashflow-track"><span style={{ width: `${Math.max(8, Math.round(Math.abs(Number(item.net)) / maxFlow * 100))}%` }} className={item.net >= 0 ? "positive" : "negative"} /></div><b>{item.net >= 0 ? "+" : "−"}{money(Math.abs(item.net), item.currency)}</b></div>)}</div> : <EmptyState title="Pas encore de tendance" description="Les mouvements exécutés alimenteront ce suivi." />}
      </section>
      <section className="panel report-panel">
        <SectionHeader eyebrow="Parcours des ordres" title="Où en sont vos demandes ?" description="Chaque demande reste visible jusqu’à sa validation finale." />
        <div className="pipeline-list">{report.order_pipeline.length ? report.order_pipeline.map((item) => <div className="pipeline-row" key={item.status}><span className={`pipeline-dot ${statusTone(item.status)}`} /><div><strong>{statusLabel(item.status)}</strong><small>{item.count} demande(s)</small></div><b>{Object.entries(item.amount_by_currency).map(([currency, value]) => money(value, currency)).join(" · ")}</b></div>) : <EmptyState title="Aucune demande en cours" description="Vos prochaines demandes apparaîtront ici." />}</div>
      </section>
    </div>
  );
}

function TransactionTable({
  transactions,
  onApprove,
  onReject,
  onReverse,
  currentClientId,
}: {
  transactions: Transaction[];
  onApprove?: (id: number) => void;
  onReject?: (transaction: Transaction) => void;
  onReverse?: (transaction: Transaction) => void;
  currentClientId?: number;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Opération</th>
            <th>Compte</th>
            <th>Date</th>
            <th>Statut</th>
            <th className="align-right">Montant</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const own =
              currentClientId &&
              transaction.created_by_client_id === currentClientId;
            return (
              <tr key={transaction.id}>
                <td>
                  <div className="table-operation">
                    <span
                      className={`transaction-icon ${transaction.transaction_type === "DEPOT" ? "in" : transaction.transaction_type === "RETRAIT" ? "out" : "move"}`}
                    >
                      <Icon
                        name={
                          transaction.transaction_type === "TRANSFERT"
                            ? "swap"
                            : transaction.transaction_type === "DEPOT"
                              ? "arrow"
                              : "bank"
                        }
                        size={16}
                      />
                    </span>
                    <div>
                      <strong>
                        {transactionLabel(transaction.transaction_type)}
                      </strong>
                      <small>
                        {transaction.description ||
                          (transaction.is_automatic
                            ? "Généré automatiquement"
                            : `Référence #${transaction.id}`)}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="mono">
                    {transaction.source_account_number ||
                      transaction.destination_account_number ||
                      "—"}
                  </span>
                </td>
                <td>{date(transaction.created_at)}</td>
                <td>
                  <Badge tone={statusTone(transaction.status)}>
                    {statusLabel(transaction.status)}
                  </Badge>
                </td>
                <td className="align-right">
                  <strong
                    className={
                      transaction.transaction_type === "RETRAIT"
                        ? "amount-negative"
                        : ""
                    }
                  >
                    {transaction.transaction_type === "RETRAIT" ? "−" : "+"}
                    {money(transaction.amount, transaction.currency)}
                  </strong>
                </td>
                <td>
                  {onApprove && transaction.status === "PENDING_APPROVAL" && (
                    <div className="row-actions">
                      {own ? (
                        <span className="own-maker">Votre demande</span>
                      ) : (
                        <>
                          <button
                            className="mini-action approve"
                            onClick={() => onApprove(transaction.id)}
                            aria-label="Approuver"
                          >
                            <Icon name="check" size={15} />
                          </button>
                          <button
                            className="mini-action reject"
                            onClick={() => onReject?.(transaction)}
                            aria-label="Rejeter"
                          >
                            <Icon name="close" size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {onReverse && transaction.status === "EXECUTED" && !transaction.reversed_at && (
                    <button className="mini-action reverse" onClick={() => onReverse(transaction)} aria-label="Corriger">
                      <Icon name="refresh" size={15} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InvestmentsPage({
  token,
  instruments,
  investments,
  orders,
  accounts,
  currentClientId,
  refresh,
  notify,
}: {
  token: string;
  instruments: Instrument[];
  investments: Subscription[];
  orders: InvestmentOrder[];
  accounts: Account[];
  currentClientId: number;
  refresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}) {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [busy, setBusy] = useState(false);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const available = instruments.filter((item) => item.status === "DISPONIBLE");
  const openSubscription = (item: Instrument) => {
    setInstrument(item);
    setAmount(String(item.minimum_amount));
    const match = accounts.find(
      (account) =>
        account.currency === item.currency &&
        Number(account.available_balance) >= Number(item.minimum_amount),
    );
    setAccountId(match ? String(match.id) : "");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!instrument || !accountId) return;
    setBusy(true);
    try {
      await api.submitOrder(token, {
        account_id: Number(accountId),
        instrument_id: instrument.id,
        amount: Number(amount),
        client_comment: "Ordre soumis depuis le portail client",
      });
      notify("Ordre soumis. Le montant est réservé jusqu'à la validation.");
      setInstrument(null);
      await refresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Souscription impossible",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  const redeem = async (id: number) => {
    if (!window.confirm("Confirmer le rachat de cette position ?")) return;
    setRedeeming(id);
    try {
      await api.redeem(token, id);
      notify("Position rachetée, liquidités restaurées.");
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Rachat impossible", "error");
    } finally {
      setRedeeming(null);
    }
  };
  const reviewOrder = async (order: InvestmentOrder) => {
    const step = order.steps.find((item) => item.status === "PENDING");
    if (!step) return;
    try {
      await api.reviewOrderStep(token, order.id, step.step_code, "APPROVE", "Contrôle traité depuis le portail");
      notify(step.step_code === "CHECKER" ? "Ordre validé et position créée." : `${workflowStepLabel(step.step_code)} validée.`);
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Validation de l'ordre impossible", "error");
    }
  };
  const cancelOrder = async (order: InvestmentOrder) => {
    if (!window.confirm("Annuler cet ordre et libérer le montant réservé ?")) return;
    try {
      await api.cancelOrder(token, order.id);
      notify("Ordre annulé et montant libéré.");
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Annulation impossible", "error");
    }
  };
  return (
    <div className="page-stack page-enter">
      <div className="hero-row">
        <div>
          <div className="eyebrow">Marché primaire</div>
          <h1>Soumettre un ordre.</h1>
          <p className="hero-copy">
            Des instruments sélectionnés, une lecture nette du rendement et des
            échéances.
          </p>
        </div>
        <div className="hero-context">
          <span className="status-live">
            <i /> Marché disponible
          </span>
          <span>3 instruments suivis</span>
        </div>
      </div>
      <section className="panel market-intro">
        <div>
          <span className="eyebrow">Référentiel d'instruments</span>
          <h2>Choisir un instrument disponible.</h2>
          <p>
            Examinez le rendement, la devise, le minimum et l'échéance avant de soumettre votre ordre.
          </p>
        </div>
        <div className="market-symbol">
          <Icon name="trend" size={34} />
        </div>
      </section>
      <SectionHeader
        eyebrow="Opportunités disponibles"
        title="Construire une position"
        description="Sélectionnez un instrument pour ouvrir le parcours de souscription."
      />
      <div className="instrument-grid">
        {available.map((item) => (
          <article className="instrument-card" key={item.id}>
            <div className="instrument-card-top">
              <span className="instrument-logo large-logo">
                {item.code.split("-")[1]?.slice(0, 2) || "PF"}
              </span>
              <Badge tone="success">Disponible</Badge>
            </div>
            <div className="instrument-type">
              {item.instrument_type || "Instrument"} · {item.currency}
            </div>
            <h3>{item.name}</h3>
            <p>{item.description || `Émis par ${item.issuer}.`}</p>
            <div className="instrument-stats">
              <div>
                <span>Rendement annuel</span>
                <strong>+{number(item.annual_yield)}%</strong>
              </div>
              <div>
                <span>Échéance</span>
                <strong>{date(item.maturity_date)}</strong>
              </div>
            </div>
            <div className="instrument-bottom">
              <span>Minimum {money(item.minimum_amount, item.currency)}</span>
              <Button onClick={() => openSubscription(item)} icon="arrow">
                Étudier l’offre
              </Button>
            </div>
          </article>
        ))}
      </div>
      <SectionHeader
        eyebrow="Suivi des demandes"
        title="Ordres soumis"
        description="Chaque demande est vérifiée avant son exécution."
      />
      {orders.length ? (
        <div className="order-list">
          {orders.map((order) => {
            const nextStep = order.steps.find((step) => step.status === "PENDING");
            const canReview = order.submitted_by_client_id !== currentClientId && Boolean(nextStep) && !["EXECUTED", "REJECTED", "CANCELLED"].includes(order.status);
            return (
              <article className="panel order-card" key={order.id}>
                <div className="order-card-top">
                  <div>
                    <span className="eyebrow">Ordre #{order.id} · {date(order.created_at)}</span>
                    <h3>{order.instrument_name || order.instrument_code}</h3>
                    <p>{money(order.amount, order.currency)} · Compte {order.account_number}</p>
                  </div>
                  <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                </div>
                <div className="order-steps">
                  {order.steps.map((step) => <span className={step.status === "APPROVED" ? "done" : step.status === "REJECTED" ? "rejected" : step === nextStep ? "current" : ""} key={step.step_code}>{workflowStepLabel(step.step_code)}</span>)}
                </div>
                <div className="order-card-actions">
                  <span>{order.client_comment || "Ordre soumis par le client"}</span>
                  {canReview && <Button onClick={() => reviewOrder(order)} icon="check">Traiter {nextStep ? workflowStepLabel(nextStep.step_code) : "la demande"}</Button>}
                  {order.submitted_by_client_id === currentClientId && ["SUBMITTED", "COMPLIANCE_REVIEW", "BACK_OFFICE_REVIEW", "READY_FOR_CHECKER"].includes(order.status) && <button className="text-button subtle" onClick={() => cancelOrder(order)}>Annuler</button>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="Aucun ordre soumis" description="Les ordres d'investissement créés depuis le portail apparaîtront ici." />}
      <SectionHeader
        eyebrow="Votre portefeuille"
        title="Positions actives"
        description="Suivez la valeur, le rendement et l’échéance de vos investissements."
      />
      {investments.length ? (
        <div className="position-list">
          {investments.map((item) => (
            <div className="position-row" key={item.id}>
              <div className="position-main">
                <span className="instrument-logo">
                  {item.instrument_code?.slice(-2) || "PF"}
                </span>
                <div>
                  <strong>{item.instrument_name}</strong>
                  <span>
                    {item.instrument_code} · Compte #{item.account_id}
                  </span>
                </div>
              </div>
              <div className="position-cell">
                <span>Investi</span>
                <strong>
                  {money(item.invested_amount, item.currency || "USD")}
                </strong>
              </div>
              <div className="position-cell">
                <span>Valeur actuelle</span>
                <strong>
                  {money(item.current_value, item.currency || "USD")}
                </strong>
              </div>
              <div className="position-cell positive">
                <span>Rendement</span>
                <strong>
                  +
                  {money(
                    Number(item.current_value) - Number(item.invested_amount),
                    item.currency || "USD",
                  )}
                </strong>
              </div>
              <div className="position-end">
                <Badge tone={statusTone(item.status)}>
                  {statusLabel(item.status)}
                </Badge>
                <button
                  className="text-button subtle"
                  onClick={() => redeem(item.id)}
                  disabled={redeeming === item.id}
                >
                  {redeeming === item.id ? <Spinner /> : "Racheter"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Votre portefeuille est encore ouvert"
          description="Une première souscription apparaîtra ici avec sa valeur et son échéance."
        />
      )}
      {instrument && (
        <Modal
          title="Ouvrir une position"
          eyebrow={instrument.code}
          onClose={() => setInstrument(null)}
        >
          <div className="modal-instrument">
            <span className="instrument-logo large-logo">
              {instrument.code.split("-")[1]?.slice(0, 2) || "PF"}
            </span>
            <div>
              <strong>{instrument.name}</strong>
              <span>
                +{number(instrument.annual_yield)}% annuel · échéance{" "}
                {date(instrument.maturity_date)}
              </span>
            </div>
          </div>
          <form className="modal-form" onSubmit={submit}>
            <label>
              Compte de financement
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">Choisir un compte</option>
                {accounts
                  .filter((account) => account.currency === instrument.currency)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_number} · disponible{" "}
                      {money(account.available_balance, account.currency)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Montant investi
              <div className="input-suffix">
                <input
                  type="number"
                  min={instrument.minimum_amount}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span>{instrument.currency}</span>
              </div>
              <small className="helper">
                Minimum requis :{" "}
                {money(instrument.minimum_amount, instrument.currency)}
              </small>
            </label>
            <div className="modal-summary">
              <span>Parcours de validation</span>
              <strong>Soumission avant exécution</strong>
              <small>
                Le montant est réservé jusqu’à la décision finale. Votre
                demande sera vérifiée avant son exécution.
              </small>
            </div>
            <Button type="submit" disabled={busy || !accountId}>
              {busy ? (
                <>
                  <Spinner /> Enregistrement…
                </>
              ) : (
                "Soumettre l'ordre"
              )}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function OperationsPage({
  token,
  accounts,
  transactions,
  currentClientId,
  isBackOffice,
  refresh,
  notify,
}: {
  token: string;
  accounts: Account[];
  transactions: Transaction[];
  currentClientId: number;
  isBackOffice: boolean;
  refresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}) {
  const [kind, setKind] = useState<"DEPOT" | "RETRAIT" | "TRANSFERT">("DEPOT");
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Transaction | null>(null);
  const [reason, setReason] = useState("");
  const [tab, setTab] = useState<"new" | "review" | "history">("new");
  const currencies = [...new Set(accounts.map((account) => account.currency))];
  const resetForKind = (next: typeof kind) => {
    setKind(next);
    setSourceId("");
    setDestinationId("");
    setCurrency(currencies[0] || "USD");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createTransaction(token, {
        transaction_type: kind,
        amount: Number(amount),
        currency,
        source_account_id: kind !== "DEPOT" ? Number(sourceId) : undefined,
        destination_account_id:
          kind !== "RETRAIT" ? Number(destinationId) : undefined,
        description: description || undefined,
      });
      notify("Opération créée et envoyée pour validation.");
      setAmount("");
      setDescription("");
      setTab("history");
      await refresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Opération impossible",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  const approve = async (id: number) => {
    try {
      await api.approve(token, id);
      notify("Opération approuvée et exécutée.");
      await refresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Validation impossible",
        "error",
      );
    }
  };
  const reject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rejectTarget) return;
    try {
      await api.reject(token, rejectTarget.id, reason);
      notify("Opération rejetée.");
      setRejectTarget(null);
      setReason("");
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Rejet impossible", "error");
    }
  };
  const reverse = async (transaction: Transaction) => {
    if (!window.confirm("Créer une demande de correction pour ce mouvement ?")) return;
    try {
      await api.reverse(token, transaction.id, "Correction demandee depuis le portail");
      notify("Demande de correction envoyee pour validation.");
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Correction impossible", "error");
    }
  };
  const pending = transactions.filter(
    (transaction) => transaction.status === "PENDING_APPROVAL",
  );
  return (
    <div className="page-stack page-enter">
      <div className="hero-row">
        <div>
          <div className="eyebrow">Vos opérations</div>
          <h1>Vos flux, sous contrôle.</h1>
          <p className="hero-copy">
            Initiez, vérifiez et suivez chaque mouvement sans perdre le
            historique.
          </p>
        </div>
        <div className="hero-context">
          <span className="status-live">
            <i /> Données à jour
          </span>
          <span>{pending.length} à valider</span>
        </div>
      </div>
      <div className="operation-tabs">
        <button
          className={tab === "new" ? "active" : ""}
          onClick={() => setTab("new")}
        >
          <Icon name="plus" size={16} /> Nouvelle opération
        </button>
        <button
          className={tab === "review" ? "active" : ""}
          onClick={() => setTab("review")}
        >
          <Icon name="shield" size={16} /> À valider{" "}
          <span>{pending.length}</span>
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          <Icon name="refresh" size={16} /> Historique
        </button>
      </div>
      {tab === "new" && (
        <section className="operation-layout">
          <div className="panel operation-form-panel">
            <SectionHeader
              eyebrow="Créer un mouvement"
              title="Nouvelle opération"
              description="Chaque opération est vérifiée avant d’être exécutée."
            />
            <div className="operation-type-selector">
              {(["DEPOT", "RETRAIT", "TRANSFERT"] as const).map((type) => (
                <button
                  key={type}
                  className={kind === type ? "active" : ""}
                  onClick={() => resetForKind(type)}
                >
                  <span>
                    <Icon
                      name={
                        type === "TRANSFERT"
                          ? "swap"
                          : type === "DEPOT"
                            ? "arrow"
                            : "bank"
                      }
                      size={17}
                    />
                  </span>
                  {transactionLabel(type)}
                </button>
              ))}
            </div>
            <form className="operation-form" onSubmit={submit}>
              <div className="form-grid">
                <label>
                  {kind === "DEPOT" ? "Compte crédité" : "Compte débité"}
                  <select
                    value={kind === "DEPOT" ? destinationId : sourceId}
                    onChange={(e) =>
                      kind === "DEPOT"
                        ? setDestinationId(e.target.value)
                        : setSourceId(e.target.value)
                    }
                    required
                  >
                    <option value="">Sélectionner un compte</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_number} ·{" "}
                        {money(account.available_balance, account.currency)}{" "}
                        disponibles
                      </option>
                    ))}
                  </select>
                </label>
                {kind === "TRANSFERT" && (
                  <label>
                    Compte destinataire
                    <select
                      value={destinationId}
                      onChange={(e) => setDestinationId(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un compte</option>
                      {accounts
                        .filter((account) => String(account.id) !== sourceId)
                        .map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.account_number} · {account.currency}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <label>
                  Montant
                  <div className="input-suffix">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                    <span>{currency}</span>
                  </div>
                </label>
                <label>
                  Devise
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {currencies.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Libellé de l’opération
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex. Allocation mensuelle"
                />
              </label>
              <div className="maker-checker-note">
                <span>
                  <Icon name="shield" size={18} />
                </span>
                <div>
                  <strong>Vérification avant traitement</strong>
                  <p>
                    Après votre saisie, votre opération est vérifiée avant
                    d’être exécutée.
                  </p>
                </div>
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Spinner /> Envoi…
                  </>
                ) : (
                  <>
                    Envoyer pour validation <Icon name="arrow" size={17} />
                  </>
                )}
              </Button>
            </form>
          </div>
          <aside className="panel operation-aside">
            <div className="aside-kicker">
              <span className="signal-pulse" /> Suivi de vos mouvements
            </div>
            <h3>
              Votre activité reste
              <br />
              <em>bien suivie.</em>
            </h3>
            <p>
              Retrouvez ici vos mouvements, leur statut et leur historique.
            </p>
            <div className="ledger-line">
              <span>Liquidités disponibles</span>
              <strong>
                {liquidityByCurrency(accounts)}
              </strong>
            </div>
            <div className="ledger-line">
              <span>Dernière synchronisation</span>
              <strong>À l’instant</strong>
            </div>
            <div className="aside-foot">
              <Icon name="refresh" size={15} /> Mis à jour à l’instant
            </div>
          </aside>
        </section>
      )}
      {tab === "review" && (
        <section className="panel table-panel">
          <SectionHeader
            eyebrow="À valider"
            title="File de validation"
            description="Examinez les mouvements qui vous sont attribués."
          />
          {pending.length ? (
            <TransactionTable
              transactions={pending}
              currentClientId={currentClientId}
              onApprove={approve}
              onReject={setRejectTarget}
            />
          ) : (
            <EmptyState
              title="File vide"
              description="Aucune opération n’attend de validation. La file est à jour."
            />
          )}
        </section>
      )}
      {tab === "history" && (
        <section className="panel table-panel">
          <SectionHeader
            eyebrow="Historique des mouvements"
            title="Historique complet"
            action={
              <button className="icon-button" aria-label="Exporter">
                <Icon name="download" size={17} />
              </button>
            }
          />
          {transactions.length ? (
             <TransactionTable transactions={transactions} onReverse={reverse} />
          ) : (
            <EmptyState
              title="Aucun mouvement"
              description="Les opérations de vos comptes apparaîtront ici."
            />
          )}
        </section>
      )}
      {isBackOffice && <section className="maturity-banner">
        <div className="maturity-icon">
          <Icon name="calendar" size={21} />
        </div>
        <div>
          <strong>Maintenance des maturités</strong>
          <span>
            Détectez les positions arrivées à échéance et générez leurs
            remboursements à valider.
          </span>
        </div>
        <button
          onClick={async () => {
            try {
              const result = await api.generateMaturities(token);
              const coupons = await api.generateCoupons(token);
              const generated = [
                result.total ? `${result.total} remboursement(s)` : "",
                coupons.total ? `${coupons.total} coupon(s)` : "",
              ].filter(Boolean);
              notify(generated.length ? `${generated.join(" et ")} prêt(s) pour validation.` : "Aucune échéance à traiter.");
              await refresh();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : "Maintenance impossible",
                "error",
              );
            }
          }}
        >
          Lancer le contrôle <Icon name="arrow" size={16} />
        </button>
      </section>}
      {rejectTarget && (
        <Modal
          title="Rejeter l’opération"
          eyebrow={`Référence #${rejectTarget.id}`}
          onClose={() => setRejectTarget(null)}
        >
          <p className="modal-copy">
            Le rejet ne modifiera aucun solde. Le motif restera attaché à la
            historique de l’opération.
          </p>
          <form className="modal-form" onSubmit={reject}>
            <label>
              Motif du rejet
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minLength={3}
                placeholder="Expliquez la décision…"
                required
              />
            </label>
            <Button variant="danger" type="submit">
              Confirmer le rejet
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AccountsPage({
  token,
  accounts,
  refresh,
  notify,
}: {
  token: string;
  accounts: Account[];
  refresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("INVESTISSEMENT");
  const [currency, setCurrency] = useState("USD");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.openAccount(token, { account_type: type, currency });
      notify("Nouveau compte ouvert avec succès.");
      setOpen(false);
      await refresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Création impossible",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-stack page-enter">
      <div className="hero-row">
        <div>
          <div className="eyebrow">Comptes et liquidités</div>
          <h1>Vos comptes au même endroit.</h1>
          <p className="hero-copy">
            Un point d’ancrage clair pour chaque devise, chaque usage et chaque
            décision.
          </p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>
          Ouvrir un compte
        </Button>
      </div>
      <div className="account-summary">
        <div>
          <span>Total disponible</span>
          <strong>
            {liquidityByCurrency(accounts)}
          </strong>
        </div>
        <div>
          <span>Comptes actifs</span>
          <strong>
            {String(
              accounts.filter((account) => account.status === "ACTIF").length,
            ).padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>Devises suivies</span>
          <strong>
            {new Set(accounts.map((account) => account.currency)).size}
          </strong>
        </div>
        <div className="summary-mark">
          <Icon name="wallet" size={28} />
        </div>
      </div>
      <SectionHeader
        eyebrow="Vue d’ensemble"
        title="Tous vos comptes"
        description="Retrouvez les soldes et les informations de chaque compte."
      />
      <div className="account-grid">
        {accounts.map((account, index) => (
          <article
            className={`account-card ${index === 0 ? "featured" : ""}`}
            key={account.id}
          >
            <div className="account-card-glow" />
            <div className="account-card-top">
              <span className="account-kind">
                <Icon
                  name={account.account_type === "EPARGNE" ? "bank" : "wallet"}
                  size={16}
                />{" "}
                {account.account_type}
              </span>
              <Badge tone={account.status === "ACTIF" ? "success" : "warning"}>
                {account.status === "ACTIF"
                  ? "Actif"
                  : statusLabel(account.status)}
              </Badge>
            </div>
            <span className="account-number">{account.account_number}</span>
            <strong className="account-balance">
              {money(account.balance, account.currency)}
            </strong>
            <div className="account-available">
              <span>Disponible</span>
              <strong>
                {money(account.available_balance, account.currency)}
              </strong>
            </div>
            <div className="account-card-bottom">
              <span>
                {account.currency} · {account.role?.replaceAll("_", " ")}
              </span>
              <button aria-label={`Voir le compte ${account.account_number}`}>
                <Icon name="arrow" size={17} />
              </button>
            </div>
          </article>
        ))}
        <button className="account-add-card" onClick={() => setOpen(true)}>
          <span>
            <Icon name="plus" size={22} />
          </span>
          <strong>Ajouter un compte</strong>
          <small>USD, HTG ou EUR</small>
        </button>
      </div>
      <div className="info-callout">
        <Icon name="shield" size={18} />
        <div>
          <strong>Chaque compte a son rôle.</strong>
          <span>
            Les accès et les opérations de chaque compte sont suivis pour
            protéger vos avoirs.
          </span>
        </div>
      </div>
      {open && (
        <Modal
          title="Ouvrir un compte"
          eyebrow="Nouveau compte"
          onClose={() => setOpen(false)}
        >
          <form className="modal-form" onSubmit={submit}>
            <label>
              Type de compte
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="INVESTISSEMENT">Investissement</option>
                <option value="EPARGNE">Épargne</option>
                <option value="CASH">Liquidités</option>
              </select>
            </label>
            <label>
              Devise
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option>USD</option>
                <option>HTG</option>
                <option>EUR</option>
              </select>
            </label>
            <div className="modal-summary">
              <span>Rôle attribué</span>
              <strong>Titulaire principal</strong>
              <small>
                Le compte sera disponible immédiatement pour vos parcours de
                trésorerie.
              </small>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Spinner /> Création…
                </>
              ) : (
                "Confirmer l’ouverture"
              )}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function BackOfficePage({
  token,
  report,
  regulatory,
  refresh,
  notify,
}: {
  token: string;
  report: BackOfficeReport | null;
  regulatory: RegulatoryReport | null;
  refresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const stepLabels: Record<string, string> = { CONFORMITE: "Contrôle conformité", BACK_OFFICE: "Traitement opérationnel", CHECKER: "Validation finale" };
  const review = async (item: BackOfficeReport["queue"][number]) => {
    setBusyId(`${item.queue_type}-${item.id}`);
    try {
      if (item.queue_type === "TRANSACTION") await api.approve(token, item.id);
      else await api.reviewOrderStep(token, item.id, item.next_step, "APPROVE", "Contrôle traité depuis le pilotage");
      notify("Opération validée et file actualisée.");
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Validation impossible", "error");
    } finally {
      setBusyId(null);
    }
  };
  const reject = async (item: BackOfficeReport["queue"][number]) => {
    if (!window.confirm("Rejeter cette opération et libérer le montant réservé ?")) return;
    setBusyId(`${item.queue_type}-${item.id}`);
    try {
      if (item.queue_type === "TRANSACTION") await api.reject(token, item.id, "Pièce ou contrôle complémentaire requis");
      else await api.reviewOrderStep(token, item.id, item.next_step, "REJECT", "Pièce ou contrôle complémentaire requis");
      notify("Opération rejetée et file actualisée.");
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Rejet impossible", "error");
    } finally {
      setBusyId(null);
    }
  };
  if (!report) return <div className="loading-state"><Spinner /> Chargement du pilotage…</div>;
  return (
    <div className="page-stack page-enter">
      <div className="hero-row">
        <div><div className="eyebrow">Pilotage opérationnel</div><h1>Les opérations à traiter.</h1><p className="hero-copy">Une vue claire des demandes, des validations et des échéances de votre périmètre.</p></div>
        <Badge tone="success">Périmètre habilité</Badge>
      </div>
      <div className="metric-grid">
        <Metric label="Demandes en cours" value={String(report.kpis.orders_in_review).padStart(2, "0")} helper="Parcours d’investissement" trend={report.kpis.orders_in_review ? "À traiter" : undefined} icon="trend" />
        <Metric label="Mouvements à valider" value={String(report.kpis.transactions_pending).padStart(2, "0")} helper="Dépôts, retraits et transferts" icon="swap" />
        <Metric label="Comptes suivis" value={String(report.kpis.active_accounts)} helper="Dans votre périmètre" icon="wallet" />
        <Metric label="Échéances proches" value={String(report.kpis.maturities_next_horizon).padStart(2, "0")} helper="À anticiper sous 90 jours" icon="calendar" />
      </div>
      {regulatory && <section className="panel regulatory-strip"><SectionHeader eyebrow="Vue de supervision" title="Actifs, frais et coupons" description="Une lecture par devise pour suivre la valeur des comptes et les mouvements de rendement." /><div className="regulatory-metrics">{regulatory.aum_by_currency.map((item) => <div className="regulatory-metric" key={item.currency}><span>{item.currency} · actifs suivis</span><strong>{money(item.value, item.currency)}</strong><small>Frais {money(regulatory.fees_by_currency.find((fee) => fee.currency === item.currency)?.value || 0, item.currency)}</small></div>)}<div className="regulatory-metric"><span>Coupons</span><strong>{regulatory.coupon_control.paid}</strong><small>Montants suivis par devise</small></div></div></section>}
      <section className="panel workflow-board">
        <SectionHeader eyebrow="Parcours de validation" title="La file, étape par étape" description="Les demandes avancent dans l’ordre prévu et restent rattachées à leur compte." />
        <div className="workflow-columns">{report.workflow.map((item) => <div className="workflow-column" key={item.step}><div className="workflow-column-head"><span>{item.step === "CONFORMITE" ? "01" : item.step === "BACK_OFFICE" ? "02" : "03"}</span><strong>{stepLabels[item.step]}</strong></div><b>{item.count}</b><small>{item.oldest_age_days ? `Plus ancienne : ${item.oldest_age_days} j` : "Aucune attente"}</small></div>)}</div>
      </section>
      <div className="report-grid backoffice-report-grid">
        <section className="panel report-panel report-queue-panel">
          <SectionHeader eyebrow="À traiter maintenant" title="File des opérations" description="Traitez les éléments dans l’ordre d’arrivée et gardez une trace de chaque décision." />
          {report.queue.length ? <div className="backoffice-queue">{report.queue.map((item) => <div className="backoffice-queue-row" key={`${item.queue_type}-${item.id}`}><div className="queue-type"><span className="instrument-logo"><Icon name={item.queue_type === "TRANSACTION" ? "swap" : "trend"} size={16} /></span><div><strong>{item.queue_type === "TRANSACTION" ? transactionLabel(item.operation) : item.operation}</strong><small>{item.client_name} · {item.account_number || "Compte"}</small></div></div><div><strong>{money(item.amount, item.currency)}</strong><small>{stepLabels[item.next_step] || "Validation"} · {item.age_days} j</small></div><div className="queue-actions"><Button onClick={() => review(item)} disabled={busyId === `${item.queue_type}-${item.id}`} icon="check">{busyId === `${item.queue_type}-${item.id}` ? "..." : "Valider"}</Button><button className="mini-action reject" onClick={() => reject(item)} disabled={Boolean(busyId)} aria-label="Rejeter"><Icon name="close" size={15} /></button></div></div>)}</div> : <EmptyState title="La file est à jour" description="Aucune opération ne nécessite votre intervention." />}
        </section>
        <section className="panel report-panel">
          <SectionHeader eyebrow="Vigilance" title="Points à suivre" description="Les signaux utiles pour organiser la journée." />
          {report.exceptions.length ? <div className="report-list">{report.exceptions.map((item) => <div className="report-list-row" key={item.code}><span className="attention-icon"><Icon name="alert" size={16} /></span><div><strong>{item.title}</strong><small>{item.detail}</small></div></div>)}</div> : <EmptyState title="Aucun point bloquant" description="La file ne présente pas d’anomalie à surveiller." />}
        </section>
      </div>
    </div>
  );
}

function ProfilePage({
  token,
  profile,
  refresh,
  notify,
}: {
  token: string;
  profile: Profile | null;
  refresh: () => Promise<void>;
  notify: (message: string, tone?: "success" | "error") => void;
}) {
  const [phone, setPhone] = useState(profile?.phone || "");
  const [line1, setLine1] = useState(profile?.address?.line1 || "");
  const [city, setCity] = useState(profile?.address?.city || "");
  const [postal, setPostal] = useState(profile?.address?.postal_code || "");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setLine1(profile.address?.line1 || "");
      setCity(profile.address?.city || "");
      setPostal(profile.address?.postal_code || "");
    }
  }, [profile]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.updateProfile(token, {
        telephone: phone,
        adresse_ligne1: line1,
        ville: city,
        code_postal: postal,
      });
      notify("Profil mis à jour.");
      await refresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Mise à jour impossible",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  if (!profile)
    return (
      <div className="loading-state">
        <Spinner /> Chargement du profil…
      </div>
    );
  return (
    <div className="page-stack page-enter">
      <div className="hero-row">
        <div>
          <div className="eyebrow">Mon profil</div>
          <h1>Mes informations.</h1>
          <p className="hero-copy">
            Gardez vos informations à jour pour faciliter le suivi de votre
            compte.
          </p>
        </div>
        <Badge tone="success">Dossier à jour</Badge>
      </div>
      <div className="profile-grid">
        <section className="panel identity-card">
          <div className="profile-avatar">{initials(profile.full_name)}</div>
          <h2>{profile.full_name}</h2>
          <span>{profile.email}</span>
          <Badge tone="purple">
            {profile.client_type === "INSTITUTIONNEL"
              ? "Institutionnel"
              : "Individuel"}
          </Badge>
          <div className="identity-lines">
            <div>
              <span>Profil de risque</span>
              <strong>{profile.risk_profile}</strong>
            </div>
            <div>
              <span>Statut</span>
              <strong>{profile.status}</strong>
            </div>
            <div>
              <span>Client depuis</span>
              <strong>2026</strong>
            </div>
          </div>
          <div className="identity-security">
            <Icon name="shield" size={18} />
            <span>Informations vérifiées</span>
          </div>
        </section>
        <section className="panel profile-form-panel">
          <SectionHeader
            eyebrow="Coordonnées"
            title="Informations de contact"
            description="Ces informations nous permettent de vous contacter au sujet de votre compte."
          />
          <form className="profile-form" onSubmit={submit}>
            <div className="form-grid">
              <label>
                Email de connexion
                <input value={profile.email} disabled />
              </label>
              <label>
                Téléphone
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+509 …"
                />
              </label>
            </div>
            <label>
              Adresse
              <input
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Adresse principale"
              />
            </label>
            <div className="form-grid">
              <label>
                Ville
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Port-au-Prince"
                />
              </label>
              <label>
                Code postal
                <input
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="HT6110"
                />
              </label>
            </div>
            <div className="form-actions">
              <span>
                <Icon name="lock" size={15} /> Les changements sont journalisés
              </span>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Spinner /> Enregistrement…
                  </>
                ) : (
                  "Enregistrer les changements"
                )}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(getStoredSession);
  const [authNotice, setAuthNotice] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark" ? "dark" : "light";
  });
  const [page, setPage] = useState<Page>("overview");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [clientReport, setClientReport] = useState<ClientBusinessReport | null>(null);
  const [backOfficeReport, setBackOfficeReport] = useState<BackOfficeReport | null>(null);
  const [regulatoryReport, setRegulatoryReport] = useState<RegulatoryReport | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Subscription[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<InvestmentOrder[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setToast({ message, tone });
      window.setTimeout(() => setToast(null), 4200);
    },
    [],
  );
  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const token = session.tokens.access_token;
    const results = await Promise.allSettled([
      api.dashboard(token),
      api.clientReport(token),
      api.backOfficeReport(token),
      api.regulatoryReport(token),
      api.recentTransactions(token),
      api.activeInvestments(token),
      api.instruments(token),
      api.accounts(token),
      api.subscriptions(token),
      api.transactions(token),
      api.orders(token),
      api.profile(token),
    ]);
    const [
      overviewResult,
      clientReportResult,
      backOfficeReportResult,
      regulatoryReportResult,
      recentResult,
      investmentsResult,
      instrumentResult,
      accountResult,
      subscriptionsResult,
      transactionResult,
      ordersResult,
      profileResult,
    ] = results;
    const hasUnauthorized = results.some(
      (result) => result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 401,
    );
    if (hasUnauthorized) {
      try {
        const tokens = await api.refresh(session.tokens.refresh_token);
        const nextSession = { ...session, tokens };
        storeSession(nextSession);
        setSession(nextSession);
        setLoading(false);
        return;
      } catch {
        storeSession(null);
        setSession(null);
        setAuthNotice("Votre session a expiré. Reconnectez-vous pour retrouver vos données.");
        setLoading(false);
        return;
      }
    }
    if (overviewResult.status === "fulfilled")
      setOverview(overviewResult.value);
    if (clientReportResult.status === "fulfilled")
      setClientReport(clientReportResult.value);
    if (backOfficeReportResult.status === "fulfilled")
      setBackOfficeReport(backOfficeReportResult.value);
    if (regulatoryReportResult.status === "fulfilled")
      setRegulatoryReport(regulatoryReportResult.value);
    if (recentResult.status === "fulfilled")
      setRecent(recentResult.value.transactions || []);
    if (investmentsResult.status === "fulfilled")
      setInvestments(investmentsResult.value.investissements || []);
    if (instrumentResult.status === "fulfilled")
      setInstruments(instrumentResult.value.instruments || []);
    if (accountResult.status === "fulfilled")
      setAccounts(accountResult.value.accounts || []);
    if (subscriptionsResult.status === "fulfilled")
      setInvestments(subscriptionsResult.value.subscriptions || []);
    if (transactionResult.status === "fulfilled")
      setTransactions(transactionResult.value.transactions || []);
    if (ordersResult.status === "fulfilled") setOrders(ordersResult.value.orders || []);
    if (profileResult.status === "fulfilled") setProfile(profileResult.value);
    setLoading(false);
  }, [session]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  useEffect(() => {
    refresh();
    const retry = window.setTimeout(() => refresh(), 1800);
    return () => window.clearTimeout(retry);
  }, [refresh]);
  const logout = async () => {
    if (session) {
      try {
        await api.logout(session.tokens.refresh_token);
      } catch {
        /* Session locale à purger même si l'API est indisponible. */
      }
    }
    storeSession(null);
    setSession(null);
  };
  if (!session) return <LoginScreen onLogin={(nextSession) => { setAuthNotice(""); setSession(nextSession); }} notice={authNotice} />;
  const token = session.tokens.access_token;
  const body =
    page === "overview" ? (
      <DashboardPage
        session={session}
        overview={overview}
        report={clientReport}
        recent={recent}
        investments={investments}
        go={setPage}
      />
    ) : page === "investments" ? (
      <InvestmentsPage
        token={token}
        instruments={instruments}
        investments={investments}
        orders={orders}
        accounts={accounts}
        currentClientId={session.client.client_id}
        refresh={refresh}
        notify={notify}
      />
    ) : page === "operations" ? (
      <OperationsPage
        token={token}
        accounts={accounts}
        transactions={transactions}
        currentClientId={session.client.client_id}
        isBackOffice={Boolean(backOfficeReport)}
        refresh={refresh}
        notify={notify}
      />
    ) : page === "accounts" ? (
      <AccountsPage
        token={token}
        accounts={accounts}
        refresh={refresh}
        notify={notify}
      />
    ) : page === "backoffice" ? (
      <BackOfficePage token={token} report={backOfficeReport} regulatory={regulatoryReport} refresh={refresh} notify={notify} />
    ) : (
      <ProfilePage
        token={token}
        profile={profile}
        refresh={refresh}
        notify={notify}
      />
    );
  return (
    <>
      <Shell session={session} page={page} setPage={setPage} onLogout={logout} theme={theme} canAccessBackOffice={Boolean(backOfficeReport)} onToggleTheme={() => setTheme((current) => current === "light" ? "dark" : "light")}>
        {loading && (
          <div className="sync-indicator">
            <Spinner /> Synchronisation
          </div>
        )}
        {body}
      </Shell>
      {toast && (
        <div className={`toast toast-${toast.tone}`} role="status">
          <span>
            <Icon
              name={toast.tone === "success" ? "check" : "alert"}
              size={17}
            />
          </span>
          {toast.message}
          <button onClick={() => setToast(null)} aria-label="Fermer">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </>
  );
}

export default App;
