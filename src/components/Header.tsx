import React from 'react';
import { RefreshCw, ExternalLink, Smartphone, LayoutDashboard, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'vendor-preview';
  onViewChange: (view: 'dashboard' | 'vendor-preview') => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onResetData,
}) => {
  const handleOpenVendorPreviewInNewTab = () => {
    // Open vendor preview in a new tab
    const url = new URL(window.location.href);
    url.pathname = '/vendor-preview';
    url.searchParams.set('view', 'vendor-preview');
    window.open(url.toString(), '_blank');
  };

  const handleResetConfirm = () => {
    if (window.confirm('初期テストデータ（25件の案件と5社の業者データ）にリセットしますか？\n入力したデータは初期状態に戻ります。')) {
      onResetData();
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  買取相見積もり管理システム
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  LINE連携版
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                複数専門業者への一括LINE査定・リアルタイム相見積もり比較・発注決定
              </p>
            </div>
          </div>

          {/* Navigation View Switcher (Dashboard vs Vendor Preview) */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>管理ダッシュボード</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('vendor-preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm sm:text-base transition-all ${
                currentView === 'vendor-preview'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span>業者LINEプレビュー</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenVendorPreviewInNewTab}
              title="別タブで業者側のスマートフォンLINE画面を開きます"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-sm sm:text-base font-bold shadow-sm transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-100" />
              <span className="hidden md:inline">【業者視点】</span>LINEプレビューを別タブで開く
            </button>

            <button
              type="button"
              onClick={handleResetConfirm}
              title="初期モックデータ（25件）を再読み込み"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">テストデータ</span>初期化
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
