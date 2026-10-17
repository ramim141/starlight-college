import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Award, Printer, CheckCircle2, XCircle, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalCertificates = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ১-ক্লিক প্রশংসাপত্র টেস্ট স্টেট
  const [searchRoll, setSearchRoll] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [searching, setSearching] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('operations/certificates/');
      setRequests(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, status) => {
    try {
      const res = await api.patch(`operations/certificates/${id}/principal-approve/`, { status });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'অনুমোদন ব্যর্থ হয়েছে');
    }
  };

  const handleInstantTestimonialSearch = async (e) => {
    e.preventDefault();
    if (!searchRoll) return;

    setSearching(true);
    try {
      const res = await api.get(`academics/students/?search=${searchRoll}`);
      const students = res.data.results || res.data;
      if (students.length > 0) {
        setSearchedStudent(students[0]);
      } else {
        toast.error('এই রোলের কোনো শিক্ষার্থী পাওয়া যায়নি');
        setSearchedStudent(null);
      }
    } catch (err) {
      toast.error('সার্চ ব্যর্থ হয়েছে');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ১. ওয়ান-ক্লিক প্রশংসাপত্র জেনারেটর (Testimonial Instant Generator) */}
      <div className="no-print rounded-3xl bg-gradient-to-r from-[#0F2C59] to-[#1A365D] p-6 text-white shadow-soft">
        <h2 className="text-xl font-bold">১-ক্লিক প্রশংসাপত্র ও প্রত্যয়নপত্র জেনারেটর</h2>
        <p className="text-xs text-slate-300 mt-1">শিক্ষার্থীর রোল বা আইডি লিখুন, সিস্টেম স্বয়ংক্রিয়ভাবে রেজাল্ট ও পিতার নাম টেনে রেডিমেড প্রশংসাপত্র তৈরি করে দেবে।</p>

        <form onSubmit={handleInstantTestimonialSearch} className="mt-4 flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="রোল নম্বর বা আইডি লিখুন..."
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
            className="flex-1 rounded-xl bg-white text-slate-900 px-3.5 py-2 text-xs font-bold focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
          >
            {searching ? 'খোঁজা হচ্ছে...' : 'সনদ প্রস্তুত করুন'}
          </button>
        </form>
      </div>

      {/* রেডিমেড প্রশংসাপত্র প্রিন্ট প্রিভিউ */}
      {searchedStudent && (
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 border-4 border-double border-slate-800 shadow-premium print:border-none print:shadow-none">
          <div className="text-center pb-4 border-b border-slate-300">
            <h1 className="text-2xl font-black text-[#0F2C59]">STARLIGHT COLLEGE, SYLHET</h1>
            <p className="text-xs text-slate-600">Sunargown R/A, Dokshin Surma, Sylhet | EIIN: 135342</p>
            <h2 className="mt-4 inline-block border-b-2 border-slate-800 px-4 pb-0.5 text-base font-black uppercase tracking-widest text-slate-900">
              প্রশংসাপত্র (TESTIMONIAL)
            </h2>
          </div>

          <div className="my-8 text-sm leading-relaxed text-slate-800 text-justify">
            এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong className="text-brand-navy font-bold">{searchedStudent.full_name}</strong>, পিতা: <strong>{searchedStudent.father_name}</strong>, মাতা: <strong>{searchedStudent.mother_name}</strong>, অত্র কলেজের <strong className="text-brand-orange">{searchedStudent.section_name_display}</strong> শাখার একজন নিয়মিত শিক্ষার্থী ছিলেন। তাঁহার শ্রেণি রোল নম্বর <strong>{searchedStudent.roll_number}</strong> এবং সেশন <strong>{searchedStudent.session}</strong>।<br /><br />
            তিনি অত্র কলেজের কোনো শৃঙ্খলাবিরোধী কার্যকলাপে জড়িত ছিলেন না। তাঁহার স্বভাব-চরিত্র উত্তম। আমি তাঁহার জীবনের সার্বিক উন্নতি ও সাফল্য কামনা করি।
          </div>

          <div className="mt-16 flex justify-between text-xs font-bold text-slate-700">
            <div>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
            <div className="text-center">
              <div className="h-0.5 w-36 bg-slate-400 mb-1"></div>
              <span>অধ্যক্ষের স্বাক্ষর ও সিল</span>
            </div>
          </div>

          <div className="no-print mt-6 flex justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
            >
              <Printer className="h-4 w-4" />
              <span>প্রশংসাপত্র প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ২. শিক্ষার্থীদের অনলাইন সনদ আবেদনের তালিকা ও অনুমোদন */}
      <div className="no-print rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <h3 className="font-extrabold text-base text-brand-navy mb-4">অনলাইন প্রত্যয়নপত্র ও প্রশংসাপত্র আবেদনসমূহ</h3>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">বর্তমানে কোনো আবেদন জমা নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div key={req.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-brand-navy">{req.student_name} (রোল: {req.roll_number})</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status_display}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-brand-orange mt-2">{req.cert_type_display}</h4>
                  <p className="text-xs text-slate-600 mt-1">উদ্দেশ্য: {req.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">ফি: ৳ {req.fee_amount} ({req.is_fee_paid ? 'ফি পরিশোধিত' : 'বকেয়া'})</p>
                  {req.certificate_number && (
                    <p className="text-xs font-mono font-bold text-blue-700 mt-2 bg-blue-50 p-1.5 rounded-lg border border-blue-200">
                      সনদ নং: {req.certificate_number}
                    </p>
                  )}
                </div>

                {req.status === 'PENDING' && (
                  <div className="mt-4 pt-2 border-t border-slate-200 flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id, 'APPROVED')}
                      className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
                    >
                      অনুমোদন করুন (Approve)
                    </button>
                    <button
                      onClick={() => handleApprove(req.id, 'REJECTED')}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PrincipalCertificates;