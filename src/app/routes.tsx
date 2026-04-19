import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardOverview } from "./pages/DashboardOverview";
import { ConversationsPage } from "./pages/ConversationsPage";
import { AITrainingPage } from "./pages/AITrainingPage";
import { LeadsPage } from "./pages/LeadsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/dashboard",
    Component: ProtectedRoute,
    children: [
      {
        Component: DashboardLayout,
        children: [
          { index: true, Component: DashboardOverview },
          { path: "conversations", Component: ConversationsPage },
          { path: "ai-training", Component: AITrainingPage },
          { path: "leads", Component: LeadsPage },
          { path: "analytics", Component: AnalyticsPage },
          { path: "settings", Component: SettingsPage },
        ],
      },
    ],
  },
]);
