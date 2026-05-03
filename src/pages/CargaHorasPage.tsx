import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface TimeEntry {
  projectId: string;
  taskTitle: string;
  hours: number;
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
}

export function CargaHorasPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([
    { projectId: "", taskTitle: "", hours: 0, dayOfWeek: "monday" }
  ]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  const projects = useQuery(api.projects.list) || [];
  const weeklyEntries = useQuery(api.timeEntries.getWeeklyEntries, { weekOf: selectedWeek }) || [];
  const logHours = useMutation(api.timeEntries.logHours);

  const addEntry = () => {
    setEntries([...entries, { projectId: "", taskTitle: "", hours: 0, dayOfWeek: "monday" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof TimeEntry, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEntries = entries.filter(entry => 
      entry.projectId && entry.taskTitle && entry.hours > 0
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid entry");
      return;
    }

    try {
      await logHours({
        entries: validEntries.map(entry => ({
          projectId: entry.projectId as any,
          taskTitle: entry.taskTitle,
          hours: entry.hours,
          dayOfWeek: entry.dayOfWeek,
        })),
        weekOf: selectedWeek,
      });
      
      toast.success("Hours logged successfully!");
      setEntries([{ projectId: "", taskTitle: "", hours: 0, dayOfWeek: "monday" }]);
    } catch (error) {
      toast.error("Failed to log hours");
    }
  };

  const getDayTotal = (day: string) => {
    return weeklyEntries
      .filter(entry => entry.dayOfWeek === day)
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const weekTotal = weeklyEntries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <span className="text-purple-600">Carga de Horas</span>
        </h1>
        <p className="text-gray-600">Track and manage your working hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Entry Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Log Hours</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week of</label>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Entry {index + 1}</span>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={entry.projectId}
                    onChange={(e) => updateEntry(index, "projectId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={entry.taskTitle}
                    onChange={(e) => updateEntry(index, "taskTitle", e.target.value)}
                    placeholder="e.g., Frontend development, Bug fixes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={entry.hours}
                      onChange={(e) => updateEntry(index, "hours", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <select
                      value={entry.dayOfWeek}
                      onChange={(e) => updateEntry(index, "dayOfWeek", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Entry
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Log All Hours
              </button>
            </div>
          </form>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Summary</h3>
          <div className="space-y-3">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div key={day} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">{day}</span>
                <span className="font-semibold text-purple-600">{getDayTotal(day)}h</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg border-t-2 border-purple-600">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-purple-600">{weekTotal}h</span>
            </div>
          </div>

          {/* Recent Entries */}
          {weeklyEntries.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Entries</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {weeklyEntries.slice(-5).map((entry) => (
                  <div key={entry._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.taskTitle}</p>
                      <p className="text-xs text-gray-600 capitalize">{entry.dayOfWeek}</p>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">{entry.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
