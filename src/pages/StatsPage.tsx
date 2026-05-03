import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface UserStats {
  userId: string;
  name: string;
  jobTitle: string;
  totalHours: number;
  entries: Array<{
    taskTitle: string;
    hours: number;
    dayOfWeek: string;
    weekOf: string;
  }>;
}

export function StatsPage() {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const userStats = useQuery(api.timeEntries.getUserStats) || [];

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getWeeklyData = (entries: UserStats['entries']) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    return days.map(day => {
      const dayEntries = entries.filter(entry => entry.dayOfWeek === day);
      const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
      return {
        day,
        hours: totalHours,
        tasks: dayEntries,
      };
    });
  };

  const maxHours = Math.max(
    ...userStats.flatMap(user => 
      getWeeklyData(user.entries).map(day => day.hours)
    ),
    8 // minimum scale
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
        <p className="text-gray-600">View team analytics and performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Workers</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">👥</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{userStats.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Hours</h3>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm font-bold">⏰</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {userStats.reduce((sum, user) => sum + user.totalHours, 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Avg Hours/Worker</h3>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">📊</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {userStats.length > 0 
              ? Math.round(userStats.reduce((sum, user) => sum + user.totalHours, 0) / userStats.length)
              : 0
            }
          </p>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">Click on a worker to see their weekly breakdown</p>
        </div>

        <div className="divide-y divide-gray-200">
          {userStats.map((user) => (
            <div key={user.userId} className="p-6">
              <button
                onClick={() => toggleUserExpansion(user.userId)}
                className="w-full flex items-center justify-between hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.jobTitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{user.totalHours}h</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                  {expandedUser === user.userId ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Weekly Chart */}
              {expandedUser === user.userId && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-md font-semibold text-gray-900 mb-4">Weekly Breakdown</h5>
                  <div className="flex items-end justify-between space-x-2 h-48">
                    {getWeeklyData(user.entries).map((dayData) => (
                      <div key={dayData.day} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full flex flex-col justify-end h-40">
                          {dayData.hours > 0 && (
                            <div
                              className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md relative group cursor-pointer"
                              style={{
                                height: `${(dayData.hours / maxHours) * 100}%`,
                                minHeight: dayData.hours > 0 ? "8px" : "0px",
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                <div className="font-semibold">{dayData.hours}h total</div>
                                {dayData.tasks.map((task, idx) => (
                                  <div key={idx} className="text-xs">
                                    {task.taskTitle}: {task.hours}h
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-gray-900 capitalize">
                            {dayData.day.slice(0, 3)}
                          </p>
                          <p className="text-xs text-purple-600 font-semibold">
                            {dayData.hours}h
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tasks Legend */}
                  {user.entries.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks:</h6>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(user.entries.map(e => e.taskTitle))].slice(0, 5).map((task, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {userStats.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No workers found. Start by logging some hours!</p>
          </div>
        )}
      </div>
    </div>
  );
}
