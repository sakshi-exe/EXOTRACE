import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import AnomalyDetectionPage from './pages/AnomalyDetection'
import CausalAnalysisPage from './pages/CausalAnalysis'
import DataSourcesPage from './pages/DataSources'
import FailureTimelinePage from './pages/FailureTimeline'
import InvestigationReportPage from './pages/InvestigationReport'
import MissionOverviewPage from './pages/MissionOverview'
import ModelStatusPage from './pages/ModelStatus'
import NotFoundPage from './pages/NotFound'
import SettingsPage from './pages/Settings'
import TelemetryExplorerPage from './pages/TelemetryExplorer'

export default function AppRoutes() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route index element={<Navigate to="/mission" replace />} />
      <Route path="mission" element={<MissionOverviewPage />} />
      <Route path="telemetry" element={<TelemetryExplorerPage />} />
      <Route path="anomalies" element={<AnomalyDetectionPage />} />
      <Route path="timeline" element={<FailureTimelinePage />} />
      <Route path="causal" element={<CausalAnalysisPage />} />
      <Route path="investigation" element={<InvestigationReportPage />} />
      <Route path="data-sources" element={<DataSourcesPage />} />
      <Route path="models" element={<ModelStatusPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="causal-analysis" element={<Navigate to="/causal" replace />} />
      <Route path="report" element={<Navigate to="/investigation" replace />} />
      <Route path="model-status" element={<Navigate to="/models" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
}