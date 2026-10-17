import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import EnrollmentModal from '../../components/incharge/EnrollmentModal';
import {
  Users,
  UserPlus,
  Phone,
  Search,
  GraduationCap,
  Download,
  Eye,
  Edit2,
  Bus,
  CheckCircle2,
  DollarSign,
  MapPin,
  X,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

const InChargeEnrollment = () => {
  const { user, refreshUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // শিক্ষার্থী ডিটেইল / এডিট মডাল স্টেট
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const mySections = user?.incharge_sections || [];
  const activeSection = mySections.find((s) => s.id === selectedSectionId) || mySections[0];

  useEffect(() => {
    if (!user?.incharge_sections?.length && refreshUser) {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    if (mySections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(mySections[0].id);
    }
  }, [mySections]);

  const fetchMyStudents = async () => {
    if (!activeSection) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`academics/students/?section=${activeSection.id}`);
      const list = res.data.results || res.data;
      setStudents(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('শিক্ষার্থী তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStudents();
  }, [activeSection?.id]);

  // ফিল্টার্ড শিক্ষার্থী
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_unique_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_number?.toString().includes(searchTerm) ||
        s.guardian_phone?.includes(searchTerm)
    );
  }, [students, searchTerm]);

  // মেট্রিক্স হিসাব
  const stats = useMemo(() => {
    const total = students.length;
    const male = students.filter((s) => s.gender === 'MALE').length;
    const female = students.filter((s) => s.gender === 'FEMALE').length;
    const transportUsers = students.filter((s) => s.uses_transport).length;
    return { total, male, female, transportUsers };
  }, [students]);

  // এক্সেল/সিএসভি এক্সপোর্ট
  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('ডাউনলোড করার মতো কোনো শিক্ষার্থী নেই');
      return;
    }
    const headers = ['Roll,Student_ID,Name,Gender,Guardian_Phone,Tuition_Fee,Uses_Transport,Transport_Fee'];
    const rows = students.map((s) =>
      [
        s.roll_number,
        s.student_unique_id,
        `"${s.full_name}"`,
        s.gender,
        s.guardian_phone || '',
        s.monthly_tuition_fee,
        s.uses_transport ? 'YES' : 'NO',
        s.monthly_transport_fee
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Section_${activeSection?.section_name}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('শিক্ষার্থী তালিকা সফলভাবে ডাউনলোড হয়েছে');
  };

  // স্টুডেন্ট এডিট সেভ
  const handleSaveStudentEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.patch(`academics/students/${selectedStudent.id}/`, {
        guardian_phone: editFormData.guardian_phone,
        present_address: editFormData.present_address,
        monthly_tuition_fee: editFormData.monthly_tuition_fee,
        uses_transport: editFormData.uses_transport,
        monthly_transport_fee: editFormData.uses_transport ? editFormData.monthly_transport_fee : '0.00'
      });
      if (res.status === 200 || res.data?.success) {
        toast.success('শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে');
        setIsEditing(false);
        setSelectedStudent(null);
        fetchMyStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'তথ্য আপডেট ব্যর্থ হয়েছে');
    } finally {
      setSavingEdit(false);
    }
  };

  const openStudentModal = (student, editMode = false) => {
    setSelectedStudent(student);
    setIsEditing(editMode);
    setEditFormData({
      guardian_phone: student.guardian_phone || '',
      present_address: student.present_address || '',
      monthly_tuition_fee: student.monthly_tuition_fee || '1500.00',
      uses_transport: student.uses_transport || false,
      monthly_transport_fee: student.monthly_transport_fee || '0.00',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ১. হেডার ও ভর্তি বাটন */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-brand-orange/10 px-2 py-0.5 text-[11px] font-black text-brand-orange">
              ইনচার্জ স্পেশাল
            </span>
            <h2 className="text-xl font-extrabold text-brand-navy">শ্রেণি ইনচার্জ শিক্ষার্থী ভর্তি ও ডাটাবেস</h2>
          </div>
          {activeSection ? (
            <p className="text-xs text-slate-500 mt-1">
              শাখা: <strong className="text-brand-orange">{activeSection.class_level_display || activeSection.class_level} - {activeSection.group_display || activeSection.group} ({activeSection.section_name}) [{activeSection.session}]</strong>
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">শাখার শিক্ষার্থীদের তথ্য ও নতুন ভর্তি</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {mySections.length > 1 && (
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              {mySections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.class_level_display || sec.class_level} - {sec.group_display || sec.group} ({sec.section_name})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV ডাউনলোড</span>
          </button>

          <button
            onClick={() => setShowEnrollModal(true)}
            disabled={!activeSection}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-black text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            <span>নতুন শিক্ষার্থী ভর্তি করুন</span>
          </button>
        </div>
      </div>

      {!activeSection && (
        <div className="rounded-3xl bg-amber-50 p-8 border border-amber-200 text-center">
          <Users className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <h3 className="text-base font-bold text-amber-900">আপনি এখনও কোনো সক্রিয় শাখার শ্রেণি ইনচার্জ নন</h3>
          <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
            প্রিন্সিপাল ড্যাশবোর্ড থেকে আপনাকে কোনো শাখার শ্রেণি ইনচার্জ হিসেবে নিয়োগ দিলে এই পাতায় সেই শাখার শিক্ষার্থী ভর্তি ও পরিচালনা করা যাবে।
          </p>
        </div>
      )}

      {/* ২. সেকশন স্ট্যাটিস্টিকস কার্ডস */}
      {activeSection && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400">মোট শিক্ষার্থী</span>
            <h3 className="text-xl font-black text-brand-navy mt-1">{stats.total} জন</h3>
          </div>
          <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-200 shadow-soft">
            <span className="text-[11px] font-bold text-blue-700">ছাত্র (Male)</span>
            <h3 className="text-xl font-black text-blue-800 mt-1">{stats.male} জন</h3>
          </div>
          <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-200 shadow-soft">
            <span className="text-[11px] font-bold text-purple-700">ছাত্রী (Female)</span>
            <h3 className="text-xl font-black text-purple-800 mt-1">{stats.female} জন</h3>
          </div>
          <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200 shadow-soft">
            <span className="text-[11px] font-bold text-emerald-700">কলেজ পরিবহন সুবিধা</span>
            <h3 className="text-xl font-black text-emerald-800 mt-1">{stats.transportUsers} জন</h3>
          </div>
        </div>
      )}

      {/* ৩. সার্চ বার ও শিক্ষার্থী তালিকা টেবিল */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-extrabold text-base text-brand-navy">আমার ক্লাসের শিক্ষার্থী তালিকা ({filteredStudents.length} জন)</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="রোল, নাম, ফোন বা আইডি দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3 text-center">রোল</th>
                  <th className="p-3">ইউনিক আইডি</th>
                  <th className="p-3">শিক্ষার্থীর নাম</th>
                  <th className="p-3">লিঙ্গ</th>
                  <th className="p-3">অভিভাবকের মোবাইল</th>
                  <th className="p-3">মাসিক বেতন</th>
                  <th className="p-3">পরিবহন</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-extrabold text-brand-orange text-center">{s.roll_number}</td>
                    <td className="p-3 font-mono text-[11px] font-bold text-brand-navy">{s.student_unique_id}</td>
                    <td className="p-3 font-bold text-slate-900">{s.full_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.gender === 'FEMALE' ? 'ছাত্রী' : 'ছাত্র'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {s.guardian_phone ? (
                        <a href={`tel:${s.guardian_phone}`} className="hover:text-brand-orange hover:underline">
                          {s.guardian_phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 font-bold">৳ {s.monthly_tuition_fee}</td>
                    <td className="p-3">
                      {s.uses_transport ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold flex items-center w-fit space-x-1">
                          <Bus className="h-3 w-3 inline mr-0.5" />
                          <span>হ্যাঁ (+৳{s.monthly_transport_fee})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">না</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openStudentModal(s, false)}
                          className="rounded-lg bg-blue-50 text-blue-700 p-1.5 hover:bg-blue-100 transition"
                          title="সম্পূর্ণ প্রোফাইল দেখুন"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openStudentModal(s, true)}
                          className="rounded-lg bg-amber-50 text-amber-700 p-1.5 hover:bg-amber-100 transition"
                          title="তথ্য ও ফি পরিবর্তন করুন"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* শিক্ষার্থী বিস্তারিত বা এডিট মডাল */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy">
                  {isEditing ? 'শিক্ষার্থীর তথ্য পরিবর্তন' : 'শিক্ষার্থী প্রোফাইল (360°)'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">আইডি: {selectedStudent.student_unique_id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setIsEditing(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveStudentEdit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">অভিভাবকের মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={editFormData.guardian_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, guardian_phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বর্তমান ঠিকানা</label>
                  <textarea
                    rows="2"
                    value={editFormData.present_address}
                    onChange={(e) => setEditFormData({ ...editFormData, present_address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">মাসিক টিউশন ফি (BDT)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.monthly_tuition_fee}
                      onChange={(e) => setEditFormData({ ...editFormData, monthly_tuition_fee: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">মাসিক বাস ফি (BDT)</label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={!editFormData.uses_transport}
                      value={editFormData.monthly_transport_fee}
                      onChange={(e) => setEditFormData({ ...editFormData, monthly_transport_fee: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.uses_transport}
                      onChange={(e) => setEditFormData({ ...editFormData, uses_transport: e.target.checked })}
                      className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
                    />
                    <span>শিক্ষার্থী কলেজ পরিবহন (বাস সুবিধা) ব্যবহার করবে</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingEdit ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">নাম:</span>
                    <strong className="text-slate-900">{selectedStudent.full_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">রোল নম্বর:</span>
                    <strong className="text-brand-orange font-extrabold">{selectedStudent.roll_number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">লিঙ্গ:</span>
                    <strong>{selectedStudent.gender === 'FEMALE' ? 'ছাত্রী' : 'ছাত্র'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">পিতার নাম:</span>
                    <span>{selectedStudent.father_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">মাতার নাম:</span>
                    <span>{selectedStudent.mother_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">অভিভাবকের মোবাইল:</span>
                    <a href={`tel:${selectedStudent.guardian_phone}`} className="font-mono text-brand-navy font-bold hover:underline">
                      {selectedStudent.guardian_phone || '—'}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">বর্তমান ঠিকানা:</span>
                    <span>{selectedStudent.present_address || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">মাসিক টিউশন ফি:</span>
                    <strong className="text-emerald-700">৳ {selectedStudent.monthly_tuition_fee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">কলেজ পরিবহন সুবিধা:</span>
                    <span>{selectedStudent.uses_transport ? `হ্যাঁ (৳ ${selectedStudent.monthly_transport_fee})` : 'না'}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1.5 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>তথ্য সম্পাদনা করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ভর্তি মডাল */}
      <EnrollmentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        section={activeSection}
        onSuccess={fetchMyStudents}
      />
    </div>
  );
};

export default InChargeEnrollment;