import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { ProductForm } from './pages/ProductForm'
import { ProductDetail } from './pages/ProductDetail'
import { Routine } from './pages/Routine'
import { Scan } from './pages/Scan'
import { Ingredients } from './pages/Ingredients'
import { IngredientDetail } from './pages/IngredientDetail'
import { Analysis } from './pages/Analysis'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="routine" element={<Routine />} />
        <Route path="scan" element={<Scan />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="ingredients/:id" element={<IngredientDetail />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
