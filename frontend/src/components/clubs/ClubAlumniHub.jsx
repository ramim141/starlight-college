import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getClubsApi, 
  createClubApi, 
  getClubEventsApi, 
  createClubEventApi, 
  getAlumniRecordsApi, 
  verifyAlumniRecordApi,
  getStaffListApi
} from '../../api/principal';
import { 
  Sparkles, 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * ClubAlumniHub - বহু-ব্যবহারযোগ্য ক্লাব, ইভেন্ট ও অ্যালুমনি নেটওয়ার্ক হাব
 * প্রিন্সিপাল, শিক্ষক (মডারেটর) এবং শিক্ষার্থী সবার জন্য উপযোগী।
 */
const ClubAlumniHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isTeacher: authIsTeacher, isStudent: authIsStudent } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;
  const isStudent = overrideRole ? overrideRole === 'STUDENT' : authIsStudent;

  const [activeTab, setActiveTab] = useState('clubs'); // 'clubs' | 'events' | 'alumni'
  const [loading, setLoading] = useState(true);

  // ১. ক্লাব
  const [clubs, setClubs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    moderator: '',
    is_active: true,
  });

  // ২. ইভেন্ট
  const [events, setEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    club: '',
    title: '',
    description: '',
    event_date: '',
    venue: '',
    registration_fee: 0,
  });

  // ৩. অ্যালুমনি
  const [alumniList, setAlumniList] = useState([]);

  const fetchClubData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'clubs') {
        const [clubRes, staffRes] = await Promise.allSettled([
          getClubsApi(),
          getStaffListApi()
        ]);
        if (clubRes.status === 'fulfilled') {
          const list = clubRes.value.results || clubRes.value;
          setClubs(Array.isArray(list) ? list : []);
        }
        if (staffRes.status === 'fulfilled') {
          const sList = staffRes.value.results || staffRes.value;
          setTeachers(Array.isArray(sList) ? sList.filter(u => u.role === 'TEACHER') : []);
        }
      } else if (activeTab === 'events') {
        const [eventRes, clubRes] = await Promise.allSettled([
          getClubEventsApi(),
          getClubsApi()
        ]);
        if (eventRes.status === 'fulfilled') {
          const list = eventRes.value.results || eventRes.value;
          setEvents(Array.isArray(list) ? list : []);
        }
        if (clubRes.status === 'fulfilled') {
          const cList = clubRes.value.results || clubRes.value;
          setClubs(Array.isArray(cList) ? cList : []);
        }
      } else {
        const res = await getAlumniRecordsApi();
        const list = res.results || res;
        setAlumniList(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      toast.error('ক্লাব ও অ্যালুমনি তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [activeTab]);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const res = await createClubApi(newClub);
      if (res.id || res.success) {
        toast.success('নতুন ক্লাব গঠন সম্পন্ন হয়েছে');
        setShowAddClubModal(false);
        setNewClub({ name: '', description: '', moderator: '', is_active: true });
        fetchClubData();
      }
    } catch (err) {
      toast.error('ক্লাব তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await createClubEventApi(newEvent);
      if (res.id || res.success) {
        toast.success('ক্লাব ইভেন্ট সফলভাবে শিডিউল হয়েছে');
        setShowAddEventModal(false);
        setNewEvent({ club: '', title: '', description: '', event_date: '', venue: '', registration_fee: 0 });
        fetchClubData();
      }
    } catch (err) {
      toast.error('ইভেন্ট তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleVerifyAlumni = async (id, status) => {
    try {
      const res = await verifyAlumniRecordApi(id, status);
      if (res.success || res.id) {
        toast.success(res.message || 'অ্যালুমনি স্ট্যাটাস আপডেট হয়েছে');
        fetchClubData();
      }
    } catch (err) {
      toast.error('ভেরিফিকেশন ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0F2C59] p-6 rounded-2xl border border-white/10 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400 border border-pink-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">ক্লাব, অলিম্পিয়াড ও অ্যালুমনি হাব</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              কো-কারিকুলার ক্লাব পরিচালনা, শিক্ষক মডারেটর নিয়োগ ও প্রাক্তন শিক্ষার্থী নেটওয়ার্ক
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'clubs' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ক্লাবসমূহ
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'events' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ইভেন্ট ও মেলা
            </button>
            <button
              onClick={() => setActiveTab('alumni')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'alumni' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              অ্যালুমনি তালিকা
            </button>
          </div>

          {isPrincipal && activeTab === 'clubs' && (
            <button
              onClick={() => setShowAddClubModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> নতুন ক্লাব
            </button>
          )}

          {(isPrincipal || isTeacher) && activeTab === 'events' && (
            <button
              onClick={() => setShowAddEventModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> ইভেন্ট আয়োজন
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'clubs' ? (
        /* ================= ১. ক্লাব তালিকা ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{c.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-semibold">
                  সক্রিয়
                </span>
              </div>
              <p className="my-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                {c.description || 'ক্লাবের বিস্তারিত তথ্য নেই।'}
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <div>
                  শিক্ষক মডারেটর: <strong>{c.moderator_name || 'নিযুক্ত হয়নি'}</strong>
                </div>
                <div>
                  মোট সদস্য: <strong>{c.members_count || 0} জন শিক্ষার্থী</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'events' ? (
        /* ================= ২. ইভেন্ট তালিকা ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-xs font-bold text-brand-orange uppercase">{ev.club_name}</span>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mt-1">{ev.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                  <span>তারিখ: {ev.event_date}</span>
                </div>
                <div>স্থান: {ev.venue || 'কলেজ অডিটোরিয়াম'}</div>
                <div>ফি: {ev.registration_fee > 0 ? `৳ ${ev.registration_fee}` : 'ফ্রি'}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= ৩. অ্যালুমনি ডিরেক্টরি ও ভেরিফিকেশন ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isPrincipal ? 'প্রাক্তন শিক্ষার্থীদের রেজিস্ট্রেশন অনুমোদন ও ডিরেক্টরি' : 'প্রাক্তন শিক্ষার্থী ডিরেক্টরি'} ({alumniList.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {alumniList.map((alumni) => (
              <div key={alumni.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-800 dark:text-slate-100">{alumni.full_name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                      ব্যাচ: {alumni.passing_year} (রোল: {alumni.hsc_roll})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {alumni.current_designation || 'পড়াশোনা'} - {alumni.current_institution || 'বিশ্ববিদ্যালয়'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {alumni.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {alumni.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alumni.status === 'APPROVED' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদিত অ্যালুমনি
                    </span>
                  ) : alumni.status === 'REJECTED' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold">
                      প্রত্যাখ্যাত
                    </span>
                  ) : isPrincipal ? (
                    <>
                      <button
                        onClick={() => handleVerifyAlumni(alumni.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        অনুমোদন দিন
                      </button>
                      <button
                        onClick={() => handleVerifyAlumni(alumni.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        রিজেক্ট
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold">অপেক্ষমাণ</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* নতুন ক্লাব তৈরি মডাল */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              নতুন ক্লাব গঠন
            </h3>
            <form onSubmit={handleCreateClub} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ক্লাবের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সায়েন্স ক্লাব, ডিবেট ক্লাব"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">শিক্ষক মডারেটর নিয়োগ</label>
                <select
                  value={newClub.moderator}
                  onChange={(e) => setNewClub({ ...newClub, moderator: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="">মডারেটর নির্বাচন করুন</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name || t.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">উদ্দেশ্য ও বিবরণ</label>
                <textarea
                  rows={3}
                  value={newClub.description}
                  onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  ক্লাব প্রতিষ্ঠা করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* নতুন ইভেন্ট তৈরি মডাল */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-orange" />
              নতুন ক্লাব ইভেন্ট বা অলিম্পিয়াড
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ক্লাব নির্বাচন</label>
                <select
                  required
                  value={newEvent.club}
                  onChange={(e) => setNewEvent({ ...newEvent, club: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="">ক্লাব বেছে নিন</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ইভেন্ট শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="ইন্টার-কলেজ বিজ্ঞান মেলা ২০২৬"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">রেজিস্ট্রেশন ফি</label>
                  <input
                    type="number"
                    value={newEvent.registration_fee}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_fee: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">স্থান / ভেন্যু</label>
                <input
                  type="text"
                  placeholder="কলেজ অডিটোরিয়াম"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  ইভেন্ট শিডিউল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubAlumniHub;
