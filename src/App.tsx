import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { TaskManager } from "@/pages/TaskManager";
import { Statistics } from "@/pages/Statistics";
import { History } from "@/pages/History";
import { Help } from "@/pages/Help";
import { WeeklyPlanner } from "@/pages/WeeklyPlanner";
import { useStore } from "./store/useStore";

export default function App() {
  const loadFromStorage = useStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/weekly" element={<WeeklyPlanner />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/history" element={<History />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  );
}
