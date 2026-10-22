import React, { useState, useMemo } from 'react';
import { AssessmentCase, ItemCategory, CaseStatus, CATEGORY_LABELS, CASE_STATUS_LABELS } from '../types';
import { Search, PlusCircle, Filter, ArrowUpDown, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface CaseListProps {
  cases: AssessmentCase[];
  activeCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onOpenNewCaseModal: () => void;
  selectedStatusFilter: CaseStatus | 'all';
  onSelectStatusFilter: (status: CaseStatus | 'all') => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onOpenNewCaseModal,
  selectedStatusFilter,
  onSelectStatusFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price-desc' | 'quotes-count'>('latest');

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    return cases
      .filter((item) => {
        // Status filter
        if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        // Search term
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchModel = item.modelNumber?.toLowerCase().includes(query) || false;
          const matchCaseNum = item.caseNumber.toLowerCase().includes(query);
          const matchNotes = item.notes?.toLowerCase().includes(query) || false;
          if (!matchTitle && !matchModel && !matchCaseNum && !matchNotes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-desc') {
          return (b.targetPrice || 0) - (a.targetPrice || 0);
        }
        if (sortBy === 'quotes-count') {
          const countA = a.quotes.filter((q) => q.status === 'quoted').length;
          const countB = b.quotes.filter((q) => q.status === 'quoted').length;
          return countB - countA;
        }
        // Default latest (createdAt or order in array)
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [cases, selectedStatusFilter, selectedCategory, searchTerm, sortBy]);

  const categories: Array<ItemCategory | 'all'> = [
    'all',
    'watch',
    'bag',
    'jewelry',
    'camera',
    'antique',
    'other',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header bar of Case List */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              査定案件一覧
            </h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredCases.length} 件
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenNewCaseModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer w-full sm:w-auto"
          >
            <PlusCircle className="w-5 h-5 text-blue-100" />
            <span>新規案件を登録</span>
          </button>
        </div>

        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="品名、型番、案件番号で検索..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">新着順</option>
              <option value="price-desc">希望価格が高い順</option>
              <option value="quotes-count">回答数が多い順</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2.5 scrollbar-thin">
          {categories.map((cat) => {
            const isCatSelected = selectedCategory === cat;
            const label = cat === 'all' ? '全カテゴリ' : CATEGORY_LABELS[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  isCatSelected
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cases List Content */}
      <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[720px] lg:max-h-[calc(100vh-280px)]">
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-base font-bold text-slate-700 mb-1">該当する案件が見つかりませんでした</p>
            <p className="text-xs text-slate-500 mb-4">検索条件やフィルターを変更するか、新規登録してください。</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                onSelectStatusFilter('all');
              }}
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              検索条件をリセット
            </button>
          </div>
        ) : (
          filteredCases.map((item) => {
            const isSelected = activeCaseId === item.id;
            const statusConfig = CASE_STATUS_LABELS[item.status];
            const quotedQuotes = item.quotes.filter((q) => q.status === 'quoted' && q.price);
            const highestQuote = quotedQuotes.reduce(
              (max, q) => ((q.price || 0) > (max?.price || 0) ? q : max),
              quotedQuotes[0]
            );

            return (
              <div
                key={item.id}
                onClick={() => onSelectCase(item.id)}
                className={`p-3.5 sm:p-4 cursor-pointer transition-all hover:bg-blue-50/50 flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-blue-50/80 border-l-4 border-l-blue-600 ring-1 ring-blue-500/20'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative shrink-0 w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">
                      {item.caseNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-snug">
                    {item.title}
                  </h3>

                  {item.modelNumber && (
                    <p className="text-xs sm:text-sm text-slate-500 truncate font-medium">
                      型番: {item.modelNumber}
                    </p>
                  )}

                  {/* Highlights row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      状態: {item.conditionRank}ランク
                    </span>

                    {item.targetPrice && (
                      <span className="text-xs font-semibold text-slate-500">
                        希望: <strong className="text-slate-800">¥{item.targetPrice.toLocaleString()}</strong>
                      </span>
                    )}
                  </div>

                  {/* Quotes summary status */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {quotedQuotes.length > 0 ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {quotedQuotes.length}社回答済み
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.quotes.filter((q) => q.status === 'pending').length > 0
                            ? '査定依頼中(回答待ち)'
                            : '査定未送信'}
                        </span>
                      )}
                    </div>

                    {highestQuote?.price && (
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500">最高額: </span>
                        <span className="text-sm font-extrabold text-emerald-700 font-mono">
                          ¥{highestQuote.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="self-center hidden sm:block text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
