import { Route, Routes, Navigate, BrowserRouter} from 'react-router-dom'
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { AppLayout } from "./components/AppLayout"
import Login from "./pages/Login"
import Cadastro from "./pages/clientes/Cadastro"
import Menu from "./pages/Menu"
import './App.css'
import { Toaster } from 'sonner'
import Clientes from './pages/clientes/Clientes'
import { AppLayoutFinanceiro } from './components/AppLayoutFinanceiro'
import Pipeline from './pages/crm/Pipeline'
import Contratos from './pages/crm/Contratos'
import Dashboards from './pages/crm/Dashboards'
import Financeiro from './pages/pilares/Financeiro'
import Comercial from './pages/pilares/Comercial'
import Gestao from './pages/pilares/Gestao'
import Operacoes from './pages/pilares/Operacoes'
import People from './pages/pilares/Pessoas'
import Tech from './pages/pilares/Tecnologia'
import Experiencia from './pages/pilares/Experiencia'
import { PilaresQuestionario } from './components/PilaresQuestionario'
import Diagnostico from './pages/clientes/Diagnostico'
import AppDiagnostico from './components/AppDiagnostico'
import DiagnosticoIndividual from './pages/clientes/DiagnosticoIndividual'


function ProtectedRoute( { children } : {children : React.ReactNode}) {
 const {loading, user} = useAuth()
 if (loading) return null;
 if (!user) return <Navigate to="/login" replace />;
 return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path='/login' element={<Login />} />

    <Route path='/menu' element={<ProtectedRoute>
      <Menu />
    </ProtectedRoute>}/>

    <Route element={
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>}>
      <Route path="/clientes/dados" element={<Cadastro />} />
      <Route path="/clientes/view" element={<Clientes />} />
    </Route>

    <Route element={
      <ProtectedRoute>
        <PilaresQuestionario />
      </ProtectedRoute>}>
      <Route path="/clientes/form/:empresa/gestao" element={<Gestao />} />
      <Route path="/clientes/form/:empresa/financeiro" element={<Financeiro />} />
      <Route path="/clientes/form/:empresa/comercial" element={<Comercial />} />
      <Route path="/clientes/form/:empresa/operacoes" element={<Operacoes />} />
      <Route path="/clientes/form/:empresa/pessoas" element={<People />} />
      <Route path="/clientes/form/:empresa/clientesexperiencia" element={<Experiencia />} />
      <Route path="/clientes/form/:empresa/tecnologia" element={<Tech />} />      
    </Route>

    <Route element={
      <ProtectedRoute>
       <AppDiagnostico />
      </ProtectedRoute>
    }>
      <Route path="/clientes/:empresa/diagnostico/geral" element={<Diagnostico />} />
      <Route path="/clientes/:empresa/diagnostico/individual" element={<DiagnosticoIndividual />} />
    </Route>

    <Route element={
      <ProtectedRoute>
        <AppLayoutFinanceiro />
      </ProtectedRoute>}>
      <Route path="/financeiro/pipeline" element={<Pipeline />} />
      <Route path="/financeiro/dashboards" element={<Dashboards />} />
      <Route path="/financeiro/contratos" element={<Contratos />} />
      
    </Route>

    <Route path='*' element={<Navigate to="/login" replace />} />
  </Routes>

);

const App = () => {
  return(
        <BrowserRouter>
          <AuthProvider>
            <Toaster position='top-right' />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
  )
};

export default App
