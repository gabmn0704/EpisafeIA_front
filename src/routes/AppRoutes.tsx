import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { GuestOnly, RequireAuth } from './guards'

const Landing = lazy(() => import('@/pages/landing/LandingPage'))
const Login = lazy(() => import('@/pages/auth/LoginPage'))
const Register = lazy(() => import('@/pages/auth/RegisterPage'))
const Forgot = lazy(() => import('@/pages/auth/ForgotPage'))
const Dashboard = lazy(() => import('@/pages/app/DashboardPage'))
const DailyLog = lazy(() => import('@/pages/app/DailyLogPage'))
const Medications = lazy(() => import('@/pages/app/MedicationsPage'))
const Crisis = lazy(() => import('@/pages/app/CrisisPage'))
const CrisisDetail = lazy(() => import('@/pages/app/CrisisDetailPage'))
const Emergency = lazy(() => import('@/pages/app/EmergencyPage'))
const Insights = lazy(() => import('@/pages/app/InsightsPage'))
const Contacts = lazy(() => import('@/pages/app/ContactsPage'))
const Report = lazy(() => import('@/pages/app/ReportPage'))
const Devices = lazy(() => import('@/pages/app/DevicesPage'))

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg p-6 text-center">
      <div>
        <p className="font-display text-8xl font-bold text-brand">404</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Esta página no existe</h1>
        <p className="mt-2 text-muted">Puede que el enlace haya cambiado.</p>
        <Link to="/" className={buttonClasses('primary', 'lg', 'mt-8')}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<GuestOnly />}>
          <Route path="/iniciar-sesion" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar" element={<Forgot />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="registro" element={<DailyLog />} />
            <Route path="medicamentos" element={<Medications />} />
            <Route path="crisis" element={<Crisis />} />
            <Route path="crisis/:id" element={<CrisisDetail />} />
            <Route path="emergencia" element={<Emergency />} />
            <Route path="insights" element={<Insights />} />
            <Route path="contactos" element={<Contacts />} />
            <Route path="informe" element={<Report />} />
            <Route path="dispositivos" element={<Devices />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
