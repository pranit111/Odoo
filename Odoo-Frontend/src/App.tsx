import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { OTPVerification } from './pages/OTPVerification';
import { Dashboard } from './pages/Dashboard';
import { ManufacturingOrderForm } from './pages/ManufacturingOrderForm';
import { ManufacturingOrderDetail } from './pages/ManufacturingOrderDetail';
import { WorkCenterList } from './pages/WorkCenterList';
import { StockLedger } from './pages/StockLedger';
import { StockLedgerForm } from './pages/StockLedgerForm';
import { Reports } from './pages/Reports';
import { WorkOrders } from './pages/WorkOrders';
import { WorkOrdersAnalysis } from './pages/WorkOrdersAnalysis';
import { BillsOfMaterials } from './pages/BillsOfMaterials';
import { BillOfMaterialForm } from './pages/BillOfMaterialForm';
import { ProfileSetup } from './pages/ProfileSetup';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/manufacturing-orders" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/manufacturing-orders/new" element={
            <ProtectedRoute>
              <ManufacturingOrderForm />
            </ProtectedRoute>
          } />
          <Route path="/manufacturing-orders/:id" element={
            <ProtectedRoute>
              <ManufacturingOrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/work-centers" element={
            <ProtectedRoute>
              <WorkCenterList />
            </ProtectedRoute>
          } />
          <Route path="/work-orders" element={
            <ProtectedRoute>
              <WorkOrders />
            </ProtectedRoute>
          } />
          <Route path="/stock-ledger" element={
            <ProtectedRoute>
              <StockLedger />
            </ProtectedRoute>
          } />
          <Route path="/stock-ledger/new" element={
            <ProtectedRoute>
              <StockLedgerForm />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/bills-of-materials" element={
            <ProtectedRoute>
              <BillsOfMaterials />
            </ProtectedRoute>
          } />
          <Route path="/bills-of-materials/new" element={
            <ProtectedRoute>
              <BillOfMaterialForm />
            </ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute>
              <WorkOrdersAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;