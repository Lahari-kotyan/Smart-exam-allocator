import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, Users, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function Analytics() {
  const [faculty, setFaculty] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [f, e, a, c] = await Promise.all([
        base44.entities.Faculty.list('-created_date', 500),
        base44.entities.Exam.list('-date', 500),
        base44.entities.Assignment.list('-created_date', 500),
        base44.entities.Classroom.list('-created_date', 500),
      ]);
      setFaculty(f);
      setExams(e);
      setAssignments(a);
      setClassrooms(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  // Workload per faculty
  const workload = {};
  faculty.forEach(f => { workload[f.id] = { name: f.name, dept: f.department, count: 0 }; });
  assignments.forEach(a => {
    if (workload[a.faculty_id]) workload[a.faculty_id].count++;
  });
  const workloadData = Object.values(workload).sort((a, b) => b.count - a.count).slice(0, 10);

  // Department-wise duties
  const deptData = {};
  faculty.forEach(f => {
    const d = f.department || 'Unknown';
    if (!deptData[d]) deptData[d] = { dept: d, duties: 0, faculty: 0 };
    deptData[d].faculty++;
  });
  assignments.forEach(a => {
    const d = a.department || 'Unknown';
    if (deptData[d]) deptData[d].duties++;
  });
  const deptChartData = Object.values(deptData);

  // Classroom utilization
  const roomUsage = {};
  classrooms.forEach(c => { roomUsage[c.id] = { room: c.room_number, count: 0 }; });
  assignments.forEach(a => {
    const room = classrooms.find(c => c.room_number === a.room_number);
    if (room && roomUsage[room.id]) roomUsage[room.id].count++;
  });
  const roomData = Object.values(roomUsage).sort((a, b) => b.count - a.count).slice(0, 8);

  // Exam status
  const statusData = [
    { name: 'Scheduled', value: exams.filter(e => e.status === 'scheduled').length, fill: '#10b981' },
    { name: 'Pending', value: exams.filter(e => e.status !== 'scheduled').length, fill: '#f59e0b' },
  ];

  // Time slot distribution
  const slotData = {};
  assignments.forEach(a => {
    const s = a.time_slot || 'Unknown';
    if (!slotData[s]) slotData[s] = { slot: s.replace(/ \(.*/, ''), count: 0 };
    slotData[s].count++;
  });
  const slotChartData = Object.values(slotData);

  // Fairness metrics
  const loads = Object.values(workload).map(w => w.count);
  const avgLoad = loads.length > 0 ? (loads.reduce((a, b) => a + b, 0) / loads.length).toFixed(1) : 0;
  const maxLoad = Math.max(...loads, 0);
  const minLoad = Math.min(...loads, 0);
  const variance = loads.length > 0
    ? (loads.reduce((sum, l) => sum + Math.pow(l - avgLoad, 2), 0) / loads.length).toFixed(2)
    : 0;
  const fairnessScore = Math.max(0, 100 - Math.round(variance * 10));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-indigo-500" /><span className="text-xs text-slate-500">Total Faculty</span></div>
          <p className="text-2xl font-bold text-slate-900">{faculty.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-purple-500" /><span className="text-xs text-slate-500">Total Assignments</span></div>
          <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-emerald-500" /><span className="text-xs text-slate-500">Classroom Utilization</span></div>
          <p className="text-2xl font-bold text-slate-900">{roomData.filter(r => r.count > 0).length}/{classrooms.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-amber-500" /><span className="text-xs text-slate-500">AI Fairness Score</span></div>
          <p className="text-2xl font-bold text-slate-900">{fairnessScore}/100</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Faculty by Workload */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Top 10 Faculty by Workload</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workloadData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Duties" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department-wise */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Department-wise Duties vs Faculty</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="duties" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Duties" />
              <Bar dataKey="faculty" fill="#c4b5fd" radius={[6, 6, 0, 0]} name="Faculty" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exam Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Exam Scheduling Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time Slot Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Duties by Time Slot</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={slotChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="slot" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Assignments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fairness Metrics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Workload Fairness Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-indigo-600">{avgLoad}</p>
            <p className="text-sm text-slate-500 mt-1">Average Duties</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-emerald-600">{minLoad}</p>
            <p className="text-sm text-slate-500 mt-1">Minimum Duties</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-amber-600">{maxLoad}</p>
            <p className="text-sm text-slate-500 mt-1">Maximum Duties</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-600">{variance}</p>
            <p className="text-sm text-slate-500 mt-1">Variance</p>
          </div>
        </div>
      </div>

      {/* Classroom Utilization */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Classroom Utilization</h3>
        {roomData.length === 0 ? (
          <p className="text-slate-500 text-sm">No classroom data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={roomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="room" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Assignments" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
