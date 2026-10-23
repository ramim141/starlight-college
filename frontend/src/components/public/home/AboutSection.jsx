import React from 'react';
import { GraduationCap } from 'lucide-react';
import { getMediaUrl } from '../../../api/homepage';

const AboutSection = ({ content = {} }) => {
  return (
    <section id="about" className="bg-white select-none py-14 sm:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6">
        
        <div className="rounded-3xl bg-gradient-to-r from-[#0A1D3B] via-[#0F2C59] to-[#163A70] p-7 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full pointer-events-none -top-24 -right-24 bg-orange-500/15 blur-3xl" />
          
          <div className="relative z-10 grid items-center grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="text-center lg:col-span-4 lg:text-left">
              <div className="relative inline-block">
                <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-3xl bg-gradient-to-br from-[#FF6B00] to-amber-500 p-1 shadow-2xl">
                  <div className="h-full w-full rounded-[20px] bg-[#0A1D3B] flex flex-col items-center justify-center text-white overflow-hidden">
                    {content.principal_photo ? (
                      <img src={getMediaUrl(content.principal_photo)} alt={content.principal_name || 'অধ্যক্ষ'} className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <GraduationCap className="h-16 w-16 text-[#FF6B00] mb-2" />
                        <span className="text-xs font-black text-white">অধ্যক্ষের কার্যালয়</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-2 right-2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow">
                  অধ্যক্ষ
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-white">{content.principal_name || 'প্রফেসর ড. মুহাম্মদ আব্দুল্লাহ'}</h3>
              <p className="text-xs text-[#FF851B] font-bold">{content.principal_role || 'অধ্যক্ষ, স্টারলাইট কলেজ, সিলেট'}</p>
              <p className="text-[11px] text-slate-300">{content.principal_credentials || 'পিএইচডি (ঢাকা বিশ্ববিদ্যালয়), সাবেক অধ্যাপক'}</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed lg:col-span-8 text-slate-200 sm:text-sm">
              <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-black text-amber-300 border border-white/15">
                {content.badge || 'অধ্যক্ষের বাণী ও দৃষ্টিভঙ্গি'}
              </span>
              <h2 className="text-xl font-black leading-snug text-white sm:text-2xl">
                {content.title || '"আমরা শুধু পরীক্ষার্থী গড়ি না, নৈতিক ও প্রযুক্তিজ্ঞানসম্পন্ন আগামী দিনের বিশ্বনাগরিক গড়ি।"'}
              </h2>
              <p>
                {content.first_paragraph || 'বিসমিল্লাহির রাহমানির রাহিম। আধুনিক শিক্ষার মূল লক্ষ্য কেবল পাঠ্যপুস্তকের জ্ঞান অর্জন নয়, বরং আত্মমর্যাদাশীল, মানবিক ও প্রযুক্তিবিদ্যায় পারদর্শী ব্যক্তিত্বের বিকাশ।'}
              </p>
              <p>
                {content.second_paragraph || 'আমাদের স্বয়ংক্রিয় ক্লাসরুম, ইনচার্জ শিক্ষক তত্ত্বাবধান এবং ডিজিটাল অভিভাবক যোগাযোগ ব্যবস্থার মাধ্যমে প্রতিটি শিক্ষার্থীর প্রতি ব্যক্তিগত নজর রাখা হয়।'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;