import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "labor", label: "Mano de obra" },
  { value: "materials", label: "Materiales" },
  { value: "software", label: "Software" },
  { value: "equipment", label: "Equipamiento" },
  { value: "other", label: "Otro" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

const CATEGORY_COLORS: Record<Category, string> = {
  labor: "bg-blue-100 text-blue-700",
  materials: "bg-yellow-100 text-yellow-700",
  software: "bg-purple-100 text-purple-700",
  equipment: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

export function RegistrosCostoPage() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    projectId: "" as Id<"projects"> | "",
    category: "labor" as Category,
    amount: "",
    description: "",
    date: today,
  });

  const projects = useQuery(api.projects.list) || [];
  const costEntries = useQuery(api.finances.listCostEntries, {}) || [];
  const addCostEntry = useMutation(api.finances.addCostEntry);
  const deleteCostEntry = useMutation(api.finances.deleteCostEntry);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) {
      toast.error("Seleccioná un proyecto");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresá un monto válido");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Ingresá una descripción");
      return;
    }
    try {
      await addCostEntry({
        projectId: form.projectId as Id<"projects">,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        date: form.date,
      });
      toast.success("Costo registrado");
      setForm({ projectId: "", category: "labor", amount: "", description: "", date: today });
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id: Id<"costEntries">) => {
    try {
      await deleteCostEntry({ id });
      toast.success("Registro eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const totalCosts = costEntries.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = costEntries
    .filter((e) => e.date.startsWith(today.slice(0, 7)))
    .reduce((sum, e) => sum + e.amount, 0);

  const projectName = (id: Id<"projects">) =>
    projects.find((p) => p._id === id)?.name ?? "—";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <span className="text-red-600">Registros de Costo</span>
        </h1>
        <p className="text-gray-600">Registrá y gestioná los costos de tus proyectos</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-gray-600">Total costos</p>
          <p className="text-2xl font-bold text-red-600">${totalCosts.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-sm text-gray-600">Este mes</p>
          <p className="text-2xl font-bold text-yellow-600">${thisMonth.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-600">Registros</p>
          <p className="text-2xl font-bold text-blue-600">{costEntries.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo costo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value as Id<"projects"> | "" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Seleccioná un proyecto</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                placeholder="Descripción del costo..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Registrar costo
            </button>
          </form>
        </div>

        {/* Lista de registros */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Últimos registros
            <span className="ml-2 text-sm font-normal text-gray-500">({costEntries.length})</span>
          </h3>
          {costEntries.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aún no hay registros de costo</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {costEntries.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[entry.category as Category]}`}>
                        {CATEGORIES.find((c) => c.value === entry.category)?.label}
                      </span>
                      <span className="text-xs text-gray-400">{entry.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.description}</p>
                    <p className="text-xs text-gray-500">{projectName(entry.projectId)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="font-semibold text-red-600 whitespace-nowrap">
                      -${entry.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
