import React, { useState } from 'react';
import { AssessmentCase, Vendor, CATEGORY_LABELS, CASE_STATUS_LABELS, QUOTE_STATUS_LABELS } from '../types';
import {
  Send,
  Trophy,
  CheckCircle,
  Truck,
  Calendar,
  AlertCircle,
  Smartphone,
  Check,
  Crown,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface ComparisonTableProps {
  assessmentCase: AssessmentCase | null;
  vendors: Vendor[];
  onSendBatchRequest: (caseId: string, vendorIds?: string[]) => void;
  onSelectWinningVendor: (caseId: string, vendorId: string) => void;
  onOpenVendorSimulator: (vendorId: string, caseId: string) => void;
  onCompleteCase?: (caseId: string) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  assessmentCase,
  vendors,
  onSendBatchRequest,
  onSelectWinningVendor,
  onOpenVendorSimulator,
  onCompleteCase,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  if (!assessmentCase) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <Info className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="text-xl font-bold text-slate-800 mb-1">査定案件を選択してください</h3>
        <p className="text-sm text-slate-500 max-w-md">
          左側の案件一覧から確認したい案件を選択すると、各買取業者の相見積もり結果や提示条件を比較できます。
        </p>
      </div>
    );
  }

  // Quoted quotes list
  const quotedQuotes = assessmentCase.quotes.filter((q) => q.status === 'quoted' && q.price);
  const highestPrice = quotedQuotes.reduce(
    (max, q) => ((q.price || 0) > max ? (q.price || 0) : max),
    0
  );

  const statusConfig = CASE_STATUS_LABELS[assessmentCase.status];

  const handleBatchSend = () => {
    onSendBatchRequest(assessmentCase.id);
    setNotification('各買取業者へLINE査定依頼を一括送信しました！ステータスが「査定依頼中」になりました。');
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectWinner = (vendor: Vendor, price?: number) => {
    const formattedPrice = price ? `（提示額: ¥${price.toLocaleString()}）` : '';
    const confirmed = window.confirm(
      `【発注決定の確認】\n「${vendor.name}」${formattedPrice}へ発注を確定しますか？\n決定すると他の業者は失注状態になります。`
    );
    if (confirmed) {
      onSelectWinningVendor(assessmentCase.id, vendor.id);
      setNotification(`「${vendor.name}」への発注が決定しました！ステータスを「発注・成約済み」に更新しました。`);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const winningVendor = vendors.find((v) => v.id === assessmentCase.selectedVendorId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white px-5 py-3 font-bold text-sm sm:text-base flex items-center justify-between shadow-md transition animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white hover:text-emerald-200 text-xs font-semibold underline ml-4"
          >
            閉じる
          </button>
        </div>
      )}

      {/* Case Header Details Banner */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start flex-1 min-w-0">
            {/* Image */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 shrink-0 shadow-md">
              <img
                src={assessmentCase.imageUrl}
                alt={assessmentCase.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {assessmentCase.caseNumber}
                </span>
                <span className="bg-blue-900/60 text-blue-300 text-xs font-bold px-2 py-0.5 rounded border border-blue-700/60">
                  {CATEGORY_LABELS[assessmentCase.category]}
                </span>
                <span className="bg-slate-800 text-slate-200 text-xs font-bold px-2 py-0.5 rounded border border-slate-700">
                  状態ランク: <strong className="text-amber-400">{assessmentCase.conditionRank}</strong>
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1 truncate">
                {assessmentCase.title}
              </h2>

              {assessmentCase.modelNumber && (
                <p className="text-sm text-slate-300 font-medium mb-2">
                  型番/シリアル: <span className="font-semibold text-slate-100">{assessmentCase.modelNumber}</span>
                </p>
              )}

              {/* Accessories tags */}
              {assessmentCase.accessories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-xs text-slate-400">付属品:</span>
                  {assessmentCase.accessories.map((acc, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-800 text-slate-200 font-medium px-2 py-0.5 rounded border border-slate-700"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {assessmentCase.notes && (
                <p className="text-xs sm:text-sm text-slate-300 bg-slate-800/80 p-2 rounded-lg border border-slate-700/80">
                  <strong className="text-amber-400">特記事項:</strong> {assessmentCase.notes}
                </p>
              )}
            </div>
          </div>

          {/* Target Price & Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block lg:text-right">顧客の希望買取価格</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono lg:text-right">
                {assessmentCase.targetPrice ? `¥${assessmentCase.targetPrice.toLocaleString()}` : '希望価格なし'}
              </div>
            </div>

            {/* Batch Send LINE Button */}
            <button
              type="button"
              onClick={handleBatchSend}
              className="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] active:bg-[#049a42] text-white px-5 py-3 rounded-xl font-bold text-base shadow-lg shadow-emerald-500/20 cursor-pointer transition transform active:scale-98 w-full sm:w-auto"
            >
              <Send className="w-5 h-5 text-white" />
              <span>LINE査定依頼を一括送信（シミュレーション）</span>
            </button>
          </div>
        </div>

        {/* Winning vendor banner if ordered */}
        {assessmentCase.status === 'ordered' && winningVendor && (
          <div className="mt-4 p-3.5 bg-blue-900/60 border border-blue-500 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-bold text-white">
                【発注先確定】「{winningVendor.name}」への発注が決定しています。現在商品の発送・検品進行中です。
              </span>
            </div>
            {onCompleteCase && (
              <button
                type="button"
                onClick={() => onCompleteCase(assessmentCase.id)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                取引完了にする
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overview stats bar */}
      <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">相見積もりステータス:</span>
          <span className="text-slate-800 font-medium">
            回答済 <strong className="text-emerald-700 font-bold">{quotedQuotes.length}</strong> / 5社
          </span>
          {highestPrice > 0 && (
            <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              現在最高額: ¥{highestPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500">
          ※各業者の回答はLINEトークからリアルタイムに同期されます。
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-56">買取専門業者</th>
              <th className="py-3.5 px-3 w-32">査定状況</th>
              <th className="py-3.5 px-4 w-44">提示査定金額</th>
              <th className="py-3.5 px-3 w-32">送料負担</th>
              <th className="py-3.5 px-3 w-32">見積有効期限</th>
              <th className="py-3.5 px-4">減額条件・バイヤー備考</th>
              <th className="py-3.5 px-4 text-center w-40">発注決定アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {vendors.map((vendor) => {
              const quote = assessmentCase.quotes.find((q) => q.vendorId === vendor.id);
              const status = quote?.status || 'not_sent';
              const statusBadge = QUOTE_STATUS_LABELS[status];
              const isHighest = status === 'quoted' && quote?.price === highestPrice && highestPrice > 0;
              const isWinner = assessmentCase.selectedVendorId === vendor.id;
              const isCategoryMatch = vendor.specialty.includes(assessmentCase.category);

              // Rank styling
              const rankBadge =
                vendor.rank === 'S'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : vendor.rank === 'A'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-slate-100 text-slate-800 border-slate-300';

              return (
                <tr
                  key={vendor.id}
                  className={`transition-colors ${
                    isWinner
                      ? 'bg-blue-50/80 font-medium'
                      : isHighest
                      ? 'bg-emerald-50/50'
                      : status === 'declined'
                      ? 'bg-slate-50 opacity-60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Vendor column */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-start gap-2.5">
                      {vendor.avatarUrl && (
                        <img
                          src={vendor.avatarUrl}
                          alt={vendor.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-base text-slate-900">{vendor.name}</span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${rankBadge}`}>
                            {vendor.rank}ランク
                          </span>
                        </div>

                        {isCategoryMatch && (
                          <span className="inline-block bg-amber-50 text-amber-800 text-[11px] font-bold px-1.5 py-0.2 rounded border border-amber-200 mt-1">
                            ★ 得意ジャンル一致
                          </span>
                        )}

                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{vendor.speedRating}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status column */}
                  <td className="py-4 px-3 align-top">
                    <span
                      className={`inline-block text-xs px-2.5 py-1 rounded-md border ${statusBadge.badgeClass}`}
                    >
                      {statusBadge.label}
                    </span>
                    {quote?.updatedAt && (
                      <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                        {quote.updatedAt.split(' ')[1] || quote.updatedAt}
                      </span>
                    )}
                  </td>

                  {/* Price column */}
                  <td className="py-4 px-4 align-top">
                    {status === 'quoted' && quote?.price ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xl sm:text-2xl font-extrabold ${
                              isHighest ? 'text-emerald-700' : 'text-slate-900'
                            }`}
                          >
                            ¥{quote.price.toLocaleString()}
                          </span>
                        </div>

                        {isHighest && (
                          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full border border-amber-300 mt-1">
                            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                            <span>最高額提示中</span>
                          </div>
                        )}

                        {assessmentCase.targetPrice && quote.price >= assessmentCase.targetPrice && (
                          <span className="block text-[11px] text-emerald-600 font-bold mt-1">
                            ✓ 希望価格クリア (+¥{(quote.price - assessmentCase.targetPrice).toLocaleString()})
                          </span>
                        )}
                      </div>
                    ) : status === 'pending' ? (
                      <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-4 h-4 animate-spin text-amber-600" />
                        査定中...
                      </span>
                    ) : status === 'declined' ? (
                      <span className="text-sm font-bold text-rose-600">査定辞退</span>
                    ) : (
                      <span className="text-sm text-slate-400">依頼未送信</span>
                    )}
                  </td>

                  {/* Shipping Paid By */}
                  <td className="py-4 px-3 align-top">
                    {status === 'quoted' ? (
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            quote?.shippingPaidBy === 'vendor' ? 'text-emerald-700' : 'text-slate-700'
                          }`}
                        >
                          {quote?.shippingPaidBy === 'vendor' ? '業者負担 (着払い)' : '元払い (依頼元)'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>

                  {/* Valid Until */}
                  <td className="py-4 px-3 align-top">
                    {status === 'quoted' && quote?.validUntil ? (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-700 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{quote.validUntil}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>

                  {/* Conditions & notes */}
                  <td className="py-4 px-4 align-top">
                    {status === 'quoted' && quote?.conditions ? (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/70 p-2 rounded border border-slate-200">
                        {quote.conditions}
                      </p>
                    ) : status === 'declined' ? (
                      <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                        {quote?.conditions || '今回は見送りとさせていただきます。'}
                      </p>
                    ) : status === 'pending' ? (
                      <span className="text-xs text-slate-400">LINEトークにて回答入力をお待ちください</span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Action Column */}
                  <td className="py-4 px-4 align-top text-center">
                    {isWinner ? (
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-extrabold flex items-center justify-center gap-1 shadow-sm">
                        <Check className="w-4 h-4" />
                        <span>発注決定済み</span>
                      </div>
                    ) : assessmentCase.status === 'ordered' ? (
                      <span className="text-xs text-slate-400 font-semibold">他社に発注済</span>
                    ) : status === 'quoted' ? (
                      <button
                        type="button"
                        onClick={() => handleSelectWinner(vendor, quote?.price)}
                        className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-sm transition shadow-sm cursor-pointer ${
                          isHighest
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        この業者に決定（発注）
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenVendorSimulator(vendor.id, assessmentCase.id)}
                        className="w-full py-2 px-2.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition flex items-center justify-center gap-1"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>LINE回答を開く</span>
                      </button>
                    )}

                    {/* Quick Simulator Link if already quoted or pending */}
                    {status === 'quoted' && !isWinner && (
                      <button
                        type="button"
                        onClick={() => onOpenVendorSimulator(vendor.id, assessmentCase.id)}
                        className="mt-1.5 text-[11px] text-slate-500 hover:text-emerald-700 font-semibold underline flex items-center justify-center gap-0.5 mx-auto"
                      >
                        <Smartphone className="w-3 h-3 text-emerald-600" />
                        LINE回答を再編集
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer tips */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>相見積もり運用のコツ:</strong> 最高提示額の業者をタップして「この業者に決定」を押すと、確定通知と発送指示が行えます。
          </span>
        </div>
        <div className="font-medium text-slate-500">
          案件番号: {assessmentCase.caseNumber}
        </div>
      </div>
    </div>
  );
};
