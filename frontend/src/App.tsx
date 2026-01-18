import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { EvidenceVault } from './pages/EvidenceVault';
import { UploadEvidence } from './pages/UploadEvidence';
import { ChainOfCustody } from './pages/ChainOfCustody';
import { Verification } from './pages/Verification';
import { Alerts } from './pages/Alerts';
import { AuditLog } from './pages/AuditLog';
import { ToastProvider } from './components/ui/Toast';
import { Login } from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';

// Placeholders for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="bg-slate-100 p-8 rounded-lg border border-slate-200 text-center text-slate-500">
      Feature Under Development
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="vault" element={<EvidenceVault />} />
              <Route path="upload" element={<UploadEvidence />} />
              <Route path="custody" element={<ChainOfCustody />} />
              <Route path="verification" element={<Verification />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="audit" element={<AuditLog />} />
              <Route path="settings" element={<Placeholder title="Settings" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
