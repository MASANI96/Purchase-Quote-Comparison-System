import React, { useState } from 'react';
import { AssessmentCase, Vendor, FinalAssessment, VARIANCE_REASON_OPTIONS } from '../types';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Scale,
  Edit3,
  Calendar,
  UserCheck,
  PackageCheck,
  ShieldAlert,
} from 'lucide-react';

interface FinalAssessmentPanelProps {
  assessmentCase: AssessmentCase;
  winningVendor: Vendor | undefined;
  onMarkShipped: (caseId: string, trackingNumber?: string) => void;
  onRecordFinalAssessment: (
    caseId: string,
    data: {
      finalPrice: number;
      reasonCategory: FinalAssessment['reasonCategory'];
      reasonText: string;
      confirmedBy?: string;
    }
  ) => void;
  onResetFinalAssessment: (caseId: string) => void;
  onCompleteCase: (caseId: string) => void;
}

export const FinalAssessmentPanel: React.FC<FinalAssessmentPanelProps> = ({
  assessmentCase,
  winningVendor,
  onMarkShipped,
  onRecordFinalAssessment,
  onResetFinalAssessment,
  onCompleteCase,
}) => {
  // Find initial quoted price
  const initialQuote = assessmentCase.quotes.find(
    (q) => q.vendorId === assessmentCase.selectedVendorId && q.status === 'quoted'
  );
  const initialPrice = initialQuote?.price || assessmentCase.targetPrice || 0;

  // Shipping form state
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState(
    assessmentCase.trackingNumber || 'ヤマト運輸 4821-3902-1840'
  );

  // Final Assessment input state
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [finalPriceInput, setFinalPriceInput] = useState<string>(
    assessmentCase.finalAssessment?.finalPrice
      ? assessmentCase.finalAssessment.finalPrice.toString()
      : initialPrice.toString()
  );
  const [reasonCategory, setReasonCategory] = useState<FinalAssessment['reasonCategory']>(
    assessmentCase.finalAssessment?.reasonCategory || 'as_quoted'
  );
  const [reasonText, setReasonText] = useState(
    assessmentCase.finalAssessment?.reasonText || ''
  );
  const [confirmedBy, setConfirmedBy] = useState(
    assessmentCase.finalAssessment?.confirmedBy || '店舗代表 / 査定担当'
  );

  // Live calculation of difference
  const currentFinalNum = parseInt(finalPriceInput.replace(/[^0-9]/g, ''), 10) || 0;
  const liveVariance = currentFinalNum - initialPrice;
  const liveVariancePercent =
    initialPrice > 0 ? parseFloat(((liveVariance / initialPrice) * 100).toFixed(1)) : 0;

  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMarkShipped(assessmentCase.id, trackingNumberInput.trim());
    setIsShippingModalOpen(false);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFinalNum || isNaN(currentFinalNum)) {
      alert('有効な確定買取金額を入力してください。');
      return;
    }

    onRecordFinalAssessment(assessmentCase.id, {
      finalPrice: currentFinalNum,
      reasonCategory,
      reasonText: reasonText.trim() || '現物確認完了',
      confirmedBy: confirmedBy.trim(),
    });
    setIsEditingForm(false);
  };

  const status = assessmentCase.status;
  const finalAss = assessmentCase.finalAssessment;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-5 sm:p-6 mb-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>現物到着後の確定金額＆誤差チェック</span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                重要管理項目
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              発注時の事前査定額と、現物検品後の「確定買取金額」の差異・減額理由を記録・管理します。
            </p>
          </div>
        </div>

        {/* Progress Pipeline */}
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 overflow-x-auto py-1">
          <span className={`px-2 py-1 rounded ${status === 'ordered' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            1.発注
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={`px-2 py-1 rounded ${status === 'shipped' ? 'bg-indigo-600 text-white' : status === 'finalized' || status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
            2.発送済
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={`px-2 py-1 rounded ${status === 'finalized' ? 'bg-teal-600 text-white' : status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
            3.現物査定確定
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={`px-2 py-1 rounded ${status === 'completed' ? 'bg-purple-600 text-white' : 'bg-slate-100'}`}>
            4.完了
          </span>
        </div>
      </div>

      {/* STEP A: Case is ordered (Needs shipping) */}
      {status === 'ordered' && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-950 font-bold text-base mb-1">
              <PackageCheck className="w-5 h-5 text-blue-600" />
              <span>「{winningVendor?.name}」へ発注が確定しています</span>
            </div>
            <p className="text-sm text-blue-800">
              発注時提示額: <strong className="font-mono text-base font-extrabold">¥{initialPrice.toLocaleString()}</strong>（
              {initialQuote?.shippingPaidBy === 'vendor' ? '業者着払い負担' : '元払い'}）
            </p>
            <p className="text-xs text-blue-700 mt-1">
              現物を梱包して業者へ発送したら「現物を発送済みにする」を押してください。
            </p>
          </div>

          <div className="shrink-0">
            {!isShippingModalOpen ? (
              <button
                type="button"
                onClick={() => setIsShippingModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-5 h-5" />
                <span>現物を発送済みにする</span>
              </button>
            ) : (
              <form onSubmit={handleShipSubmit} className="bg-white p-3.5 rounded-xl border border-blue-300 shadow-sm space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  配送伝票・追跡番号:
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="例: ヤマト運輸 1234-5678-9012"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                  >
                    発送完了を記録
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShippingModalOpen(false)}
                    className="px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    戻る
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* STEP B: Case is shipped (Ready to record final assessment) OR isEditingForm */}
      {(status === 'shipped' || (isEditingForm && (status === 'finalized' || status === 'completed'))) && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-sm text-slate-800">
                現物配送中 / 業者検品中（追跡: {assessmentCase.trackingNumber || '集荷手配済'}）
              </span>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-md">
              現物到着後の確定金額を入力してください
            </span>
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Price comparison */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>事前査定提示額（発注時）:</span>
                  <span className="font-mono text-base font-extrabold text-slate-800">
                    ¥{initialPrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">
                    現物検品後の「確定買取金額」（円） <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">¥</span>
                    <input
                      type="text"
                      required
                      value={finalPriceInput}
                      onChange={(e) => setFinalPriceInput(e.target.value)}
                      placeholder="例: 1180000"
                      className="w-full pl-8 pr-3 py-2.5 text-xl font-mono font-black text-slate-900 border-2 border-indigo-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Quick price adjustment buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setFinalPriceInput(initialPrice.toString())}
                      className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-slate-300"
                    >
                      同額 (満額)
                    </button>
                    {[-10000, -30000, -50000, -100000, 10000, 30000].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => {
                          const base = parseInt(finalPriceInput.replace(/[^0-9]/g, ''), 10) || initialPrice;
                          setFinalPriceInput((base + delta).toString());
                        }}
                        className={`text-xs font-bold px-2 py-1 rounded border ${
                          delta < 0
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {delta > 0 ? `+${(delta / 10000).toLocaleString()}` : `${(delta / 10000).toLocaleString()}`}万円
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Variance Preview */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    liveVariance < 0
                      ? 'bg-rose-50/80 border-rose-300 text-rose-800'
                      : liveVariance > 0
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800'
                      : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {liveVariance < 0 ? (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    ) : liveVariance > 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-slate-600" />
                    )}
                    <span className="text-xs font-bold">
                      {liveVariance < 0 ? '減額誤差:' : liveVariance > 0 ? '増額調整:' : '誤差なし:'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-lg font-black block">
                      {liveVariance > 0 ? `+¥${liveVariance.toLocaleString()}` : liveVariance < 0 ? `-¥${Math.abs(liveVariance).toLocaleString()}` : '±0円'}
                    </span>
                    <span className="text-xs font-bold">
                      ({liveVariancePercent > 0 ? `+${liveVariancePercent}%` : `${liveVariancePercent}%`})
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Reason & Explanation */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    金額変動の主な理由（分類） <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    {VARIANCE_REASON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    具体的な減額理由・検品メモ（代表・顧客への説明用） <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="例: 写真では判別できなかったガラス12時位置に線傷あり。保証書の日付が申告より古かったため5万円減額など"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    検品・確認担当者
                  </label>
                  <input
                    type="text"
                    value={confirmedBy}
                    onChange={(e) => setConfirmedBy(e.target.value)}
                    placeholder="店舗代表 / 査定担当"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {isEditingForm && (
                <button
                  type="button"
                  onClick={() => setIsEditingForm(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>確定金額と誤差を登録する</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP C: Case is Finalized or Completed (Displaying High-Visibility Variance Breakdown) */}
      {(status === 'finalized' || status === 'completed') && finalAss && !isEditingForm && (
        <div className="space-y-4">
          {/* Main Variance Card */}
          <div
            className={`rounded-2xl p-5 border-2 shadow-sm ${
              finalAss.variance < 0
                ? 'bg-rose-50/70 border-rose-300'
                : finalAss.variance > 0
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-blue-50/70 border-blue-300'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Numbers breakdown */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-0.5">発注時の事前査定額</span>
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-700">
                    ¥{finalAss.initialPrice.toLocaleString()}
                  </span>
                </div>

                <div className="hidden sm:block text-slate-400 font-bold text-xl">
                  →
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-0.5">現物到着後の確定買取額</span>
                  <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
                    ¥{finalAss.finalPrice.toLocaleString()}
                  </span>
                </div>

                {/* THE HIGH-VISIBILITY VARIANCE BADGE */}
                <div className="sm:ml-4">
                  <span className="text-xs font-bold text-slate-500 block mb-0.5">事前査定との誤差</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-base sm:text-lg shadow-xs border ${
                      finalAss.variance < 0
                        ? 'bg-rose-600 text-white border-rose-700'
                        : finalAss.variance > 0
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-blue-600 text-white border-blue-700'
                    }`}
                  >
                    {finalAss.variance < 0 ? (
                      <>
                        <TrendingDown className="w-5 h-5" />
                        <span>-¥{Math.abs(finalAss.variance).toLocaleString()} ({finalAss.variancePercent}%)</span>
                      </>
                    ) : finalAss.variance > 0 ? (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        <span>+¥{finalAss.variance.toLocaleString()} (+{finalAss.variancePercent}%)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>±0円 (満額買取達成)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status badge & Re-edit button */}
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setIsEditingForm(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>確定金額を修正</span>
                </button>

                {status === 'finalized' && (
                  <button
                    type="button"
                    onClick={() => onCompleteCase(assessmentCase.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition"
                  >
                    取引完了（入金受取）にする
                  </button>
                )}
              </div>
            </div>

            {/* Reason details callout */}
            <div className="mt-4 pt-3.5 border-t border-slate-300/80 bg-white/80 p-3.5 rounded-xl space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-800">
                  【変動理由】
                </span>
                <span className="font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  {VARIANCE_REASON_OPTIONS.find((o) => o.value === finalAss.reasonCategory)?.label || finalAss.reasonCategory}
                </span>
                <span className="text-slate-400 text-xs ml-auto flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  確定日: {finalAss.finalizedAt}
                  {finalAss.confirmedBy && ` / 担当: ${finalAss.confirmedBy}`}
                </span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {finalAss.reasonText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
