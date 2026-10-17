import React, { useState } from 'react';
import api from '../../api/client';
import { Send, PhoneCall, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalBroadcast = () => {
  const [targetGroup, setTargetGroup] = useState('ABSENT_TODAY');
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);
  const [lastDispatched, setLastDispatched] = useState(null);

  const handleTemplateSelect = (type) => {
    if (type === 'ABSENT_TODAY') {
      setMessageBody('জরুরি বিজ্ঞপ্তি: আপনার সন্তান আজ কলেজে অনুপস্থিত রয়েছে। অনুপস্থিতির কারণ জানাতে শ্রেণি ইনচার্জের সাথে কথা বলুন। - স্টারলাইট কলেজ, সিলেট');
    } else if (type === 'FEE_DEFAULTERS') {
      setMessageBody('সম্মানিত অভিভাবক, আপনার সন্তানের কলেজ ফি বকেয়া রয়েছে। পরীক্ষার পূর্বে বকেয়া পরিশোধ করার জন্য বিনীত অনুরোধ করা হলো। - স্টারলাইট কলেজ');
    } else if (type === 'ALL_TEACHERS') {
      setMessageBody('জরুরি নোটিশ: অদ্য দুপুর ১:৩০ ঘটিকায় অধ্যক্ষ মহোদয়ের কক্ষে সকল শিক্ষকের বিশেষ জরুরি মিটিং অনুষ্ঠিত হবে।');
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      toast.error('মেসেজের বিষয়বস্তু লিখুন');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('operations/sms/dispatch/', {
        target_group: targetGroup,
        message_body: messageBody
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setLastDispatched(res.data);
      }
    } catch (err) {
      toast.error('মেসেজ প্রেরণ ব্যর্থ হয়েছে');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#1A365D] to-[#142B4E] p-6 text-white shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="rounded-2xl bg-brand-orange p-2.5 text-white">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">টার্গেটেড স্মার্ট হোয়াটসঅ্যাপ ও SMS ব্রডকাস্ট</h2>
            <p className="text-xs text-slate-300">ডেটাবেস ফিল্টার করে শুধুমাত্র নির্দিষ্ট লক্ষ্যভুক্তদের কাছে এক ক্লিকে মেসেজ পাঠান।</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-soft">
        <form onSubmit={handleDispatch} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">কাদের কাছে মেসেজ পাঠাতে চান? (Target Audience)</label>
            <select
              value={targetGroup}
              onChange={(e) => {
                setTargetGroup(e.target.value);
                handleTemplateSelect(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              <option value="ABSENT_TODAY">আজকের অনুপস্থিত শিক্ষার্থীদের অভিভাবক (Real-time)</option>
              <option value="FEE_DEFAULTERS">যাদের বেতন বা ফি বকেয়া আছে তাদের অভিভাবক</option>
              <option value="ALL_TEACHERS">সকল কর্মরত শিক্ষক</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">মেসেজের বিষয়বস্তু (Message Body)</label>
              <button
                type="button"
                onClick={() => handleTemplateSelect(targetGroup)}
                className="text-[11px] font-bold text-brand-orange hover:underline"
              >
                ডিফল্ট টেমপ্লেট লোড করুন
              </button>
            </div>
            <textarea
              rows="5"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="এখানে মেসেজ লিখুন..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 focus:border-brand-orange focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center space-x-2 rounded-xl bg-brand-orange px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              <span>{sending ? 'মেসেজ প্রেরিত হচ্ছে...' : 'টার্গেটেড ব্রডকাস্ট শুরু করুন'}</span>
            </button>
          </div>

        </form>

        {lastDispatched && (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <strong className="text-sm">ব্রডকাস্ট সম্পন্ন!</strong>
            </div>
            <p className="mt-1">মোট <strong>{lastDispatched.total_recipients}</strong> জন প্রাপকের ফোনে সফলভাবে মেসেজ কিউতে যুক্ত হয়েছে।</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PrincipalBroadcast;