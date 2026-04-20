import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { DyslexiaProvider } from './design-system/DyslexiaProvider'
import { MainLayout } from './components/layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import { DyslexiaCard, DyslexiaText } from './design-system'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ReadingWorkspacePage = lazy(() => import('./pages/ReadingWorkspacePage').then(m => ({ default: m.ReadingWorkspacePage })))
const AssistantPage = lazy(() => import('./pages/AssistantPage').then(m => ({ default: m.AssistantPage })))
const GamesPage = lazy(() => import('./pages/GamesPage').then(m => ({ default: m.GamesPage })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then(m => ({ default: m.ProgressPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const WordAnalysisPage = lazy(() => import('./pages/WordAnalysisPage').then(m => ({ default: m.WordAnalysisPage })))
const SpellingPatternsPage = lazy(() => import('./pages/SpellingPatternsPage').then(m => ({ default: m.SpellingPatternsPage })))
const VisualLearningPage = lazy(() => import('./pages/VisualLearningPage').then(m => ({ default: m.VisualLearningPage })))
const ReadingCoachPage = lazy(() => import('./pages/ReadingCoachPage').then(m => ({ default: m.ReadingCoachPage })))
const StorySummariserPage = lazy(() => import('./pages/StorySummariserPage').then(m => ({ default: m.StorySummariserPage })))
const ARGamePage = lazy(() => import('./pages/ARGamePage').then(m => ({ default: m.ARGamePage })))

// Loading fallback component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <DyslexiaCard className="p-8">
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <DyslexiaText variant="body">Loading...</DyslexiaText>
      </div>
    </DyslexiaCard>
  </div>
)

function App() {
  return (
    <DyslexiaProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reading"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <ReadingWorkspacePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <AssistantPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <GamesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <ProgressPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/word-analysis"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <WordAnalysisPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/spelling-patterns"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <SpellingPatternsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/visual-learning"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <VisualLearningPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reading-coach"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <ReadingCoachPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/story-summariser"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <StorySummariserPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ar-game"
              element={
                <ProtectedRoute>
                  <MainLayout showQuickSettings={true}>
                    <ARGamePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </DyslexiaProvider>
  )
}

export default App
