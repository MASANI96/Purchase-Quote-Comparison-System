import React, { useState, useEffect } from 'react';
import { AssessmentCase, Vendor, CATEGORY_LABELS } from '../types';
import {
  ChevronLeft,
  MoreVertical,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Truck,
  Calendar,
  XCircle,
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface LineSimulatorProps {
  cases: AssessmentCase[];
  vendors: Vendor[];
  initialVendorId?: string;
  initialCaseId?: string;
  onSubmitQuote: (
    caseId: string,
    vendorId: string,
    quoteData: {
      price: number;
      shippingPaidBy: 'vendor' | 'client';
      validUntil: string;
      conditions: string;
    }
  ) => void;
  onDeclineQuote: (caseId: string, vendorId: string, reason?: string) => void;
}

export const LineSimulator: React.FC<LineSimulatorProps> = ({
  cases,
  vendors,
  initialVendorId,
  initialCaseId,
  onSubmitQuote,
  onDeclineQuote,
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    initialVendorId || vendors[0]?.id || ''
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || cases[0]?.id || ''
  );

  // Sync if props change
  useEffect(() => {
    if (initialVendorId) setSelectedVendorId(initialVendorId);
  }, [initialVendorId]);

  useEffect(() => {
    if (initialCaseId) setSelectedCaseId(initialCaseId);
  }, [initialCaseId]);

  // Mode inside smartphone: 'chat' | 'form' | 'submitted'
  const [phoneScreen, setPhoneScreen] = useState<'chat' | 'form' | 'submitted'>('chat');

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const currentQuote = selectedCase?.quotes.find((q) => q.vendorId === selectedVendorId);

  // Form states
  const [price, setPrice] = useState<string>('');
  const [shippingPaidBy, setShippingPaidBy] = useState<'vendor' | 'client'>('vendor');
  const [validUntil, setValidUntil] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [isDeclining, setIsDeclining] = useState<boolean>(false);

  // Pre-fill form when case or vendor changes
  useEffect(() => {
    if (currentQuote && currentQuote.status === 'quoted') {
      setPrice(currentQuote.price?.toString() || '');
      setShippingPaidBy(currentQuote.shippingPaidBy || 'vendor');
      setValidUntil(currentQuote.validUntil || '');
      setConditions(currentQuote.conditions || '');
    } else {
      // Suggest realistic price based on targetPrice or reasonable estimate
      const basePrice = selectedCase?.targetPrice || 500000;
      // Slight variation
      const suggested = Math.round((basePrice * 1.05) / 10000) * 10000;
      setPrice(suggested.toString());
      setShippingPaidBy('vendor');

      // Default date: 14 days later
      const future = new Date();
      future.setDate(future.getDate() + 14);
      const yyyy = future.getFullYear();
      const mm = String(future.getMonth() + 1).padStart(2, '0');
      const dd = String(future.getDate()).padStart(2, '0');
      setValidUntil(`${yyyy}-${mm}-${dd}`);

      setConditions('ガラス・外装に目立つ傷がなく、付属品完備の場合の上限満額買取額となります。送料弊社着払い。');
    }
    setPhoneScreen('chat');
  }, [selectedCaseId, selectedVendorId]);

  const handleSubmitQuoteForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !selectedVendor) return;

    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);
    if (!numPrice || isNaN(numPrice)) {
      alert('有効な査定金額を入力してください。');
      return;
    }

    onSubmitQuote(selectedCase.id, selectedVendor.id, {
      price: numPrice,
      shippingPaidBy,
      validUntil: validUntil || '2026-11-15',
      conditions: conditions || '現物確認後の最終確定となります。',
    });

    setPhoneScreen('submitted');
  };

  const handleDecline = () => {
    if (!selectedCase || !selectedVendor) return;
    const reason = prompt('辞退理由を入力してください（例: 取扱ジャンル対象外、在庫過多）', '取扱ジャンル対象外のため見送り');
    if (reason !== null) {
      onDeclineQuote(selectedCase.id, selectedVendor.id, reason);
      setPhoneScreen('submitted');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 w-full">
      {/* Control Bar for Simulator */}
      <div className="w-full max-w-xl bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 mb-6">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold">業者側LINEトーク＆回答シミュレーター</h2>
          <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
            リアルタイム同期中
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Vendor selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ① 閲覧する業者アカウントを選択:
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.rank}ランク)
                </option>
              ))}
            </select>
          </div>

          {/* Case selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ② 対象の査定依頼案件を選択:
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer truncate"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 pt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>
            現在の業者ステータス:{' '}
            <strong
              className={`ml-1 font-bold ${
                currentQuote?.status === 'quoted'
                  ? 'text-emerald-400'
                  : currentQuote?.status === 'declined'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {currentQuote?.status === 'quoted'
                ? `回答済 (¥${currentQuote.price?.toLocaleString()})`
                : currentQuote?.status === 'declined'
                ? '辞退'
                : '査定回答待ち'}
            </strong>
          </span>
          <span className="text-slate-400 hidden sm:inline">※入力・送信すると管理画面側に即時反映されます</span>
        </div>
      </div>

      {/* Smartphone Mockup Frame */}
      <div className="relative w-full max-w-[400px] h-[780px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-8 ring-slate-900/50 flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-950 mr-2 border border-slate-800"></div>
          <div className="w-12 h-1.5 rounded-full bg-slate-800"></div>
        </div>

        {/* Screen Bezel inner container */}
        <div className="w-full h-full bg-[#8cabd9] rounded-[38px] overflow-hidden flex flex-col relative pt-7">
          {/* Smartphone Status Bar */}
          <div className="h-6 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 z-30 select-none">
            <span>12:30</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-slate-800 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-800 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* SCREEN CONTENT: Chat vs Web Form vs Submitted */}
          {phoneScreen === 'chat' && (
            <div className="flex flex-col h-full overflow-hidden bg-[#8cabd9]">
              {/* LINE Header */}
              <div className="bg-[#243548] text-white px-4 py-2.5 flex items-center justify-between shadow-xs z-20">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-5 h-5 text-white" />
                  <div>
                    <h3 className="font-bold text-sm tracking-tight leading-tight">
                      買取仲介コンシェルジュ
                    </h3>
                    <p className="text-[10px] text-emerald-400">LINE公式アカウント</p>
                  </div>
                </div>
                <MoreVertical className="w-5 h-5 text-slate-300" />
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs sm:text-sm">
                {/* Date separator */}
                <div className="text-center my-1">
                  <span className="bg-black/25 text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                    2026年10月21日(水)
                  </span>
                </div>

                {/* Message Bubble from Broker */}
                <div className="flex items-start gap-2 max-w-[90%]">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/40 flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-800 font-bold ml-1 block mb-0.5">
                      買取仲介本部
                    </span>

                    <div className="bg-white text-slate-900 p-3.5 rounded-2xl rounded-tl-xs shadow-md border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-900">
                        【相見積もり査定依頼】
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        いつもお世話になっております。<br />
                        {selectedVendor?.name} 様へ査定依頼が届きました。
                      </p>

                      {/* Product Preview in Bubble */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 space-y-1.5">
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-200 mb-2">
                          <img
                            src={selectedCase?.imageUrl}
                            alt={selectedCase?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          ■商品: {selectedCase?.title}
                        </div>
                        {selectedCase?.modelNumber && (
                          <div className="text-xs text-slate-600">
                            ■型番: {selectedCase.modelNumber}
                          </div>
                        )}
                        <div className="text-xs text-slate-600">
                          ■状態ランク: <strong className="text-amber-600">{selectedCase?.conditionRank}ランク</strong>
                        </div>
                        {selectedCase?.accessories.length > 0 && (
                          <div className="text-xs text-slate-600">
                            ■付属品: {selectedCase.accessories.join(' / ')}
                          </div>
                        )}
                        {selectedCase?.notes && (
                          <div className="text-xs text-slate-600">
                            ■備考: {selectedCase.notes}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 pt-1">
                        以下のボタンより査定金額・買取条件のご入力をお願いいたします。
                      </p>

                      {/* LINE Rich Button */}
                      <button
                        type="button"
                        onClick={() => setPhoneScreen('form')}
                        className="w-full mt-2 py-3 px-4 bg-[#06C755] hover:bg-[#05b04c] text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>査定回答フォームを開く</span>
                      </button>

                      {currentQuote?.status === 'quoted' && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center font-bold">
                          ✓ 現在の回答額: ¥{currentQuote.price?.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-700 ml-1 mt-1 block">
                      12:31 既読
                    </span>
                  </div>
                </div>
              </div>

              {/* LINE Bottom Input Simulation */}
              <div className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full px-3.5 py-1.5 text-xs text-slate-400">
                  メッセージを入力...
                </div>
                <button
                  type="button"
                  onClick={() => setPhoneScreen('form')}
                  className="bg-[#06C755] text-white p-2 rounded-full"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN CONTENT: Web Form in In-App Browser */}
          {phoneScreen === 'form' && (
            <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
              {/* In-App Browser Header */}
              <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPhoneScreen('chat')}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>LINEに戻る</span>
                </button>
                <span className="text-xs font-bold text-slate-800">査定回答フォーム</span>
                <div className="w-12"></div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Vendor Identity Badge */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">
                    回答業者: {selectedVendor?.name}
                  </span>
                </div>

                {/* Case Summary Pill */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {selectedCase?.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    状態: {selectedCase?.conditionRank}ランク / 希望: ¥{selectedCase?.targetPrice?.toLocaleString() || '-'}
                  </p>
                </div>

                <form onSubmit={handleSubmitQuoteForm} className="space-y-3">
                  {/* Price Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      査定提示金額（円） <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">¥</span>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="例: 2050000"
                        className="w-full pl-7 pr-3 py-2 text-lg font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                      />
                    </div>
                    {/* Quick Amount Buttons */}
                    <div className="flex gap-1.5 mt-1.5">
                      {[10000, 50000, 100000].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => {
                            const cur = parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
                            setPrice((cur + delta).toString());
                          }}
                          className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded"
                        >
                          +{(delta / 10000).toLocaleString()}万円
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipping option */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      送料の負担区分
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShippingPaidBy('vendor')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition ${
                          shippingPaidBy === 'vendor'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        業者負担 (着払い)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShippingPaidBy('client')}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition ${
                          shippingPaidBy === 'client'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        依頼元負担 (元払い)
                      </button>
                    </div>
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      見積有効期限
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                    />
                  </div>

                  {/* Conditions & Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      減額条件・バイヤー備考
                    </label>
                    <textarea
                      rows={3}
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="例: ガラス傷なし・保証書完備が条件です。即日振込対応可。"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#06C755] focus:outline-none"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#06C755] hover:bg-[#05b04c] text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>査定結果を回答する</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDecline}
                      className="w-full py-2 bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold rounded-xl transition"
                    >
                      今回は査定を辞退する
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SCREEN CONTENT: Submitted confirmation */}
          {phoneScreen === 'submitted' && (
            <div className="flex flex-col h-full bg-white p-6 items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                査定回答を送信しました！
              </h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                仲介業者側のダッシュボードへリアルタイムに相見積もり結果が同期されました。
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full text-left text-xs space-y-1.5 mb-6">
                <div>
                  業者: <strong>{selectedVendor?.name}</strong>
                </div>
                <div>
                  案件: <strong>{selectedCase?.title}</strong>
                </div>
                {price && (
                  <div>
                    提示金額: <strong className="text-emerald-700 font-mono text-sm">¥{parseInt(price.replace(/[^0-9]/g, '') || '0', 10).toLocaleString()}</strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPhoneScreen('chat')}
                className="w-full py-3 bg-[#06C755] text-white text-sm font-bold rounded-xl shadow-md"
              >
                LINEトーク画面に戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
