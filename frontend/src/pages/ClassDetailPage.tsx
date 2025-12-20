import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Removed useNavigate
import { useAuthStore } from '../context/useAuthStore';
import api from '../services/api';
import { Users, BookOpen, Trophy, ArrowLeft, BarChart2, AlertCircle, X } from 'lucide-react';
import { LeaderboardTable } from '../components/common/LeaderboardTable';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { Sword, Zap } from 'lucide-react';

// --- Report Modal Component ---
interface ReportData {
  assignment: { title: string; dueDate: string; totalTerms: number };
  studentReports: {
    student: { id: number; username: string; email: string };
    totalTerms: number;
    masteredTerms: number;
    completionPercentage: number;
    averageMastery: number;
  }[];
  difficultTerms: {
    id: number;
    term: string;
    definition: string;
    avgMastery: number;
    attempts: number;
  }[];
}

const ReportModal = ({ classId, assignmentId, onClose }: { classId: string; assignmentId: number; onClose: () => void }) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/classes/${classId}/assignments/${assignmentId}/report`);
        setReport(res.data);
      } catch (err) {
        console.error("Report fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [classId, assignmentId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl">Loading report details...</div>
    </div>
  );

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.assignment.title} - Performance Report</h2>
            <p className="text-gray-500 text-sm">Due: {report.assignment.dueDate ? new Date(report.assignment.dueDate).toLocaleDateString() : 'No Due Date'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section 1: Difficult Terms */}
          {report.difficultTerms.length > 0 && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Wait! Students are struggling with these terms:
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {report.difficultTerms.map(term => (
                  <div key={term.id} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{term.term}</p>
                        <p className="text-sm text-gray-500 truncate">{term.definition}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                        Avg Mastery: {term.avgMastery}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Student Progress Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart2 className="h-5 w-5 text-indigo-500 mr-2" />
              Student Progress
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-sm">
                    <th className="py-3 px-4 font-medium">Student</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                    <th className="py-3 px-4 font-medium text-center">Mastered Words</th>
                    <th className="py-3 px-4 font-medium text-center">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.studentReports.map((row) => (
                    <tr key={row.student.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {row.student.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{row.student.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.completionPercentage === 100 ? (
                          <span className="inline-block px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">Completed</span>
                        ) : row.completionPercentage > 0 ? (
                          <span className="inline-block px-2 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">{row.completionPercentage}% Done</span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-bold text-gray-500 bg-gray-100 rounded-full">Not Started</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {row.masteredTerms} <span className="text-gray-400">/ {row.totalTerms}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <div key={star} className={`h-1.5 w-1.5 rounded-full mx-0.5 ${star <= Math.round(row.averageMastery) ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">{row.averageMastery}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Member {
  user: {
    id: number;
    username: string;
    email: string;
    last_active_at?: string;
    streak?: number;
  };
  role: 'student' | 'admin';
  joined_at: string;
}

interface ClassDetail {
  id: number;
  class_id: number;
  set_id: number;
  assigned_by: number;
  due_date: string | null;
  studySet: {
    id: number;
    title: string;
    description: string;
  };
  assigner: {
    username: string;
  };
}

interface Assignment {
  id: number;
  studySet: {
    id: number;
    title: string;
    description: string;
  };
  assigned_by: number;
  due_date: string | null;
  assigner: {
    username: string;
  };
}

