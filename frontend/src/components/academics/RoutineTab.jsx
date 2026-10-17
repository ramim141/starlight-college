import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Settings, Printer, Edit2, Check, RotateCcw, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const RoutineTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit = (isPrincipal || overrideRole === 'PRINCIPAL') && overrideRole !== 'TEACHER' && user?.role !== 'TEACHER';

  const [routines, setRoutines] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [routineGender, setRoutineGender] = useState('FEMALE'); // FEMALE | MALE
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(1); // 1 = রবিবার

  // সেশন এডিট স্টেট
  const [sessionTitle, setSessionTitle] = useState(() => {
    return localStorage.getItem('college_routine_session') || '২০২৬-২৭';
  });
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [tempSessionInput, setTempSessionInput] = useState(sessionTitle);

  // পিরিয়ড শিডিউল
  const defaultFemalePeriods = [
    { period: '১ম', label: '১ম', timeDisplay: '০৯.১০-১০.০৫', start: '09:10', end: '10:05' },
    { period: '২য়', label: '২য়', timeDisplay: '১০.০৬-১০.৫০', start: '10:06', end: '10:50' },
    { period: '৩য়', label: '৩য়', timeDisplay: '১০.৫১-১১.৩০', start: '10:51', end: '11:30' },
    { isBreak: true, period: 'বিরতি', label: 'বিরতি', timeDisplay: '১১.৩১-১১.৫০', start: '11:31', end: '11:50' },
    { period: '৪র্থ', label: '৪র্থ', timeDisplay: '১১.৫১-১২.৩০', start: '11:51', end: '12:30' },
    { period: '৫ম', label: '৫ম', timeDisplay: '১২.৩১-০১.১৫', start: '12:31', end: '13:15' },
    { period: '৬ষ্ঠ', label: '৬ষ্ঠ', timeDisplay: '০১.১৬-০১.৫৫', start: '13:16', end: '13:55' },
  ];

  const defaultMalePeriods = [
    { isAssembly: true, period: 'সমাবেশ', label: 'সমাবেশ', timeDisplay: '০৯.৫৫-১০.০৫', start: '09:55', end: '10:05' },
    { period: '১ম', label: '১ম', timeDisplay: '১০.০৬-১০.৫০', start: '10:06', end: '10:50' },
    { period: '২য়', label: '২য়', timeDisplay: '১০.৫১-১১.৩০', start: '10:51', end: '11:30' },
    { period: '৩য়', label: '৩য়', timeDisplay: '১১.৩১-১২.১০', start: '11:31', end: '12:10' },
    { isBreak: true, period: 'বিরতি', label: 'বিরতি', timeDisplay: '১২.১১-১২.৩০', start: '12:11', end: '12:30' },
    { period: '৪র্থ', label: '৪র্থ', timeDisplay: '১২.৩১-০১.১৫', start: '12:31', end: '13:15' },
    { period: '৫ম', label: '৫ম', timeDisplay: '০১.১৬-০১.৫৫', start: '13:16', end: '13:55' },
    { period: '৬ষ্ঠ', label: '৬ষ্ঠ', timeDisplay: '০১.৫৬-০২.৩৫', start: '13:56', end: '14:35' },
  ];

  const [femalePeriodSchedule, setFemalePeriodSchedule] = useState(() => {
    const saved = localStorage.getItem('college_routine_female_periods');
    return saved ? JSON.parse(saved) : defaultFemalePeriods;
  });

  const [malePeriodSchedule, setMalePeriodSchedule] = useState(() => {
    const saved = localStorage.getItem('college_routine_male_periods');
    return saved ? JSON.parse(saved) : defaultMalePeriods;
  });

  const [showTimeConfigModal, setShowTimeConfigModal] = useState(false);
  const [editingScheduleList, setEditingScheduleList] = useState([]);

  // স্লট ফর্ম মডাল
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routineForm, setRoutineForm] = useState({
    section: '', subject: '', teacher: '', day_of_week: 1, start_time: '09:10', end_time: '10:05', room_number: 'Room-201'
  });

  const classRows = [
    { class_level: 'XI', class_name: 'একাদশ', group: 'SCI', group_name: 'বিজ্ঞান', groupColor: 'text-red-600' },
    { class_level: 'XI', class_name: 'একাদশ', group: 'HUM', group_name: 'মানবিক', groupColor: 'text-emerald-700' },
    { class_level: 'XII', class_name: 'দ্বাদশ', group: 'SCI', group_name: 'বিজ্ঞান', groupColor: 'text-red-600' },
    { class_level: 'XII', class_name: 'দ্বাদশ', group: 'HUM', group_name: 'মানবিক', groupColor: 'text-emerald-700' },
  ];

  const daysLabels = [
    { id: 1, name: 'রবিবার' },
    { id: 2, name: 'সোমবার' },
    { id: 3, name: 'মঙ্গলবার' },
    { id: 4, name: 'বুধবার' },
    { id: 5, name: 'বৃহস্পতিবার' }
  ];

  const getSubjectShortBadge = (name) => {
    if (!name) return { short: 'N/A', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    const s = name.toLowerCase();
    if (s.includes('রসায়ন') || s.includes('chem')) return { short: 'রবি', bg: 'bg-pink-100 text-pink-700 border-pink-300' };
    if (s.includes('পদার্থ') || s.includes('phys')) return { short: 'পবি', bg: 'bg-red-100 text-red-700 border-red-300' };
    if (s.includes('জীব') || s.includes('bio')) return { short: 'জীব', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
    if (s.includes('গণিত') || s.includes('math')) return { short: 'গণিত', bg: 'bg-orange-100 text-orange-700 border-orange-300' };
    if (s.includes('ইংরেজি') || s.includes('eng')) return { short: 'ইং', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (s.includes('বাংলা') || s.includes('bang')) return { short: 'বাং', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (s.includes('ইতিহাস') || s.includes('hist')) return { short: 'ইতি', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (s.includes('পৌরনীতি') || s.includes('civic')) return { short: 'পৌনী', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (s.includes('যুক্তিবিদ্যা') || s.includes('logic')) return { short: 'যূবি', bg: 'bg-green-100 text-green-800 border-green-300' };
    if (s.includes('ইসলামিক') || s.includes('islam')) return { short: 'ইশি', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
    if (s.includes('ict') || s.includes('তথ্য')) return { short: 'ICT', bg: 'bg-slate-200 text-slate-900 border-slate-400 font-black' };
    return { short: name.slice(0, 4), bg: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [secRes, teachRes, subRes] = await Promise.all([
          api.get('academics/sections/'),
          api.get('auth/staff/?role=TEACHER'),
          api.get('academics/subjects/')
        ]);
        setSections(secRes.data.results || secRes.data || []);
        setTeachers(teachRes.data.results || teachRes.data || []);
        setSubjects(subRes.data.results || subRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrerequisites();
  }, []);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const res = await api.get(`academics/routines/?day_of_week=${selectedDayOfWeek}&_t=${Date.now()}`);
      setRoutines(res.data.results || res.data || []);
    } catch (err) {
      toast.error('রুটিন লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [selectedDayOfWeek]);

  const handleSaveSession = () => {
    if (!tempSessionInput.trim()) return;
    setSessionTitle(tempSessionInput);
    localStorage.setItem('college_routine_session', tempSessionInput);
    setIsEditingSession(false);
    toast.success(`সেশন সফলভাবে '${tempSessionInput}' করা হয়েছে`);
  };

  const handleOpenTimeModal = () => {
    const listToEdit = routineGender === 'FEMALE' ? femalePeriodSchedule : malePeriodSchedule;
    setEditingScheduleList(JSON.parse(JSON.stringify(listToEdit)));
    setShowTimeConfigModal(true);
  };

  const handleSaveConfiguredTimes = (e) => {
    e.preventDefault();
    if (routineGender === 'FEMALE') {
      setFemalePeriodSchedule(editingScheduleList);
      localStorage.setItem('college_routine_female_periods', JSON.stringify(editingScheduleList));
    } else {
      setMalePeriodSchedule(editingScheduleList);
      localStorage.setItem('college_routine_male_periods', JSON.stringify(editingScheduleList));
    }
    setShowTimeConfigModal(false);
    toast.success(`${routineGender === 'FEMALE' ? 'ছাত্রী' : 'ছাত্র'} শিফটের পিরিয়ড সময়সূচী আপডেট হয়েছে`);
  };

  const handleResetToDefaultTimes = () => {
    if (!window.confirm('আপনি কি পূর্বের ডিফল্ট সময়সূচীতে ফিরে যেতে চান?')) return;
    if (routineGender === 'FEMALE') {
      setFemalePeriodSchedule(defaultFemalePeriods);
      localStorage.removeItem('college_routine_female_periods');
    } else {
      setMalePeriodSchedule(defaultMalePeriods);
      localStorage.removeItem('college_routine_male_periods');
    }
    setShowTimeConfigModal(false);
    toast.success('ডিফল্ট সময়সূচী রিস্টোর করা হয়েছে');
  };

  const handleRoutineSubjectChange = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    setRoutineForm(prev => ({
      ...prev,
      subject: subjectId,
      teacher: sub?.default_teacher || prev.teacher || (teachers[0]?.id || '')
    }));
  };

  const handleCreateRoutineSlot = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...routineForm,
        start_time: `${routineForm.start_time}:00`,
        end_time: `${routineForm.end_time}:00`
      };
      const res = await api.post('academics/routines/', payload);
      if (res.status === 201) {
        toast.success('রুটিন স্লট সফলভাবে যুক্ত হয়েছে');
        setShowRoutineModal(false);
        fetchRoutines();
      }
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'রুটিন সংঘাত ধরা পড়েছে');
    }
  };

  const handleDeleteRoutineSlot = async (id) => {
    if (!canEdit) {
      toast.error('শুধুমাত্র প্রিন্সিপাল রুটিন স্লট পরিবর্তন করতে পারেন।');
      return;
    }
    if (!window.confirm('আপনি কি এই ক্লাস স্লটটি ডিলিট করতে চান?')) return;
    try {
      await api.delete(`academics/routines/${id}/`);
      toast.success('স্লট ডিলিট সম্পন্ন হয়েছে');
      fetchRoutines();
    } catch (e) {
      toast.error('ডিলিট ব্যর্থ হয়েছে');
    }
  };

  const findRoutineSlot = (classLevel, group, startTime, endTime) => {
    return routines.find(r => {
      const secId = typeof r.section === 'object' ? r.section?.id : r.section;
      const sec = sections.find(s => s.id === secId);

      let isClassMatch = false;
      let isGroupMatch = false;

      if (sec) {
        isClassMatch = sec.class_level === classLevel;
        isGroupMatch = sec.group === group;
      } else if (r.section_display) {
        const disp = r.section_display.toLowerCase();
        isClassMatch = disp.includes(classLevel.toLowerCase()) || 
                       (classLevel === 'XI' && (disp.includes('একাদশ') || disp.includes('1st'))) ||
                       (classLevel === 'XII' && (disp.includes('দ্বাদশ') || disp.includes('2nd')));
        isGroupMatch = disp.includes(group.toLowerCase()) || 
                       (group === 'SCI' && disp.includes('বিজ্ঞান')) ||
                       (group === 'HUM' && disp.includes('মানবিক')) ||
                       (group === 'BUS' && disp.includes('ব্যবসায়'));
      }

      if (!isClassMatch || !isGroupMatch) return false;

      const secName = (sec?.section_name || r.section_display || '').toLowerCase();
      const isExplicitFemale = secName.includes('female') || secName.includes('ছাত্রী') || secName === 'b';
      const isExplicitMale = secName.includes('male') || secName.includes('ছাত্র') || secName === 'a';

      if (routineGender === 'FEMALE') {
        if (isExplicitMale && !isExplicitFemale) return false;
      } else {
        if (isExplicitFemale && !isExplicitMale) return false;
      }

      if (!r.start_time) return false;
      const rStart = r.start_time.slice(0, 5);
      const pStart = startTime.slice(0, 5);

      return rStart === pStart || (startTime <= r.start_time && (!endTime || r.start_time < endTime));
    });
  };

  const handleCellClick = (classLevel, group, period) => {
    if (!canEdit) return;
    const matchedSec = sections.find(s => 
      s.class_level === classLevel && 
      s.group === group && 
      (routineGender === 'FEMALE' 
        ? (s.section_name?.includes('Female') || s.section_name === 'B') 
        : (s.section_name?.includes('Male') || s.section_name === 'A'))
    ) || sections.find(s => s.class_level === classLevel && s.group === group) || sections[0];

    const matchingSubjects = subjects.filter(sub => sub.class_level === classLevel && (sub.group === group || sub.group === 'GEN'));
    const defaultSub = matchingSubjects[0] || subjects[0];
    const defaultTeach = defaultSub?.default_teacher || teachers[0]?.id || '';

    setRoutineForm({
      section: matchedSec?.id || '',
      subject: defaultSub?.id || '',
      teacher: defaultTeach,
      day_of_week: selectedDayOfWeek,
      start_time: period.start,
      end_time: period.end,
      room_number: routineGender === 'FEMALE' ? 'Room-302' : 'Room-201'
    });
    setShowRoutineModal(true);
  };

  const currentPeriods = routineGender === 'FEMALE' ? femalePeriodSchedule : malePeriodSchedule;

  return (
    <div className="space-y-4">
      {/* ফিল্টার কন্ট্রোল বার */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setRoutineGender('FEMALE')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 rounded-xl px-5 py-2 text-xs font-extrabold transition ${
              routineGender === 'FEMALE' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👩‍🎓 ছাত্রী রুটিন</span>
          </button>

          <button
            onClick={() => setRoutineGender('MALE')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 rounded-xl px-5 py-2 text-xs font-extrabold transition ${
              routineGender === 'MALE' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👨‍🎓 ছাত্র রুটিন</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {daysLabels.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDayOfWeek(d.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap transition ${
                  selectedDayOfWeek === d.id ? 'bg-[#0F2C59] text-white shadow' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {canEdit && (
            <button
              onClick={handleOpenTimeModal}
              className="flex items-center space-x-1.5 rounded-xl bg-orange-50 text-brand-orange border border-orange-200 px-3 py-2 text-xs font-bold hover:bg-orange-100 transition shadow-sm shrink-0"
            >
              <Settings className="h-4 w-4" />
              <span>⏱️ সময় এডিট</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 rounded-xl bg-[#0F2C59] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* প্রধান রুটিন টেবিল গ্রিড */}
      <div className="rounded-3xl bg-white p-6 border-2 border-slate-300 shadow-premium print:border-none print:shadow-none print:p-0">
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-800">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              একাদশ ও দ্বাদশ শ্রেণির সকল গ্রুপের ছাত্র-ছাত্রীদের পাঠদানের সময়সূচী
            </h2>
            
            {canEdit && isEditingSession ? (
              <div className="no-print inline-flex items-center space-x-1">
                <input
                  type="text"
                  value={tempSessionInput}
                  onChange={(e) => setTempSessionInput(e.target.value)}
                  className="rounded-lg border-2 border-brand-orange px-2 py-0.5 text-lg font-black text-brand-navy w-28 text-center focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveSession}
                  className="rounded-lg bg-emerald-600 p-1 text-white hover:bg-emerald-500"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5">
                <span className="text-xl font-black text-brand-orange">{sessionTitle}</span>
                {canEdit && (
                  <button
                    onClick={() => {
                      setTempSessionInput(sessionTitle);
                      setIsEditingSession(true);
                    }}
                    className="no-print p-1 text-slate-400 hover:text-brand-orange transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-center space-x-3 text-xs font-bold">
            <span className={`px-3 py-0.5 rounded-full text-white ${routineGender === 'FEMALE' ? 'bg-pink-600' : 'bg-blue-700'}`}>
              {routineGender === 'FEMALE' ? 'ছাত্রী রুটিন' : 'ছাত্র রুটিন'}
            </span>
            <span className="text-brand-orange text-sm font-extrabold">
              {daysLabels.find(d => d.id === selectedDayOfWeek)?.name}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-2 border-slate-800 border-collapse">
            <thead className="bg-[#FFE5D4] text-slate-900 font-extrabold border-b-2 border-slate-800">
              <tr>
                <th className="p-2 border-2 border-slate-800 w-16">বার</th>
                <th className="p-2 border-2 border-slate-800 w-16">শ্রেণী</th>
                <th className="p-2 border-2 border-slate-800 w-16">বিভাগ</th>
                
                {currentPeriods.map((p, idx) => (
                  <th
                    key={idx}
                    className={`p-2 border-2 border-slate-800 ${
                      p.isBreak ? 'bg-[#FCD5B5] w-20 text-[11px] font-black' : p.isAssembly ? 'bg-[#FEE2E2] w-24' : 'min-w-[110px]'
                    }`}
                  >
                    <div>{p.period}</div>
                    <div className="text-[10px] font-semibold text-slate-700 mt-0.5 font-mono">
                      {p.timeDisplay || `${p.start}-${p.end}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-800 font-bold text-slate-800">
              {classRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/70">
                  {rowIdx === 0 && (
                    <td rowSpan={classRows.length} className="border-2 border-slate-800 font-black text-sm p-2 bg-slate-50 [writing-mode:vertical-lr] rotate-180 text-center">
                      {daysLabels.find(d => d.id === selectedDayOfWeek)?.name}
                    </td>
                  )}

                  <td className="border-2 border-slate-800 p-2 text-brand-navy">
                    {row.class_name}
                    <span className="block text-[10px] font-semibold text-slate-500">
                      {routineGender === 'FEMALE' ? 'ছাত্রী' : 'ছাত্র'}
                    </span>
                  </td>

                  <td className={`border-2 border-slate-800 p-2 font-black ${row.groupColor}`}>
                    {row.group_name}
                  </td>

                  {currentPeriods.map((p, pIdx) => {
                    if (p.isBreak) {
                      if (rowIdx === 0) {
                        return (
                          <td
                            key={pIdx}
                            rowSpan={classRows.length}
                            className="border-2 border-slate-800 bg-[#FCD5B5] text-slate-900 font-black p-2 [writing-mode:vertical-lr] text-center rotate-180"
                          >
                            বিরতি: {p.timeDisplay || `${p.start}-${p.end}`}
                          </td>
                        );
                      }
                      return null;
                    }

                    if (p.isAssembly) {
                      return (
                        <td key={pIdx} className="border-2 border-slate-800 p-2 text-center text-xs font-black text-brand-orange bg-orange-50/30">
                          সমাবেশ
                        </td>
                      );
                    }

                    const slot = findRoutineSlot(row.class_level, row.group, p.start, p.end);
                    const badge = slot ? getSubjectShortBadge(slot.subject_name) : null;
                    const isMyClass = slot && user && (
                      slot.teacher === user.id || 
                      (user.first_name && slot.teacher_name?.toLowerCase().includes(user.first_name?.toLowerCase()))
                    );

                    return (
                      <td
                        key={pIdx}
                        className={`border-2 border-slate-800 p-1.5 text-center relative group min-h-[64px] ${
                          isMyClass ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        {slot ? (
                          <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl bg-white shadow-sm border ${
                            isMyClass ? 'border-2 border-brand-orange ring-2 ring-brand-orange/20 shadow-md' : 'border-slate-200'
                          }`}>
                            <div className="flex items-center space-x-1">
                              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black border ${badge.bg} shadow-sm`}>
                                {badge.short}
                              </span>
                              {isMyClass && (
                                <span className="rounded bg-brand-orange px-1 py-0.5 text-[9px] font-black text-white">
                                  আমার
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 mt-1 truncate max-w-[100px]" title={slot.subject_name}>
                              {slot.subject_name}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 truncate max-w-[95px]">
                              👨‍🏫 {slot.teacher_name?.split(' ')?.[0] || 'শিক্ষক'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {slot.room_number || "Room-N/A"}
                            </span>

                            {canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRoutineSlot(slot.id);
                                }}
                                className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 bg-white rounded-md shadow-sm transition"
                                title="স্লট ডিলিট করুন"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ) : canEdit ? (
                          <button
                            type="button"
                            onClick={() => handleCellClick(row.class_level, row.group, p)}
                            className="no-print w-full h-full min-h-[48px] rounded-xl border border-dashed border-slate-300 hover:border-brand-orange hover:bg-orange-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-brand-orange transition group/btn"
                            title="নতুন ক্লাস স্লট যুক্ত করুন"
                          >
                            <Plus className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                            <span className="text-[10px] font-bold mt-0.5">+ ক্লাস যোগ</span>
                          </button>
                        ) : (
                          <div className="w-full h-full min-h-[48px] flex items-center justify-center text-slate-300 font-mono text-sm">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⏱️ সময় এডিট মডাল */}
      {canEdit && showTimeConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-premium border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy">
                  {routineGender === 'FEMALE' ? '👩‍🎓 ছাত্রী শিফট' : '👨‍🎓 ছাত্র শিফট'} এর পিরিয়ড সময়সূচী পরিবর্তন
                </h3>
                <p className="text-xs text-slate-500">প্রতিটি পিরিয়ডের শুরুর ও শেষের সময় পরিবর্তন করুন।</p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefaultTimes}
                className="flex items-center space-x-1 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>রিসেট</span>
              </button>
            </div>

            <form onSubmit={handleSaveConfiguredTimes} className="space-y-3">
              <div className="space-y-2">
                {editingScheduleList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <span className="w-16 font-extrabold text-xs text-brand-navy">
                      {item.period} {item.isBreak ? '(বিরতি)' : item.isAssembly ? '(সমাবেশ)' : 'পিরিয়ড'}
                    </span>

                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400">শুরুর সময়</label>
                        <input
                          type="time"
                          value={item.start}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingScheduleList(prev => prev.map((p, i) => i === idx ? { ...p, start: val } : p));
                          }}
                          className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400">শেষের সময়</label>
                        <input
                          type="time"
                          value={item.end}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingScheduleList(prev => prev.map((p, i) => i === idx ? { ...p, end: val } : p));
                          }}
                          className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400">হেডার টেক্সট</label>
                        <input
                          type="text"
                          value={item.timeDisplay}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingScheduleList(prev => prev.map((p, i) => i === idx ? { ...p, timeDisplay: val } : p));
                          }}
                          className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTimeConfigModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* স্লট তৈরির মডাল */}
      {canEdit && showRoutineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-3">নতুন ক্লাস রুটিন পিরিয়ড স্লট</h3>
            <form onSubmit={handleCreateRoutineSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শাখা নির্বাচন</label>
                  <select
                    value={routineForm.section} onChange={e => setRoutineForm({...routineForm, section: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold" required
                  >
                    <option value="">-- শাখা সিলেক্ট করুন --</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.class_level} - {s.group} ({s.section_name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বার (Day)</label>
                  <select
                    value={routineForm.day_of_week} onChange={e => setRoutineForm({...routineForm, day_of_week: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                  >
                    {daysLabels.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিষয়</label>
                  <select
                    value={routineForm.subject} 
                    onChange={e => handleRoutineSubjectChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold" required
                  >
                    <option value="">-- বিষয় সিলেক্ট করুন --</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>[{sub.code}] {sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">প্রভাষক / শিক্ষক</label>
                  <select
                    value={routineForm.teacher} onChange={e => setRoutineForm({...routineForm, teacher: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold" required
                  >
                    <option value="">-- শিক্ষক সিলেক্ট করুন --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name || t.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শুরুর সময়</label>
                  <input
                    type="time"
                    value={routineForm.start_time} onChange={e => setRoutineForm({...routineForm, start_time: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শেষের সময়</label>
                  <input
                    type="time"
                    value={routineForm.end_time} onChange={e => setRoutineForm({...routineForm, end_time: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">রুম নং</label>
                  <input
                    type="text" placeholder="যেমন: Room-302"
                    value={routineForm.room_number} onChange={e => setRoutineForm({...routineForm, room_number: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowRoutineModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">স্লট নিশ্চিত করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineTab;