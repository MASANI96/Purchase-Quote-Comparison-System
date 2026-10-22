// 商材カテゴリ
export type ItemCategory = 'watch' | 'bag' | 'jewelry' | 'camera' | 'antique' | 'other';

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  watch: '高級時計',
  bag: 'ブランドバッグ',
  jewelry: '貴金属・ジュエリー',
  camera: 'カメラ・光学機器',
  antique: '骨董・美術品',
  other: 'その他・ホビー',
};

// 案件ステータス (発送済み → 現物査定完了（確定）の流れを追加)
export type CaseStatus =
  | 'draft'
  | 'requesting'
  | 'assessed'
  | 'ordered'
  | 'shipped'
  | 'finalized'
  | 'completed';

export const CASE_STATUS_LABELS: Record<
  CaseStatus,
  { label: string; color: string; bg: string; border: string; stepNumber: number }
> = {
  draft: { label: '下書き', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', stepNumber: 0 },
  requesting: { label: '査定依頼中', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300', stepNumber: 1 },
  assessed: { label: '回答完了(選定待ち)', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300', stepNumber: 2 },
  ordered: { label: '発注・成約済み', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300', stepNumber: 3 },
  shipped: { label: '現物発送済み', color: 'text-indigo-800', bg: 'bg-indigo-100', border: 'border-indigo-300', stepNumber: 4 },
  finalized: { label: '現物査定完了(確定)', color: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-300', stepNumber: 5 },
  completed: { label: '取引完了(入金済)', color: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-300', stepNumber: 6 },
};

// 査定回答ステータス
export type QuoteStatus = 'not_sent' | 'pending' | 'quoted' | 'declined';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, { label: string; badgeClass: string }> = {
  not_sent: { label: '未送信', badgeClass: 'bg-slate-100 text-slate-600 border-slate-300' },
  pending: { label: '査定依頼中(回答待ち)', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse' },
  quoted: { label: '回答済み', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
  declined: { label: '辞退', badgeClass: 'bg-rose-100 text-rose-700 border-rose-300' },
};

// 現物到着後の確定査定情報（差異・誤差チェック）
export interface FinalAssessment {
  initialPrice: number; // 発注時の事前査定額 (円)
  finalPrice: number; // 現物検品後の確定買取額 (円)
  variance: number; // 差額: finalPrice - initialPrice (例: -10000)
  variancePercent: number; // 誤差率 (%)
  reasonCategory: 'as_quoted' | 'flaw_damage' | 'missing_items' | 'condition_better' | 'market_change' | 'other';
  reasonText: string; // 減額理由・増額理由などの詳細テキスト
  finalizedAt: string; // 確定日時 (YYYY-MM-DD HH:mm)
  confirmedBy?: string; // 担当者・鑑定士
}

export const VARIANCE_REASON_OPTIONS = [
  { value: 'as_quoted', label: '事前査定どおり満額（傷なし・付属品完備）' },
  { value: 'flaw_damage', label: '傷・打痕・摩耗・動作不良による減額' },
  { value: 'missing_items', label: '保証書・コマ・箱など付属品欠品による減額' },
  { value: 'condition_better', label: '想定以上の極上品・相場高騰による増額' },
  { value: 'market_change', label: '現物確認時の市場相場変動' },
  { value: 'other', label: 'その他理由（詳細入力）' },
];

// 業者情報
export interface Vendor {
  id: string;
  name: string;
  rank: 'S' | 'A' | 'B';
  specialty: ItemCategory[];
  lineAccountName: string;
  contactPerson?: string;
  speedRating?: string;
  avatarUrl?: string;
}

// 業者ごとの査定回答
export interface Quote {
  vendorId: string;
  status: QuoteStatus;
  price?: number;
  shippingPaidBy?: 'vendor' | 'client';
  validUntil?: string; // YYYY-MM-DD
  conditions?: string;
  updatedAt?: string;
}

// 案件データ
export interface AssessmentCase {
  id: string;
  caseNumber: string; // 例: CASE-2026-001
  category: ItemCategory;
  title: string; // 例: ロレックス サブマリーナー 126610LN
  modelNumber?: string;
  conditionRank: 'S' | 'A' | 'B' | 'C' | 'D';
  accessories: string[]; // ['箱', '保証書', 'コマ']
  targetPrice?: number;
  imageUrl: string;
  notes?: string;
  status: CaseStatus;
  createdAt: string;
  quotes: Quote[];
  selectedVendorId?: string;
  // 現物発送＆確定査定関連情報
  shippedAt?: string;
  trackingNumber?: string;
  finalAssessment?: FinalAssessment;
}
