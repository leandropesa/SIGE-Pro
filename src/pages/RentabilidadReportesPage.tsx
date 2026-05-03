import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    planning: "bg-gray-100 text-gray-600",
    active: "bg-blue-100 text-blue-700",
    review: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
  };
  const labels: Record<string, string> = {
    planning: "Planificación",
    active: "Activo",
    review: "Revisión",
    completed: "Completado",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function RentabilidadReportesPage() {
  const summary = useQuery(api.finances.getProfitabilitySummary);

  if (summary === undefined) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No se pudo cargar el resumen.</p>
      </div>
    );
  }

  const { totalIncome, totalCosts, netProfit, margin, byProject, costsByCategory } = summary;

  const CATEGORY_LABELS: Record<string, string> = {
    labor: "Mano de obra",
    materials: "Materiales",
    software: "Software",
    equipment: "Equipamiento",
    other: "Otro",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <span className="text-green-600">Rentabilidad y Reportes</span>
        </h1>
        <p className="text-gray-600">Métricas calculadas en tiempo real desde tus registros</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Ingresos totales</p>
          <p className="text-2xl font-bold text-green-600">${fmt(totalIncome)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Costos totales</p>
          <p className="text-2xl font-bold text-red-600">${fmt(totalCosts)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Ganancia neta</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {netProfit >= 0 ? "+" : ""}${fmt(netProfit)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Margen</p>
          <p className={`text-2xl font-bold ${margin >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {margin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Costos por categoría */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Costos por categoría</h3>
          {Object.keys(costsByCategory).length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Sin registros de costo aún</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(costsByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = totalCosts > 0 ? (amount / totalCosts) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{CATEGORY_LABELS[cat] ?? cat}</span>
                        <span className="font-medium text-gray-900">${fmt(amount)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Balance visual */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance general</h3>
          {totalIncome === 0 && totalCosts === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Sin registros aún. Agregá ingresos y costos para ver el balance.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Ingresos</span>
                  <span className="font-medium text-green-600">${fmt(totalIncome)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Costos</span>
                  <span className="font-medium text-red-600">${fmt(totalCosts)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: totalIncome > 0 ? `${Math.min((totalCosts / totalIncome) * 100, 100)}%` : "0%" }}
                  />
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg ${netProfit >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Resultado</span>
                  <span className={`text-lg font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {netProfit >= 0 ? "+" : ""}${fmt(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla por proyecto */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rentabilidad por proyecto</h3>
        {byProject.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No hay proyectos creados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Ingresos</th>
                  <th className="px-4 py-3 text-right">Costos</th>
                  <th className="px-4 py-3 text-right">Ganancia</th>
                  <th className="px-4 py-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byProject
                  .sort((a, b) => b.profit - a.profit)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-right text-green-600">${fmt(p.income)}</td>
                      <td className="px-4 py-3 text-right text-red-600">${fmt(p.costs)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${p.profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {p.profit >= 0 ? "+" : ""}${fmt(p.profit)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.income > 0 ? (
                          <span className={`font-medium ${p.margin >= 50 ? "text-green-600" : p.margin >= 0 ? "text-yellow-600" : "text-red-600"}`}>
                            {p.margin}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
