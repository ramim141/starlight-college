import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import SectionCard from './SectionCard';

const SectionHierarchyList = ({
  hierarchyData,
  filteredSections,
  viewMode = 'hierarchy',
  teachers = [],
  parentCalls = [],
  leaves = [],
  handovers = [],
  onOpenSupervision,
  onAssignIncharge,
  onEditSection,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleCollapse = (key) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (filteredSections.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center border border-slate-200">
        <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600">কোনো শাখা পাওয়া যায়নি</p>
        <p className="text-xs text-slate-400 mt-1">প্রদত্ত ফিল্টারের সাথে কোনো একাডেমিক শাখা মেলেনি।</p>
      </div>
    );
  }

  // Flat Cards View
  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((sec) => (
          <SectionCard
            key={sec.id}
            sec={sec}
            teachers={teachers}
            parentCalls={parentCalls}
            leaves={leaves}
            handovers={handovers}
            onOpenSupervision={onOpenSupervision}
            onAssignIncharge={onAssignIncharge}
            onEditSection={onEditSection}
          />
        ))}
      </div>
    );
  }

  // Hierarchical View: Session ➔ Class ➔ Group ➔ Section Cards
  return (
    <div className="space-y-8">
      {Array.from(hierarchyData.entries()).map(([sessionKey, classMap]) => {
        return (
          <div key={sessionKey} className="space-y-6">
            {/* ১. সেশন হেডার ব্যানার */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-brand-navy/10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-brand-navy">
                    শিক্ষাবর্ষ সেশন: {sessionKey}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    এই সেশনের অধীনে পরিচালিত সকল একাডেমিক ক্লাস ও শাখা
                  </p>
                </div>
              </div>
            </div>

            {/* ২. ক্লাস ও গ্রুপ গ্রুপিং */}
            {Array.from(classMap.entries()).map(([classKey, groupMap]) => {
              return (
                <div key={classKey} className="space-y-4 pl-0 sm:pl-4">
                  {/* ক্লাস সাব-হেডার */}
                  <div className="flex items-center gap-2 text-brand-orange font-extrabold text-sm uppercase tracking-wide">
                    <GraduationCap className="h-4 w-4" />
                    <span>{classKey}</span>
                  </div>

                  {Array.from(groupMap.entries()).map(([groupKey, secList]) => {
                    const groupCollapseKey = `${sessionKey}_${classKey}_${groupKey}`;
                    const isCollapsed = Boolean(collapsedGroups[groupCollapseKey]);
                    const groupStudents = secList.reduce((acc, s) => acc + (s.total_students || 0), 0);

                    return (
                      <div
                        key={groupKey}
                        className="rounded-3xl bg-slate-50/70 p-4 sm:p-5 border border-slate-200/80 space-y-4"
                      >
                        {/* গ্রুপ হেডার বার */}
                        <div
                          onClick={() => toggleCollapse(groupCollapseKey)}
                          className="flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-brand-navy" />
                            <h4 className="text-xs sm:text-sm font-extrabold text-brand-navy">
                              {groupKey} বিভাগ ({secList.length} টি শাখা)
                            </h4>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                              <Users className="h-3 w-3 text-brand-orange" />
                              {groupStudents} জন শিক্ষার্থী
                            </span>
                          </div>

                          <button className="text-slate-400 hover:text-slate-700 transition">
                            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* কার্ডস গ্রিড */}
                        {!isCollapsed && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                            {secList.map((sec) => (
                              <SectionCard
                                key={sec.id}
                                sec={sec}
                                teachers={teachers}
                                parentCalls={parentCalls}
                                leaves={leaves}
                                handovers={handovers}
                                onOpenSupervision={onOpenSupervision}
                                onAssignIncharge={onAssignIncharge}
                                onEditSection={onEditSection}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SectionHierarchyList;