interface ClassDetail {
  id: number;
  name: string;
  join_code: string;
  owner_id: number; // To check if user is teacher
  members: Member[];
}

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // @ts-ignore
  const { user } = useAuthStore();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSetId, setAssignSetId] = useState('');

  const { socket, startClassDuel } = useSocket();
  const navigate = useNavigate();
  const [activeDuel, setActiveDuel] = useState(false);
  const [showDuelModal, setShowDuelModal] = useState(false);

  useEffect(() => {
    if (socket) {
      // Listen for duel events
      socket.on('duel_created', () => setActiveDuel(true));
      socket.on('game_started', () => {
        // Depending on UX, we might auto-redirect or just show a button
        // For now, let's auto-redirect if they are in the lobby logic (simplified)
        // Or better, just show the Join button.
      });
    }
    return () => {
      socket?.off('duel_created');
      socket?.off('game_started');
    }
  }, [socket]);

  const handleStartDuel = () => {
    setShowDuelModal(true);
  };

  const confirmDuelStart = (setId: number) => {
    if (id) {
      startClassDuel(id, setId); // Now passing setId
      setShowDuelModal(false);
      navigate(`/classes/${id}/duel`);
    }
  };

  const handleJoinDuel = () => {
    navigate(`/classes/${id}/duel`);
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const [classRes, lbRes, assignRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/leaderboard/class/${id}`),
        api.get(`/classes/${id}/assignments`)
      ]);
      setClassData(classRes.data);
      setLeaderboard(lbRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      console.error('Failed to fetch class details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Loading class details...</div>;
  if (!classData) return <div className="p-8 text-center text-red-500 bg-gray-50 min-h-screen">Class not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/classes" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Classes
        </Link>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{classData.name}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                Code: {classData.join_code}
              </span>
              <span className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1" />
                {classData.members.length} Members
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* DUEL BANNER */}
          {activeDuel && (
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-lg animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Sword className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Live Duel Active!</h2>
                  <p className="text-white/90">A class competition is happening right now.</p>
                </div>
              </div>
              <button
                onClick={handleJoinDuel}
                className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Zap className="w-5 h-5 fill-current" />
                Join Now
              </button>
            </div>
          )}

          {/* Real Leaderboard */}
          <LeaderboardTable
            title="Class Rankings"
            entries={leaderboard}
            type="xp"
          />

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
              Assigned Sets
            </h2>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  <p className="text-gray-500">No active assignments.</p>
                </div>
              ) : (
                assignments.map((assign) => (
                  <div key={assign.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-bold text-gray-900">{assign.studySet.title}</h3>
                      <p className="text-xs text-gray-500">Assigned by {assign.assigner.username} • Due: {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No Deadline'}</p>
                    </div>
                    <div className="flex gap-2">
                      {/* Only show Report button if user is class owner/admin */}
                      {classData.owner_id === user?.id && (
                        <button
                          onClick={() => setActiveReportId(assign.id)}
                          className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition"
                        >
                          View Report
                        </button>
                      )}
                      <Link
                        to={`/sets/${assign.studySet.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                      >
                        Start
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Button for Teachers */}
            {classData.owner_id === user?.id && (
              <div className="mt-6 border-t border-gray-100 pt-4 flex gap-4">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex-1 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition border border-indigo-100"
                >
                  + Assign New Set
                </button>
                <button
                  onClick={handleStartDuel}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <Sword className="w-5 h-5" />
                  Start Live Duel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {activeReportId && id && (
          <ReportModal
            classId={id}
            assignmentId={activeReportId}
            onClose={() => setActiveReportId(null)}
          />
        )}

        {showDuelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sword className="w-6 h-6 text-red-500" />
                Select Set for Duel
              </h3>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {assignments.length > 0 ? assignments.map(a => (
                  <button
                    key={a.id}
                    onClick={() => confirmDuelStart(a.studySet.id)}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-red-400 hover:bg-red-50 transition-colors"
                  >
                    <div className="font-bold text-gray-800">{a.studySet.title}</div>
                    <div className="text-sm text-gray-500">{a.studySet.description}</div>
                  </button>
                )) : (
                  <p className="text-gray-500 text-center py-4">No assignments found. Assign a set to the class first.</p>
                )}
              </div>
              <button
                onClick={() => setShowDuelModal(false)}
                className="w-full py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sidebar - Members */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>Members</span>
              <span className="text-sm font-normal text-gray-500">{classData.members.length}</span>
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {classData.members.map((member) => (
                <div key={member.user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {member.user.username.charAt(0).toUpperCase()}
                      </div>
                      {/* Online Status Indicator */}
                      {member.user.last_active_at && (new Date().getTime() - new Date(member.user.last_active_at).getTime() < 5 * 60 * 1000) && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400" title="Online now"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{member.user.username}</p>
                        {/* Last Active Text */}
                        {member.user.last_active_at && (new Date().getTime() - new Date(member.user.last_active_at).getTime() < 60 * 60 * 1000) ? (
                          <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">Active</span>
                        ) : (
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                            {member.user.last_active_at ? new Date(member.user.last_active_at).toLocaleDateString() : 'Offline'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 role-badge">{member.role} • {member.user.streak || 0} Day Streak 🔥</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
