import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CustomerListPage   from './pages/CustomerListPage'
import CustomerCreatePage from './pages/CustomerCreatePage'
import CustomerEditPage   from './pages/CustomerEditPage'
import CustomerViewPage   from './pages/CustomerViewPage'
import BulkUploadPage     from './pages/BulkUploadPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"                  element={<Navigate to="/customers" replace />} />
        <Route path="/customers"         element={<CustomerListPage />} />
        <Route path="/customers/create"  element={<CustomerCreatePage />} />
        <Route path="/customers/:id"     element={<CustomerViewPage />} />
        <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
        <Route path="/bulk-upload"       element={<BulkUploadPage />} />
        <Route path="*"                  element={<Navigate to="/customers" replace />} />
      </Routes>
    </Layout>
  )
}
