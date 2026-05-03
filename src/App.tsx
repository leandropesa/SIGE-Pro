import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Sidebar } from "./components/Sidebar";
import { StatsPage } from "./pages/StatsPage";
import { CargaHorasPage } from "./pages/CargaHorasPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AccountPage } from "./pages/AccountPage";
import { RegistrosCostoPage } from "./pages/RegistrosCostoPage";
import { RegistroIngresoPage } from "./pages/RegistroIngresoPage";
import { RentabilidadReportesPage } from "./pages/RentabilidadReportesPage";
import { Toaster } from "sonner";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function App() {
  const [currentPage, setCurrentPage] = useState("stats");

  const renderPage = () => {
    switch (currentPage) {
      case "stats":
        return <StatsPage />;
      case "carga-horas":
        return <CargaHorasPage />;
      case "projects":
        return <ProjectsPage />;
      case "registros-costo":
        return <RegistrosCostoPage />;
      case "registro-ingreso":
        return <RegistroIngresoPage />;
      case "rentabilidad-reportes":
        return <RentabilidadReportesPage />;
      case "account":
        return <AccountPage />;
      default:
        return <StatsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <div className="flex h-screen">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 lg:hidden">
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                </h2>
                <div className="ml-auto">
                  <SignOutButton />
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <Content currentPage={currentPage} renderPage={renderPage} />
            </main>
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-primary">SIGE-Pro</h2>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-primary mb-4">Welcome</h1>
                <p className="text-xl text-secondary">Sign in to access your dashboard</p>
              </div>
              <SignInForm />
            </div>
          </main>
        </div>
      </Unauthenticated>

      <Toaster />
    </div>
  );
}

function Content({ currentPage, renderPage }: { currentPage: string; renderPage: () => React.JSX.Element }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return renderPage();
}
