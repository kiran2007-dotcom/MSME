/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import { BusinessProvider } from './hooks/useBusiness.tsx';
import { ThemeProvider } from './hooks/useTheme.tsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegisterPage } from './pages/auth/RegisterPage.tsx';
import { AIAssistantPage } from './pages/dashboard/AIAssistantPage.tsx';
import { CompliancePage } from './pages/dashboard/CompliancePage.tsx';
import { DashboardPage } from './pages/dashboard/DashboardPage.tsx';
import { DocumentsPage } from './pages/dashboard/DocumentsPage.tsx';
import { ExpensesPage } from './pages/dashboard/ExpensesPage.tsx';
import { FinancePage } from './pages/dashboard/FinancePage.tsx';
import { InvoicesPage } from './pages/dashboard/InvoicesPage.tsx';
import { LoanReadinessPage } from './pages/dashboard/LoanReadinessPage.tsx';
import { ReportsPage } from './pages/dashboard/ReportsPage.tsx';
import { SchemesPage } from './pages/dashboard/SchemesPage.tsx';
import { SettingsPage } from './pages/dashboard/SettingsPage.tsx';
import { OnboardingPage } from './pages/onboarding/OnboardingPage.tsx';
import { LandingPage } from './pages/public/LandingPage.tsx';
import { PrivacyPage } from './pages/public/PrivacyPage.tsx';
import { TermsPage } from './pages/public/TermsPage.tsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BusinessProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Business Onboarding Route */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute requireBusiness={false}>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Application Dashboard Routes (All 11 Sections) */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/assistant"
                  element={
                    <ProtectedRoute>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/finance"
                  element={
                    <ProtectedRoute>
                      <FinancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/invoices"
                  element={
                    <ProtectedRoute>
                      <InvoicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/expenses"
                  element={
                    <ProtectedRoute>
                      <ExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/compliance"
                  element={
                    <ProtectedRoute>
                      <CompliancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/loan-readiness"
                  element={
                    <ProtectedRoute>
                      <LoanReadinessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/schemes"
                  element={
                    <ProtectedRoute>
                      <SchemesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/documents"
                  element={
                    <ProtectedRoute>
                      <DocumentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </BusinessProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
