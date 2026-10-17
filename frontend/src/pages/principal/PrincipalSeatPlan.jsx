import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getExamsListApi } from '../../api/student';
import { ClipboardList, Plus, ShieldCheck, Users, Home } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalSeatPlan = () => {
  const [exams, setExams] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [invigilations, setInvigilations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // নতুন রুম তৈরির ফর্ম স্টেট
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');

  const fetchData = async () => {
    try {
      const [exRes, roomRes, invRes] = await Promise.all([
        getExamsListApi(),
        api.get('examination/rooms/'),
        api.get('examination/invigilations/')
      ]);
      const exList = exRes.results || exRes;
      const roomList = roomRes.data.results || roomRes.data;
      const invList = invRes.data.results || invRes.data;

      setExams(Array.isArray(exList) ? exList : []);
      if (exList?.length > 0) setSelectedExam(exList[0].id);

      setRooms(Array.isArray(roomList) ? roomList : []);
      setSelectedRooms(Array.isArray(roomList) ? roomList.map(r => r.id) : []);

      setInvigilations(Array.isArray(invList) ? invList : []);
    } catch (err) {
      toast.error('ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('examination/rooms/', {
        room_number: newRoomNumber,
        capacity: parseInt(newRoomCapacity) || 40,
        benches_count: 20
      });
      if (res.status === 201) {
        toast.success(`রুম ${newRoomNumber} সফলভাবে তৈরি হয়েছে`);
        setNewRoomNumber('');
        setNewRoomCapacity('');
        fetchData();
      }
    } catch (err) {
      toast.error('রুম তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleGenerateSeatPlan = async () => {
    if (!selectedExam || selectedRooms.length === 0) {
      toast.error('পরীক্ষা ও কমপক্ষে একটি রুম নির্বাচন করুন');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post(`examination/exams/${selectedExam}/generate-seat-plan/`, {
        room_ids: selectedRooms
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'সিট প্ল্যান তৈরি ব্যর্থ হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ১. সিট প্ল্যান কন্ট্রোল ও জেনারেটর কার্ড */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2C59] to-[#1A365D] p-6 text-white shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">স্বয়ংক্রিয় সিট প্ল্যান জেনারেটর (Seat Plan Engine)</h2>
            <p className="text-xs text-slate-300 mt-1">রুমের ধারণক্ষমতা অনুযায়ী রোল ক্রমানুসারে (Sequential) আসন বিন্যাস করুন।</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="rounded-xl bg-white text-slate-900 px-3 py-2 text-xs font-bold focus:outline-none"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>

            <button
              onClick={handleGenerateSeatPlan}
              disabled={generating}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <ClipboardList className="h-4 w-4" />
              <span>{generating ? 'আসন বণ্টন হচ্ছে...' : '১-ক্লিকে সিট প্ল্যান তৈরি'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ২. রুম নির্বাচন ও নতুন রুম তৈরির গ্রিড */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* রুম সিলেকশন এলাকা */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
          <h3 className="font-extrabold text-base text-brand-navy mb-1">পরীক্ষার হল ও রুমসমূহ</h3>
          <p className="text-xs text-slate-400 mb-4">যে যে রুমে সিট ফেলতে চান সেগুলো টিক দিন</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rooms.map(room => {
              const isSelected = selectedRooms.includes(room.id);
              return (
                <div
                  key={room.id}
                  onClick={() => toggleRoomSelection(room.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition ${
                    isSelected ? 'bg-orange-50/60 border-brand-orange shadow-sm' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-navy">{room.room_number}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-4 w-4 text-brand-orange rounded"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">আসন ক্ষমতা: <strong className="text-slate-800">{room.capacity} টি</strong></p>
                </div>
              );
            })}
          </div>
        </div>

        {/* নতুন পরীক্ষার রুম তৈরি ফর্ম */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
          <h3 className="font-extrabold text-base text-brand-navy mb-1">নতুন রুম যোগ করুন</h3>
          <p className="text-xs text-slate-400 mb-4">নতুন পরীক্ষার হলের আসন ক্ষমতা সেট করুন</p>

          <form onSubmit={handleCreateRoom} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">রুম নম্বর</label>
              <input
                type="text" placeholder="যেমন: Room-302"
                value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">আসন ধারণক্ষমতা</label>
              <input
                type="number" placeholder="যেমন: 40"
                value={newRoomCapacity} onChange={e => setNewRoomCapacity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 rounded-xl bg-[#0F2C59] py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800"
            >
              রুম সেভ করুন
            </button>
          </form>
        </div>

      </div>

      {/* ৩. ইনভিজিলেশন গার্ড রোস্টার */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <h3 className="font-extrabold text-base text-brand-navy mb-4">শিক্ষকদের পরীক্ষার হল গার্ড রোস্টার</h3>
        {invigilations.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">বর্তমানে কোনো হল গার্ড ডিউটি নির্ধারিত নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {invigilations.map(inv => (
              <div key={inv.id} className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-brand-navy">{inv.teacher_name}</span>
                  <span className="rounded-lg bg-orange-100 text-brand-orange px-2 py-0.5 text-[10px] font-extrabold">
                    {inv.room_number}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">তারিখ: {inv.duty_date} ({inv.start_time} - {inv.end_time})</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PrincipalSeatPlan;