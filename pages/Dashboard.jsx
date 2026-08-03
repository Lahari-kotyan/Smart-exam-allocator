import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DoorOpen, CalendarDays, BrainCircuit, AlertTriangle, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function Dashboard() {
  const [faculty, setFaculty] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [f, c, e, a] = await Promise.all([
        base44.entities.Faculty.list('-created_date', 500),
        base44.entities.Classroom.list('-created_date', 500),
        base44.entities.Exam.list('-date', 500),
        base44.entities.Assignment.list('-created_date', 500),
      ]);
      setFaculty(f);
      setClassrooms(c);
      setExams(e);
      setAssignments(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const examsToday = exams.filter(e => e.date === today);
  const unassignedExams = exams.filter(e => e.status !== 'scheduled');
  const activeFaculty = faculty.filter(f => f.status === 'active');

  // Department workload
  const deptWorkload = {};
  faculty.forEach(f => {
    const dept = f.department || 'Unknown';
    if (!deptWorkload[dept]) deptWorkload[dept] = { dept, duties: 0, faculty: 0 };
    deptWorkload[dept].faculty++;
  });
  assignments.forEach(a => {
    const dept = a.department || 'Unknown';
    if (deptWorkload[dept]) deptWorkload[dept].duties++;
  });
  const deptData = Object.values(deptWorkload);

  // Workload distribution
  const workloadMap = {};
  faculty.forEach(f => { workloadMap[f.id] = 0; });
  assignments.forEach(a => {
    if (workloadMap[a.faculty_id] !== undefined) workloadMap[a.faculty_id]++;
  });
  const workloadDist = [
    { name: '0 duties', count: Object.values(workloadMap).filter(v => v === 0).length },
    { name: '1 duty', count: Object.values(workloadMap).filter(v => v === 1).length },
    { name: '2 duties', count: Object.values(workloadMap).filter(v => v === 2).length },
    { name: '3+ duties', count: Object.values(workloadMap).filter(v => v >= 3).length },
  ];

  const pieData = [
    { name: 'Scheduled', value: exams.filter(e => e.status === 'scheduled').length },
    { name: 'Unassigned', value: unassignedExams.length },
  ];

  const stats = [
    { label: 'Total Faculty', value: faculty.length, icon: Users, color: 'from-blue-500 to-blue-600', link: '/faculty' },
    { label: 'Classrooms', value: classrooms.length, icon: DoorOpen, color: 'from-purple-500 to-purple-600', link: '/classrooms' },
    { label: 'Total Exams', value: exams.length, icon: CalendarDays, color: 'from-amber-500 to-amber-600', link: '/exams' },
    { label: 'Active Assignments', value: assignments.length, icon: BrainCircuit, color: 'from-emerald-500 to-emerald-600', link: '/scheduler' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="group bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Alert Banner */}
      {unassignedExams.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <span className="font-semibold">{unassignedExams.length} exam(s)</span> need invigilator assignment.
          </p>
          <Link to="/scheduler" className="text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1">
            Schedule Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workload */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Department-wise Duties</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="duties" fill="#6366f1" radius={[6, 6, 0, 0]} name="Duties" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exam Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Exam Scheduling Status</h3>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Workload Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Faculty Workload Distribution</h3>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workloadDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Faculty Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-1">AI Scheduling Engine</h3>
          <p className="text-indigo-100 text-sm mb-4">Automatically assign invigilators with constraint-based optimization</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
              Availability & conflict checking
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
              Fair workload distribution
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
              Explainable AI reasoning
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
              Emergency replacements
            </div>
          </div>
          <Link
            to="/scheduler"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition text-sm"
          >
            Launch Scheduler <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Today's Exams */}
      {examsToday.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Exams Today</h3>
          <div className="space-y-2">
            {examsToday.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{e.subject}</p>
                  <p className="text-sm text-slate-500">{e.course} • {e.start_time} - {e.end_time} • {e.room_number || 'TBD'}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${e.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {e.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
