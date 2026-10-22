import React from 'react';
import { AssessmentCase, CaseStatus } from '../types';
import { Clock, CheckCircle2, ShoppingBag, Archive, Layers } from 'lucide-react';

interface SummaryCardsProps {
  cases: AssessmentCase[];
  selectedStatusFilter: CaseStatus | 'all';
  onSelectStatusFilter: (status: CaseStatus | 'all') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  cases,
  selectedStatusFilter,
  onSelectStatusFilter,
}) => {
  const requestingCount = cases.filter((c) => c.status === 'requesting').length;
  const assessedCount = cases.filter((c) => c.status === 'assessed').length;
  const orderedCount = cases.filter((c) => c.status === 'ordered').length;
  const completedCount = cases.filter((c) => c.status === 'completed').length;
  const totalCount = cases.length;

  const cards = [
    {
      id: 'all' as const,
      label: '全案件',
      count: totalCount,
      sublabel: '登録総数',
      icon: Layers,
      colorClass: 'text-slate-800',
      bgClass: 'bg-white',
      borderClass: 'border-slate-300',
      activeRing: 'ring-2 ring-slate-800 border-slate-800',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'requesting' as const,
      label: '査定依頼中',
      count: requestingCount,
      sublabel: '業者回答待ち',
      icon: Clock,
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50/70',
      borderClass: 'border-amber-300',
      activeRing: 'ring-2 ring-amber-600 border-amber-600 bg-amber-50',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'assessed' as const,
      label: '回答完了',
      count: assessedCount,
      sublabel: '見積もり選定待ち',
      icon: CheckCircle2,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50/70',
      borderClass: 'border-emerald-300',
      activeRing: 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'ordered' as const,
      label: '発注・成約済み',
      count: orderedCount,
      sublabel: '業者決定・発送手配',
      icon: ShoppingBag,
      colorClass: 'text-blue-700',
      bgClass: 'bg-blue-50/70',
      borderClass: 'border-blue-300',
      activeRing: 'ring-2 ring-blue-600 border-blue-600 bg-blue-50',
      badgeBg: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'completed' as const,
      label: '取引完了',
      count: completedCount,
      sublabel: '入金・受取完了',
      icon: Archive,
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50/70',
      borderClass: 'border-purple-300',
      activeRing: 'ring-2 ring-purple-600 border-purple-600 bg-purple-50',
      badgeBg: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatusFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatusFilter(card.id)}
            className={`text-left p-4 rounded-xl border transition-all shadow-xs hover:shadow-md cursor-pointer ${
              isSelected ? card.activeRing : `${card.bgClass} ${card.borderClass}`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-700">{card.label}</span>
              <span className={`p-1.5 rounded-lg ${card.badgeBg}`}>
                <Icon className={`w-4 h-4 ${card.colorClass}`} />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-extrabold tracking-tight ${card.colorClass}`}>
                {card.count}
              </span>
              <span className="text-sm font-bold text-slate-500">件</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{card.sublabel}</p>
          </button>
        );
      })}
    </div>
  );
};
