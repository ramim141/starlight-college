import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * SheetNavItem
 * Reusable navigation link item for DashboardBottomNav "আরও" bottom sheet.
 */
const SheetNavItem = ({ item, isCurrent, onClick, badge }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors duration-150 min-h-[44px] cursor-pointer ${
        isCurrent
          ? 'bg-orange-50 text-brand-orange font-bold border border-orange-200/80 shadow-xs'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center space-x-3 truncate">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isCurrent
              ? 'bg-brand-orange text-white shadow-xs shadow-brand-orange/40'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
        </div>
        <span className="text-xs font-semibold truncate">{item.label}</span>
      </div>

      <div className="flex items-center space-x-1 text-slate-400">
        {badge ? (
          <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4" />
      </div>
    </NavLink>
  );
};

export default SheetNavItem;
