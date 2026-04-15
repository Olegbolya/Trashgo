import { createBrowserRouter, type RouteObject } from "react-router";
import { lazy, Suspense, type ComponentType } from "react";
import Layout from "./components/Layout";

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

// Loading fallback
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

// Helper to wrap lazy component with Suspense
function page(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function withLayout(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Layout><Component /></Layout>
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Public pages (no layout)
  { path: "/", element: page(Home) },
  { path: "/login", element: page(Login) },
  { path: "/verify", element: page(Verify) },
  { path: "/select-role", element: page(SelectRole) },
  { path: "/register-customer", element: page(RegisterCustomer) },
  { path: "/register-contractor", element: page(RegisterContractor) },

  // Dashboards (self-contained layout)
  { path: "/dashboard", element: page(UnifiedDashboard) },
  { path: "/customer", element: page(CustomerDashboard) },
  { path: "/contractor", element: page(ContractorDashboard) },

  // Feature pages (with sidebar Layout)
  { path: "/create-order", element: withLayout(CreateOrder) },
  { path: "/find-orders", element: withLayout(FindOrders) },
  { path: "/find-orders-new", element: withLayout(FindOrdersNew) },
  { path: "/my-subscriptions", element: withLayout(MySubscriptions) },
  { path: "/find-contractors", element: withLayout(FindContractors) },
  { path: "/my-contractors", element: withLayout(MyContractors) },
  { path: "/create-subscription", element: withLayout(CreateSubscription) },
  { path: "/invite-neighbor", element: withLayout(InviteNeighbor) },
  { path: "/order-confirmed", element: withLayout(OrderConfirmed) },
  { path: "/order/:id", element: withLayout(OrderDetail) },
  { path: "/how-it-works", element: withLayout(HowItWorks) },

  // 404 catch-all
  { path: "*", element: page(NotFound) },
]);
