import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Pencil, Trash2, Mail, Phone, X, Upload, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'MBA'];
const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    faculty_id: '', name: '', department: 'CSE', email: '', phone: '', designation: 'Assistant Professor', status: 'active'
  });

  useEffect(() => { loadFaculty(); }, []);

  const loadFaculty = async () => {
    try {
      const data = await base44.entities.Faculty.list('-created_date', 500);
      setFaculty(data);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load faculty' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = faculty.filter(f => {
    const matchSearch = f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.faculty_id?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || f.department === deptFilter;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ faculty_id: '', name: '', department: 'CSE', email: '', phone: '', designation: 'Assistant Professor', status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      faculty_id: f.faculty_id || '', name: f.name || '', department: f.department || 'CSE',
      email: f.email || '', phone: f.phone || '', designation: f.designation || 'Assistant Professor', status: f.status || 'active'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Faculty.update(editing.id, form);
        toast({ title: 'Faculty updated' });
      } else {
        await base44.entities.Faculty.create(form);
        toast({ title: 'Faculty added' });
      }
      setDialogOpen(false);
      loadFaculty();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    try {
      await base44.entities.Faculty.delete(id);
      toast({ title: 'Faculty deleted' });
      loadFaculty();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            faculty: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  faculty_id: { type: 'string' },
                  name: { type: 'string' },
                  department: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  designation: { type: 'string' }
                }
              }
            }
          }
        }
      });
      const records = result.output?.faculty || result.output || [];
      if (records.length > 0) {
        await base44.entities.Faculty.bulkCreate(records);
        toast({ title: `Imported ${records.length} faculty members` });
        loadFaculty();
      } else {
        toast({ variant: 'destructive', title: 'No data found in file' });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Import failed', description: err.message });
    }
  };

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    on_leave: 'bg-amber-100 text-amber-700',
    inactive: 'bg-slate-100 text-slate-500',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="cursor-pointer">
            <div className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition">
              <Upload className="w-4 h-4" /> Import Excel
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          </Label>
          <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1" /> Add Faculty
          </Button>
        </div>
      </div>

      {/* Faculty Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No faculty members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {f.name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.faculty_id}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[f.status] || statusColors.active}`}>
                  {f.status}
                </span>
              </div>
              <div className="space-y-1.5 mb-4">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{f.department}</span>
                  <span className="text-xs text-slate-400">{f.designation}</span>
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {f.email}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {f.phone || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(f)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(f.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Faculty' : 'Add Faculty Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Faculty ID</Label>
                <Input value={form.faculty_id} onChange={e => setForm({...form, faculty_id: e.target.value})} required />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Select value={form.designation} onValueChange={v => setForm({...form, designation: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{editing ? 'Update' : 'Add'} Faculty</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
