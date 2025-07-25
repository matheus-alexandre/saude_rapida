import { BrowserRouter } from "react-router-dom"
import { Route } from "react-router-dom"
import { Routes } from "react-router-dom"
import  { Navigate } from "react-router-dom"

// Pages
import { PageHome } from "../pages/Home";
import { AdminPage } from "../pages/Admin";
import { TriagePage } from "../pages/Triage";

export const MyRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<PageHome />} />
        <Route path='*' element={<PageHome />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/triage" element={<TriagePage />} />
      </Routes>
    </BrowserRouter>
  )
}
