import React, { useState, useEffect } from 'react';
import { getMyCertificatesApi, requestCertificateApi } from '../../api/certificate';
import { FileText, Send, CheckCircle2, Clock, AlertCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [certType, setCertType] = useState('STUDENTSHIP');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      const res = await getMyCertificatesApi();
      const list = res.results || res;
      setCertificates(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('আবেদনের উদ্দেশ্য বা কারণ উল্লেখ করুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestCertificateApi({
        certificate_type: certType,
        reason: reason
      });
      if (res.id) {
        toast.success('সনদের আবেদন সফলভাবে জমা হয়েছে। ফি পরিশোধের পর অধ্যক্ষ অনুমোদন করবেন।');
        setReason('');
        fetchCertificates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'আবেদন জমা দেওয়া যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* আবেদন ফর্ম কার্ড */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-brand-navy mb-1">প্রত্যয়নপত্র ও প্রশংসাপত্রের আবেদন</h2>
        <p className="text-xs text-slate-500 mb-4">পাসপোর্ট, ব্যাংক অ্যাকাউন্ট বা ছাড়পত্রের জন্য অনলাইন আবেদন ফরম।</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">সনদের ধরন</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
              >
                <option value="STUDENTSHIP">অধ্যয়নরত প্রত্যয়নপত্র (Studentship Certificate - ফি: ১০০ টাকা)</option>
                <option value="TESTIMONIAL">প্রশংসাপত্র (Testimonial - ফি: ২০০ টাকা)</option>
                <option value="TC">কলেজ ছাড়পত্র (Transfer Certificate / TC - ফি: ২০০ টাকা)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">আবেদনের কারণ বা উদ্দেশ্য</label>
              <input
                type="text"
                placeholder="যেমন: ই-পাসপোর্ট তৈরির জন্য বা ডাচ-বাংলা ব্যাংক অ্যাকাউন্ট খোলা"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 rounded-xl bg-brand-orange px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'আবেদন পাঠান'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* পূর্ববর্তী আবেদনের স্ট্যাটাস ও সনদ তালিকা */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <h3 className="font-extrabold text-base text-brand-navy mb-4">আমার সনদ আবেদনের হিস্ট্রি</h3>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
          </div>
        ) : certificates.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">আপনার কোনো পূর্ববর্তী সনদ আবেদন নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-brand-navy">{cert.cert_type_display}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      cert.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      cert.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cert.status_display}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 font-medium">কারণ: {cert.reason}</p>
                  <div className="mt-2 text-xs flex justify-between text-slate-500">
                    <span>ফি: <strong className="text-slate-800">৳ {cert.fee_amount}</strong></span>
                    <span>ফি স্ট্যাটাস: <strong className={cert.is_fee_paid ? 'text-emerald-600' : 'text-red-500'}>{cert.is_fee_paid ? 'পরিশোধিত' : 'বকেয়া'}</strong></span>
                  </div>

                  {cert.certificate_number && (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <span className="text-[10px] text-blue-500 font-bold uppercase block">সনদ নম্বর</span>
                      <strong className="text-xs font-black text-brand-navy">{cert.certificate_number}</strong>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
                  <span>আবেদনের তারিখ: {new Date(cert.created_at).toLocaleDateString('bn-BD')}</span>
                  {cert.status === 'APPROVED' && <span className="text-emerald-600 font-bold">অনুমোদিত সনদ</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentCertificates;