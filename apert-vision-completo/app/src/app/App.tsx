import { RouterProvider } from "react-router"
import { router } from "./routes"
import { AnalysisProvider } from "./context/AnalysisContext"
import { AuthProvider } from "./context/AuthContext"

export default function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <RouterProvider router={router} />
      </AnalysisProvider>
    </AuthProvider>
  )
}
