import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

const NoticesSection = ({ notices = [], onSelectNotice }) => {
  const [noticeFilter, setNoticeFilter] = useState('ALL');
  const noticeTabs = [
    { key: 'ALL', label: 'সকল নোটিশ' },
    { key: 'EXAM', label: 'পরীক্ষা' },
    { key: 'ADMISSION', label: 'ভর্তি ২০২৬' },
    { key: 'EVENT', label: 'সহ-শিক্ষা ও পরিবহন' },
  ];

  const activeNoticeTabIndex = noticeTabs.findIndex((t) => t.key === noticeFilter);

  const filteredNotices = notices.filter((n) => {
    if (noticeFilter === 'ALL') return true;
    if (noticeFilter === 'EXAM') return n.category === 'EXAM';
    if (noticeFilter === 'ADMISSION') return n.category === 'ADMISSION';
    if (noticeFilter === 'EVENT') return n.category === 'EVENT' || n.category === 'TRANSPORT';
    return true;
  });

  // স্লাইডিং পিল পরিমাপ
  const noticeTabRefs = useRef([]);
  const [noticePillStyle, setNoticePillStyle] = useState({ left: 6, width: 0 });

  useEffect(() => {
    const updateNoticePill = () => {
      const activeEl = noticeTabRefs.current[activeNoticeTabIndex];
      if (activeEl) {
        setNoticePillStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    };
    updateNoticePill();
    const frameId = requestAnimationFrame(updateNoticePill);
    window.addEventListener('resize', updateNoticePill);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateNoticePill);
    };
  }, [activeNoticeTabIndex]);

  return (
    <section id="notices" className="py-14 sm:py-20 bg-[#F4F7FB]">
      <div className="px-4 mx-auto max-w-7xl sm:px-6">
        
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3 py-1 text-xs font-black text-[#EA580C]">
              কেন্দ্রীয় সার্কুলার
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] tracking-tight mt-1">
              কলেজ নোটিশ বোর্ড
            </h2>
          </div>

          {/* স্লাইডিং ব্যাকগ্রাউন্ড পিল (হার্ডওয়্যার-অ্যাক্সিলারেটেড ট্রান্সফর্ম) */}
          <div className="relative inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60 backdrop-blur-md self-start sm:self-auto overflow-hidden">
            <div
              className="absolute top-1.5 bottom-1.5 left-0 rounded-xl bg-[#0F2C59] shadow-md pointer-events-none"
              style={{
                width: `${noticePillStyle.width}px`,
                transform: `translateX(${noticePillStyle.left}px)`,
                opacity: noticePillStyle.width > 0 ? 1 : 0,
                transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease',
              }}
            />
            {noticeTabs.map((tab, idx) => (
              <button
                key={tab.key}
                ref={(el) => (noticeTabRefs.current[idx] = el)}
                type="button"
                onClick={() => setNoticeFilter(tab.key)}
                className={`relative z-10 py-2 px-3.5 sm:px-4 text-xs font-black transition-colors duration-200 cursor-pointer whitespace-nowrap rounded-xl min-h-[44px] ${
                  noticeFilter === tab.key ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* কার্ড গ্রিড কন্টেইনার (জিরো লেআউট থ্র্যাশিং) */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-4 pb-2 md:grid-cols-2">
            {filteredNotices.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelectNotice && onSelectNotice(n)}
                className="group w-full text-left rounded-3xl bg-white p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-orange-300 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="rounded-lg bg-orange-50 px-2.5 py-0.5 text-[10px] font-black text-[#EA580C] border border-orange-200/60">
                      {n.category_display || n.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(n.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-[#0F2C59] group-hover:text-[#EA580C] transition-colors mt-2.5 leading-snug">
                    {n.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                  <span>বিস্তারিত পড়ুন</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
            {filteredNotices.length === 0 && (
              <p className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center text-sm font-medium text-slate-500">
                এই বিভাগে এখনো কোনো নোটিশ প্রকাশিত হয়নি।
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default NoticesSection;