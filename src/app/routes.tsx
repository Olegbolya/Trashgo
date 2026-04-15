import { createBrowserRouter } from "react-router";
import { lazy, Suspense, type ComponentType } from "react";
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
const FindOrdersNew = lazy(() => import("./pages/FindOrdersNew"));
const MySubscriptions = lazy(() => import("./pages/MySubscriptions"));
const FindContractors = lazy(() => import("./pages/FindContractors"));
const MyContractors = lazy(() => import("./pages/MyContractors"));
const CreateSubscription = lazy(() => import("./pages/CreateSubscription"));
const OrderConfirmed = lazy(() => import("./pages/OrderConfirmed"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const InviteNeighbor = lazy(() => import("./pages/InviteNeighbor"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

function page(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function guarded(Component: ComponentType, role?: 'customer' | 'contractor') {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute requiredRole={role}>
        <Component />
      </ProtectedRoute>
    </Suspense>
  );
}

function guardedLayout(Component: ComponentType, role?: 'customer' | 'contractor') {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute requiredRole={role}>
        <Layout><Component /></Layout>
      </ProtectedRoute>
    </Suspense>
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
  { path: "/how-it-works", element: page(HowItWorks) },

  // Protected — auth required, role-specific
  { path: "/dashboard", element: guarded(UnifiedDashboard) },
  { path: "/customer", element: guarded(CustomerDashboard, 'customer') },
  { path: "/contractor", element: guarded(ContractorDashboard, 'contractor') },

  // Protected + Layout — customer pages
  { path: "/create-order", element: guardedLayout(CreateOrder, 'customer') },
  { path: "/my-subscriptions", element: guardedLayout(MySubscriptions, 'customer') },
  { path: "/find-contractors", element: guardedLayout(FindContractors, 'customer') },
  { path: "/my-contractors", element: guardedLayout(MyContractors, 'customer') },
  { path: "/create-subscription", element: guardedLayout(CreateSubscription, 'customer') },
  { path: "/invite-neighbor", element: guardedLayout(InviteNeighbor) },
  { path: "/order-confirmed", element: guardedLayout(OrderConfirmed) },

  // Protected + Layout — contractor pages
  { path: "/find-orders", element: guardedLayout(FindOrders, 'contractor') },
  { path: "/find-orders-new", element: guardedLayout(FindOrdersNew, 'contractor') },
  { path: "/order/:id", element: guardedLayout(OrderDetail) },

  // 404
  { path: "*", element: page(NotFound) },
]);
