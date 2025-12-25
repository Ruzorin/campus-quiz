import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import api from '../services/api';
import { LayoutDashboard, Users, FileText, BarChart2, Plus, Calendar, ChevronRight, School, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  activeClasses: number;
  totalStudents: number;
  activeAssignments: number;
}

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'reports'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for UI development until backend routes are fully populated
  // In a real flow, we would fetch these from /api/teacher/assignments etc.

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/teacher/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'teacher' && user.role !== 'admin') {
    return <div className="p-8 text-center text-red-600">Access Denied. Teachers only.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Teacher Panel</h2>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'assignments' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText size={20} />
            <span>Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <BarChart2 size={20} />
            <span>Reports</span>
          </button>

          <button
            onClick={() => { /* Navigate to classes management */ }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50`}
          >
            <Users size={20} />
            <span>Manage Classes</span>
          </button>
        </nav>

        <div className="bg-indigo-900 rounded-xl p-4 text-white mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <School size={16} className="text-indigo-300" />
            <span className="font-bold text-sm">School Code</span>
          </div>
          <div className="text-2xl font-mono text-center bg-white/10 rounded-lg py-2 tracking-widest">
            TR-34
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.username}</h1>
              <p className="text-gray-500">Here's what's happening in your classes today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm font-medium mb-1">Active Classes</div>
                  <div className="text-3xl font-bold text-gray-900">{stats?.activeClasses || 0}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <School size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm font-medium mb-1">Total Students</div>
                  <div className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                  <Users size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm font-medium mb-1">Active Assignments</div>
                  <div className="text-3xl font-bold text-gray-900">{stats?.activeAssignments || 0}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                  <FileText size={24} />
                </div>
              </div>
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Recent Assignments</h3>
                  <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="p-6 text-center text-gray-500 py-12">
                  <div className="inline-flex bg-gray-50 p-4 rounded-full mb-3">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <p>No active assignments.</p>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="mt-4 text-indigo-600 font-medium hover:underline flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> Create New
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Needs Attention</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg mt-1">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Homework Due Tomorrow</h4>
                      <p className="text-sm text-gray-500">Class 10-A • 12 students pending</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg mt-1">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Weekly Goal Met</h4>
                      <p className="text-sm text-gray-500">Class 9-B reached 1000XP goal!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-md flex items-center gap-2"
              >
                <Plus size={18} /> New Assignment
              </button>
            </div>

            {/* Assignment List (Placeholder for now, could fetch real active ones) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <FileText size={48} className="mb-4 text-gray-300" />
                <p>No active assignments found.</p>
                <p className="text-sm mt-2">Create one to get started!</p>
              </div>
            </div>
          </div>
        )}

        {/* ... Reports Tab ... */}
        {activeTab === 'reports' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Reports</h2>
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Detailed reporting interface coming soon.</p>
            </div>
          </div>
        )}

        {/* Create Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Create Assignment</h2>
              {assignmentError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{assignmentError}</div>}

              <form onSubmit={handleCreateAssignment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                  <select
                    className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={newAssignment.classId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, classId: e.target.value })}
                    required
                  >
                    <option value="">Choose a class...</option>
                    {myClasses.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Study Set</label>
                  <select
                    className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={newAssignment.setId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, setId: e.target.value })}
                    required
                  >
                    <option value="">Choose a set...</option>
                    {mySets.map((set: any) => (
                      <option key={set.id} value={set.id}>{set.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignmentModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
