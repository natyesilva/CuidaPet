import { Capacitor } from '@capacitor/core'
import { type ReactNode, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { LandingPage } from '../../App'
import { HistoryPage } from '../features/doses/HistoryPage'
import { TodayPage } from '../features/doses/TodayPage'
import { HomePage } from '../features/home/HomePage'
import { LoginPage, RegisterPage } from '../features/auth/AuthPage'
import { AuthProvider } from '../features/auth/AuthProvider'
import { useAuth } from '../features/auth/auth-context'
import { NewPetPage } from '../features/pets/NewPetPage'
import { PetDetailPage } from '../features/pets/PetDetailPage'
import { PetsPage } from '../features/pets/PetsPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { AppSplashScreen } from '../features/splash/AppSplashScreen'
import { NewTreatmentPage } from '../features/treatments/NewTreatmentPage'
import { TreatmentsPage } from '../features/treatments/TreatmentsPage'
import { AppShell } from '../layout/AppShell'
import { FullScreenLoader } from '../shared/ui'

function RootRoute() {
  const { isAuthenticated } = useAuth()

  return Capacitor.isNativePlatform() ? (
    <Navigate to={isAuthenticated ? '/app/home' : '/app/login'} replace />
  ) : (
    <LandingPage />
  )
}

function NativeStartupGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()
  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(
    !Capacitor.isNativePlatform(),
  )

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const timeout = window.setTimeout(() => {
      setMinimumSplashElapsed(true)
    }, 1400)

    return () => window.clearTimeout(timeout)
  }, [])

  if (Capacitor.isNativePlatform() && (isLoading || !minimumSplashElapsed)) {
    return <AppSplashScreen />
  }

  return children
}

function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/app/login" replace />

  return <Outlet />
}

function PublicOnlyRoute() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) return <Navigate to="/app/home" replace />

  return <Outlet />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NativeStartupGate>
          <Routes>
            <Route path="/" element={<RootRoute />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/app/login" element={<LoginPage />} />
              <Route path="/app/register" element={<RegisterPage />} />
            </Route>

            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="pets" element={<PetsPage />} />
                <Route path="pets/new" element={<NewPetPage />} />
                <Route path="pets/:petId" element={<PetDetailPage />} />
                <Route path="treatments" element={<TreatmentsPage />} />
                <Route path="treatments/new" element={<NewTreatmentPage />} />
                <Route path="today" element={<TodayPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NativeStartupGate>
      </AuthProvider>
    </BrowserRouter>
  )
}
