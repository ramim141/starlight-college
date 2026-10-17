import React, { useState, useEffect } from 'react';
import { getExamsListApi } from '../../api/student';
import { getSectionsApi, getSubjectsApi, getMarkSheetApi, saveBulkMarksApi } from '../../api/teacher';
import { Award, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TeacherMarksEntry = () => {
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [students, setStudents] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [exRes, secRes, subRes] = await Promise.all([
          getExamsListApi(),
          getSectionsApi(),
          getSubjectsApi(),
        ]);
        const exList = exRes.results || exRes;
        const secList = secRes.results || secRes;
        const subList = subRes.results || subRes;

        if (Array.isArray(exList) && exList.length > 0) {
          setExams(exList);
          setSelectedExam(exList[0].id);
        }
        if (Array.isArray(secList) && secList.length > 0) {
          setSections(secList);
          setSelectedSection(secList[0].id);
        }
        if (Array.isArray(subList) && subList.length > 0) {
          setSubjects(subList);
          setSelectedSubject(subList[0].id);
        }
      } catch (err) {
        toast.error('কনফিগারেশন ডেটা লোড করা যায়নি');
      }
    };
    initData();
  }, []);

  const handleLoadSheet = async () => {
    if (!selectedExam || !selectedSubject || !selectedSection) {
      toast.error('পরীক্ষা, বিষয় ও শাখা নির্বাচন করুন');
      return;
    }

    setLoadingSheet(true);
    try {
      const res = await getMarkSheetApi(selectedExam, selectedSubject, selectedSection);
      if (res.success) {
        setStudents(res.students || []);
        toast.success(`মোট ${res.total_students} জন শিক্ষার্থীর তালিকা লোড হয়েছে`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'মার্কশিট লোড করা যায়নি');
      setStudents([]);
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.student_id === studentId) {
          const numVal = parseFloat(value) || 0;
          return { ...s, [field]: numVal };
        }
        return s;
      })
    );
  };

  const handleSaveBulk = async () => {
    if (students.length === 0) return;

    setSaving(true);
    try {
      const payload = {
        exam_id: selectedExam,
        subject_id: selectedSubject,
        section_id: selectedSection,
        marks_list: students.map((s) => ({
          student_id: s.student_id,
          cq_marks: s.cq_marks || 0,
          mcq_marks: s.mcq_marks || 0,
          practical_marks: s.practical_marks || 0,
          tutorial_marks: s.tutorial_marks || 0,
          is_absent: s.is_absent || false,
        })),
      };

      const res = await saveBulkMarksApi(payload);
      if (res.success) {
        toast.success(res.message);
        handleLoadSheet(); // রেজাল্ট ও গ্রেড রিফ্রেশ করা
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'নম্বর সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ফিল্টার কন্ট্রোল প্যানেল */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-brand-navy mb-1">পরীক্ষার নম্বর এন্ট্রি (Marks Entry Grid)</h2>
        <p className="text-xs text-slate-500 mb-4">CQ, MCQ, Practical এবং Tutorial নম্বর এন্ট্রি করে এক ক্লিকে সেভ করুন।</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">পরীক্ষা</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শাখা / সেকশন</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.class_level} - {sec.group} ({sec.section_name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">পাঠ্য বিষয়</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>[{sub.code}] {sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleLoadSheet}
            disabled={loadingSheet}
            className="flex items-center space-x-1.5 rounded-xl bg-[#0F2C59] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loadingSheet ? 'animate-spin' : ''}`} />
            <span>মার্কশিট লোড করুন</span>
          </button>
        </div>
      </div>

      {/* নম্বর এন্ট্রি এক্সেল-স্টাইল টেবিল */}
      {students.length > 0 && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600">শিক্ষার্থী সংখ্যা: {students.length} জন</span>
              <p className="text-[11px] text-slate-400">কিবোর্ডের Tab চেপে সহজে এক ঘর থেকে অন্য ঘরে যাওয়া যাবে</p>
            </div>

            <button
              onClick={handleSaveBulk}
              disabled={saving}
              className="flex items-center space-x-2 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সব নম্বর সেভ করুন'}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-2.5 text-left">রোল</th>
                  <th className="p-2.5 text-left">শিক্ষার্থীর নাম</th>
                  <th className="p-2.5 w-24">CQ (লিখিত)</th>
                  <th className="p-2.5 w-24">MCQ (নৈর্ব্যক্তিক)</th>
                  <th className="p-2.5 w-24">Practical</th>
                  <th className="p-2.5 w-24">Tutorial</th>
                  <th className="p-2.5 w-24 bg-orange-600">মোট নম্বর</th>
                  <th className="p-2.5 w-16">গ্রেড</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {students.map((stu) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-left font-bold text-brand-orange">{stu.roll_number}</td>
                    <td className="p-2.5 text-left font-bold text-brand-navy truncate max-w-[180px]">{stu.student_name}</td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={stu.cq_marks}
                        onChange={(e) => handleMarkChange(stu.student_id, 'cq_marks', e.target.value)}
                        className="w-20 rounded-lg border border-slate-300 p-1.5 text-center text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={stu.mcq_marks}
                        onChange={(e) => handleMarkChange(stu.student_id, 'mcq_marks', e.target.value)}
                        className="w-20 rounded-lg border border-slate-300 p-1.5 text-center text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={stu.practical_marks}
                        onChange={(e) => handleMarkChange(stu.student_id, 'practical_marks', e.target.value)}
                        className="w-20 rounded-lg border border-slate-300 p-1.5 text-center text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={stu.tutorial_marks}
                        onChange={(e) => handleMarkChange(stu.student_id, 'tutorial_marks', e.target.value)}
                        className="w-20 rounded-lg border border-slate-300 p-1.5 text-center text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                      />
                    </td>
                    <td className="p-2.5 font-bold text-brand-navy bg-slate-50">{stu.final_total_marks || "-"}</td>
                    <td className={`p-2.5 font-black ${stu.grade_letter === 'F' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {stu.grade_letter || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherMarksEntry;