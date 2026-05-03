import { useState } from "react";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  FolderIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: "stats", label: "Statistics", icon: ChartBarIcon, color: "text-blue-600" },
  { id: "carga-horas", label: "Carga de Horas", icon: ClockIcon, color: "text-purple-600" },
  { id: "projects", label: "Projects", icon: FolderIcon, color: "text-purple-600" },
  { id: "registros-costo", label: "Registros de Costo", icon: DocumentTextIcon, color: "text-green-600" },
  { id: "registro-ingreso", label: "Registro de Ingreso", icon: BanknotesIcon, color: "text-green-600" },
  { id: "rentabilidad-reportes", label: "Rentabilidad y Reportes", icon: PresentationChartLineIcon, color: "text-green-600" },
  { id: "account", label: "Account", icon: UserIcon, color: "text-gray-600" },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SIGE-Pro</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 mr-3 ${item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
