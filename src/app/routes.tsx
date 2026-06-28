import { createBrowserRouter } from "react-router";
import { lazy, Suspense, Component, type ComponentType, type ReactNode, type ErrorInfo } from "react";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy-load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Verify = lazy(() => import("./pages/Verify"));
const SelectRole = lazy(() => import("./pages/SelectRole"));
const RegisterCustomer = lazy(() => import("./pages/RegisterCustomer"));
const RegisterContractor = lazy(() => import("./pages/RegisterContractor"));
const UnifiedDashboard = lazy(() => import("./pages/UnifiedDashboard"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const ContractorDashboard = lazy(() => import("./pages/ContractorDashboard"));
const CreateOrder = lazy(() => import("./pages/CreateOrder"));
const FindOrders = lazy(() => import("./pages/FindOrders"));
const MySubscriptions = lazy(() => import("./pages/MySubscriptions"));
const FindContractors = lazy(() => import("./pages/FindContractors"));
const MyContractors = lazy(() => import("./pages/MyContractors"));
const CreateSubscription = lazy(() => import("./pages/CreateSubscription"));
const OrderConfirmed = lazy(() => import("./pages/OrderConfirmed"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const InviteNeighbor = lazy(() => import("./pages/InviteNeighbor"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const RefRedirect = lazy(() => import("./pages/RefRedirect"));
const ContractorReferral = lazy(() => import("./pages/ContractorReferral"));
const Help = lazy(() => import("./pages/Help"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Payment = lazy(() => import("./pages/Payment"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Subscription = lazy(() => import("./pages/Subscription"));
const VkCallback = lazy(() => import("./pages/VkCallback"));
const RegisterVk = lazy(() => import("./pages/RegisterVk"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Загрузка...</span>
      </div>
    </div>
  );
}

class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; error: Error | null; countdown: number }> {
  private _timer: ReturnType<typeof setInterval> | null = null;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { failed: false, error: null, countdown: 5 };
  }

  static getDerivedStateFromError(error: Error) {
    const isChunk =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      (error as any)?.name === 'ChunkLoadError';
    if (isChunk) {
      const countKey = 'chunk_reload_count';
      const tsKey = 'chunk_reload_ts';
      const count = parseInt(sessionStorage.getItem(countKey) ?? '0', 10);
      const last = parseInt(sessionStorage.getItem(tsKey) ?? '0', 10);
      const age = Date.now() - last;
      // Allow up to 3 reloads, debounced 5s apart; reset counter after 2 min of no errors
      if (count < 3 && age > 5000) {
        sessionStorage.setItem(countKey, age > 120000 ? '1' : String(count + 1));
        sessionStorage.setItem(tsKey, String(Date.now()));
        window.location.reload();
        return { failed: false, error: null, countdown: 5 };
      }
    }
    return { failed: true, error, countdown: 5 };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ChunkErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(_: unknown, prev: { failed: boolean }) {
    if (this.state.failed && !prev.failed) {
      this._timer = setInterval(() => {
        this.setState((s) => {
          if (s.countdown <= 1) {
            clearInterval(this._timer!);
            this._timer = null;
            window.location.href = '/';
            return { countdown: 0 };
          }
          return { countdown: s.countdown - 1 };
        });
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this._timer) clearInterval(this._timer);
  }

  handleRetry = () => {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this.setState({ failed: false, error: null, countdown: 5 });
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', background: '#f9fafb' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Что-то пошло не так</h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
          Произошла непредвиденная ошибка.<br />
          Переход на главную через {this.state.countdown} с…
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={this.handleRetry}
            style={{ padding: '0.625rem 1.5rem', borderRadius: '0.75rem', background: '#22a849', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Попробовать снова
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{ padding: '0.625rem 1.5rem', borderRadius: '0.75rem', background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }
}

function page(Component: ComponentType) {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

function guarded(Component: ComponentType, role?: 'customer' | 'contractor') {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute requiredRole={role}>
          <Component />
        </ProtectedRoute>
      </Suspense>
    </ChunkErrorBoundary>
  );
}

function guardedLayout(Component: ComponentType, role?: 'customer' | 'contractor') {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute requiredRole={role}>
          <Layout><Component /></Layout>
        </ProtectedRoute>
      </Suspense>
    </ChunkErrorBoundary>
  );
}

export const router = createBrowserRouter([
  // Public — no auth required
  { path: "/", element: page(Home) },
  { path: "/login", element: page(Login) },
  { path: "/verify", element: page(Verify) },
  { path: "/select-role", element: page(SelectRole) },
  { path: "/register-customer", element: page(RegisterCustomer) },
  { path: "/register-contractor", element: page(RegisterContractor) },
  { path: "/auth/vk/callback", element: page(VkCallback) },
  { path: "/register-vk", element: page(RegisterVk) },
  { path: "/how-it-works", element: page(HowItWorks) },
  { path: "/ref/:code", element: page(RefRedirect) },
  { path: "/privacy", element: page(Privacy) },
  { path: "/terms", element: page(Terms) },

  // Protected — auth required (both dashboards accessible for role switching)
  { path: "/dashboard", element: guarded(UnifiedDashboard) },
  { path: "/customer", element: guarded(CustomerDashboard) },
  { path: "/contractor", element: guarded(ContractorDashboard) },

  // Protected + Layout — customer pages
  { path: "/create-order", element: guardedLayout(CreateOrder, 'customer') },
  { path: "/my-subscriptions", element: guardedLayout(MySubscriptions, 'customer') },
  { path: "/find-contractors", element: guardedLayout(FindContractors, 'customer') },
  { path: "/my-contractors", element: guardedLayout(MyContractors, 'customer') },
  { path: "/create-subscription", element: guardedLayout(CreateSubscription, 'customer') },
  { path: "/invite-neighbor", element: guardedLayout(InviteNeighbor) },
  { path: "/help", element: guarded(Help) },
  { path: "/notifications", element: guarded(Notifications) },
  { path: "/payment", element: guarded(Payment) },
  { path: "/subscription", element: guarded(Subscription) },
  { path: "/order-confirmed", element: guardedLayout(OrderConfirmed) },

  // Protected + Layout — contractor pages
  { path: "/contractor-referral", element: guardedLayout(ContractorReferral) },
  { path: "/find-orders", element: guardedLayout(FindOrders, 'contractor') },
  { path: "/order/:id", element: guardedLayout(OrderDetail) },
  { path: "/leaderboard", element: guarded(Leaderboard) },

  // Admin panel (public, protected by ?secret=)
  { path: "/admin", element: page(Admin) },

  // 404
  { path: "*", element: page(NotFound) },
]);
