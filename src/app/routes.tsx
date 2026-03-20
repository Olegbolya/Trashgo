import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import SelectRole from "./pages/SelectRole";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterContractor from "./pages/RegisterContractor";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import CreateOrder from "./pages/CreateOrder";
import FindOrders from "./pages/FindOrders";
import MySubscriptions from "./pages/MySubscriptions";
import FindContractors from "./pages/FindContractors";
import MyContractors from "./pages/MyContractors";
import CreateSubscription from "./pages/CreateSubscription";
import OrderConfirmed from "./pages/OrderConfirmed";
import OrderDetail from "./pages/OrderDetail";
import InviteNeighbor from "./pages/InviteNeighbor";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    ErrorBoundary: NotFound,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/verify",
    Component: Verify,
  },
  {
    path: "/select-role",
    Component: SelectRole,
  },
  {
    path: "/role-select",
    Component: SelectRole,
  },
  {
    path: "/register-customer",
    Component: RegisterCustomer,
  },
  {
    path: "/register-contractor",
    Component: RegisterContractor,
  },
  {
    path: "/dashboard",
    Component: UnifiedDashboard,
  },
  {
    path: "/customer",
    Component: CustomerDashboard,
  },
  {
    path: "/contractor",
    Component: ContractorDashboard,
  },
  {
    path: "/create-order",
    element: <Layout><CreateOrder /></Layout>,
  },
  {
    path: "/find-orders",
    element: <Layout><FindOrders /></Layout>,
  },
  {
    path: "/my-subscriptions",
    element: <Layout><MySubscriptions /></Layout>,
  },
  {
    path: "/find-contractors",
    element: <Layout><FindContractors /></Layout>,
  },
  {
    path: "/my-contractors",
    element: <Layout><MyContractors /></Layout>,
  },
  {
    path: "/create-subscription",
    element: <Layout><CreateSubscription /></Layout>,
  },
  {
    path: "/invite-neighbor",
    element: <Layout><InviteNeighbor /></Layout>,
  },
  {
    path: "/order-confirmed",
    element: <Layout><OrderConfirmed /></Layout>,
  },
  {
    path: "/order/:id",
    element: <Layout><OrderDetail /></Layout>,
  },
  {
    path: "/how-it-works",
    element: <Layout><HowItWorks /></Layout>,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);