import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, CalendarDays, Clock, DoorOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'MBA'];
const timeSlots = ['Morning (09:00-12:00)', 'Afternoon (12:00-15:00)', 'Evening (15:00-18:00)'];
const slotTimes = {
  'Morning (09:00-12:00)': { start: '09:00', end: '12:00' },
  'Afternoon (12:00-15:00)': { start: '12:00', end: '15:00' },
  'Evening (15:00-18:00)': { start: '15:00', end: '18:00' },
};

export default function ExamSchedule() {
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();
  const [form, setForm] = useState({
    subject: '', course: '', semester: 1, department: 'CSE', date: '',
    time_slot: 'Morning (09:00-12:00)', required_invigilators: 2, room_id: '', room_number: '', status: 'unassigned'
  });

  useEffect(() => { loadExams(); }, []);

  const loadExams = async () => {
    try {
      const [e, c] = await Promise.all([
        base44.entities.Exam.list('-date', 500),
        base44.entities.Classroom.list('-created_date', 500),
      ]);
      setExams(e);
      setClassrooms(c);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load exams' });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ subject: '', course: '', semester: 1, department: 'CSE', date: '', time_slot: 'Morning (09:00-12:00)', required_invigilators: 2, room_id: '', room_number: '', status: 'unassigned' });
    setDialogOpen(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({
      subject: e.subject || '', course: e.course || '', semester: e.semester || 1, department: e.department || 'CSE',
      date: e.date || '', time_slot: e.time_slot || 'Morning (09:00-12:00)', required_invigilators: e.required_invigilators || 2,
      room_id: e.room_id || '', room_number: e.room_number || '', status: e.status || 'unassigned'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const times = slotTimes[form.time_slot];
    const selectedRoom = classrooms.find(c => c.id === form.room_id);
    const payload = {
      ...form,
      start_time: form.start_time || times.start,
      end_time: form.end_time || times.end,
      room_number: selectedRoom?.room_number || form.room_number,
    };
    try {
      if (editing) {
        await base44.entities.Exam.update(editing.id, payload);
        toast({ title: 'Exam updated' });
      } else {
        await base44.entities.Exam.create(payload);
        toast({ title: 'Exam added' });
      }
      setDialogOpen(false);
      loadExams();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return;
    try {
      await base44.entities.Exam.delete(id);
      toast({ title: 'Exam deleted' });
      loadExams();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{exams.length} exams scheduled</p>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-1" /> Add Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No exams added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{e.subject}</h3>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{e.department}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {e.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{e.course}</span>
                      <span>Sem {e.semester}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {e.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {e.start_time} - {e.end_time}</span>
                      <span className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5" /> {e.room_number || 'TBD'}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {e.required_invigilators} invigilators</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(e)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
              </div>
              <div>
                <Label>Course</Label>
                <Input value={form.course} onChange={e => setForm({...form, course: e.target.value})} required />
              </div>
              <div>
                <Label>Semester</Label>
                <Input type="number" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value) || 1})} required />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
              </div>
              <div>
                <Label>Time Slot</Label>
                <Select value={form.time_slot} onValueChange={v => setForm({...form, time_slot: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{timeSlots.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Required Invigilators</Label>
                <Input type="number" min="1" value={form.required_invigilators} onChange={e => setForm({...form, required_invigilators: parseInt(e.target.value) || 1})} required />
              </div>
              <div className="col-span-2">
                <Label>Classroom</Label>
                <Select value={form.room_id} onValueChange={v => setForm({...form, room_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select classroom" /></SelectTrigger>
                  <SelectContent>
                    {classrooms.map(c => <SelectItem key={c.id} value={c.id}>{c.room_number} - {c.building} ({c.capacity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{editing ? 'Update' : 'Add'} Exam</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
