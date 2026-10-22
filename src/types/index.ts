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

// 案件ステータス
export type CaseStatus = 'draft' | 'requesting' | 'assessed' | 'ordered' | 'completed';

export const CASE_STATUS_LABELS: Record<CaseStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: '下書き', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' },
  requesting: { label: '査定依頼中', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300' },
  assessed: { label: '回答完了(選定待ち)', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  ordered: { label: '発注・成約済み', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300' },
  completed: { label: '取引完了', color: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-300' },
};

// 査定回答ステータス
export type QuoteStatus = 'not_sent' | 'pending' | 'quoted' | 'declined';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, { label: string; badgeClass: string }> = {
  not_sent: { label: '未送信', badgeClass: 'bg-slate-100 text-slate-600 border-slate-300' },
  pending: { label: '査定依頼中(回答待ち)', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse' },
  quoted: { label: '回答済み', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
  declined: { label: '辞退', badgeClass: 'bg-rose-100 text-rose-700 border-rose-300' },
};

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
}
