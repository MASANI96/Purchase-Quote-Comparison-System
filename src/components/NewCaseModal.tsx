import React, { useState } from 'react';
import { ItemCategory, AssessmentCase, CATEGORY_LABELS } from '../types';
import { X, Plus, Sparkles, Image as ImageIcon, Check } from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (caseData: any) => void;
}

const SAMPLE_PRESETS = [
  {
    name: '高級時計（ロレックス GMTマスターII）',
    category: 'watch' as ItemCategory,
    title: 'ロレックス GMTマスターII ジュビリーブレス (ペプシ)',
    modelNumber: '126710BLRO',
    conditionRank: 'S' as const,
    accessories: ['内箱', '外箱', 'ギャランティカード(2024)', '冊子', 'フルコマ'],
    targetPrice: 2850000,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    notes: '2024年正規店購入。シール剥がしのみの未使用保管品。即決希望。',
  },
  {
    name: 'ブランドバッグ（エルメス ケリー28）',
    category: 'bag' as ItemCategory,
    title: 'エルメス ケリー 28 内縫い トゴ ノワール (ブラック) シルバー金具',
    modelNumber: 'W刻印 (2024年)',
    conditionRank: 'S' as const,
    accessories: ['保存袋', 'ショルダーストラップ', 'カデナ・鍵・クロシェット', '箱', 'レシート原本'],
    targetPrice: 2700000,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    notes: 'ノワール×シルバー金具の内縫い。金具保護シール付き。',
  },
  {
    name: '貴金属（K18 喜平ブレスレット 30g）',
    category: 'jewelry' as ItemCategory,
    title: 'K18 喜平 8面トリプル ブレスレット 30.5g 20cm',
    modelNumber: '造幣局検定マーク刻印あり',
    conditionRank: 'A' as const,
    accessories: ['ジュエリーケース'],
    targetPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    notes: '金具噛み合わせ良好。目立つ変形なし。',
  },
  {
    name: 'カメラ（Leica Q3）',
    category: 'camera' as ItemCategory,
    title: 'Leica Q3 フルサイズコンパクトデジタルカメラ',
    modelNumber: 'Summilux 28mm F1.7 ASPH.',
    conditionRank: 'A' as const,
    accessories: ['元箱', '純正レンズフード', 'バッテリー2個', '充電器'],
    targetPrice: 780000,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    notes: '傷なし極美品。ショット数約900回。',
  },
];

const CATEGORY_IMAGES: Record<ItemCategory, string> = {
  watch: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  bag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  antique: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  other: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80',
};

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onAddCase,
}) => {
  const [category, setCategory] = useState<ItemCategory>('watch');
  const [title, setTitle] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [conditionRank, setConditionRank] = useState<'S' | 'A' | 'B' | 'C' | 'D'>('A');
  const [accessoriesInput, setAccessoriesInput] = useState('箱, 保証書');
  const [targetPrice, setTargetPrice] = useState<string>('1500000');
  const [imageUrl, setImageUrl] = useState(CATEGORY_IMAGES.watch);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setModelNumber(preset.modelNumber);
    setConditionRank(preset.conditionRank);
    setAccessoriesInput(preset.accessories.join(', '));
    setTargetPrice(preset.targetPrice.toString());
    setImageUrl(preset.imageUrl);
    setNotes(preset.notes);
  };

  const handleCategoryChange = (newCat: ItemCategory) => {
    setCategory(newCat);
    // If the image was default, update to new category's default
    setImageUrl(CATEGORY_IMAGES[newCat]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('商品名を入力してください。');
      return;
    }

    const accessoriesArray = accessoriesInput
      .split(/[,、]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const priceNum = targetPrice ? parseInt(targetPrice.replace(/[^0-9]/g, ''), 10) : undefined;

    onAddCase({
      category,
      title: title.trim(),
      modelNumber: modelNumber.trim() || undefined,
      conditionRank,
      accessories: accessoriesArray,
      targetPrice: priceNum || undefined,
      imageUrl: imageUrl.trim() || CATEGORY_IMAGES[category],
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold">新規査定案件の登録</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="bg-blue-50/70 p-4 border-b border-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>テスト用サンプル入力（ワンクリックで自動入力）:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs bg-white hover:bg-blue-100 text-blue-800 font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-2xs transition"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              商材カテゴリ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-2 px-3 rounded-xl text-sm font-bold border transition text-center ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              商品名・ブランド <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ロレックス サブマリーナー デイト"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Model number & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                型番 / シリアル番号
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="例: 126610LN"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                コンディションランク
              </label>
              <div className="flex gap-2">
                {(['S', 'A', 'B', 'C', 'D'] as const).map((rank) => (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => setConditionRank(rank)}
                    className={`flex-1 py-2 font-black rounded-lg border text-sm transition ${
                      conditionRank === rank
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Price & Accessories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                顧客希望買取価格 (円)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
                <input
                  type="text"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="例: 1800000"
                  className="w-full pl-8 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-base font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                付属品 (カンマ区切り)
              </label>
              <input
                type="text"
                value={accessoriesInput}
                onChange={(e) => setAccessoriesInput(e.target.value)}
                placeholder="例: 内箱, 保証書, コマ2個"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL with preview */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              商品画像URL (Web上の画像URLまたは自動設定)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="w-12 h-12 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={imageUrl}
                  alt="プレビュー"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              商品の状態・顧客備考
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例: ガラス・文字盤傷なし。バックルに微小スレあり。即日決済希望。"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>案件を登録する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
