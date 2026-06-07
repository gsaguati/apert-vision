import { RouterProvider } from "react-router"
import { router } from "./routes"
import { AnalysisProvider } from "./context/AnalysisContext"

export default function App() {
  return (
    <AnalysisProvider>
      <RouterProvider router={router} />
    </AnalysisProvider>
  )
}
