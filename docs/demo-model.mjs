const seeds = [
  { id: 'orbit', category: 'models', kind: '模型', title: '軌道探測模型', description: '虛構的藍色探測器模型，用來示範拍品資料及競投流程。', amount: 120, step: 10 },
  { id: 'cloud', category: 'toys', kind: '潮玩', title: '雲端小夥伴', description: '原創幾何潮玩示意，所有外觀、價格與拍品資料均屬示範。', amount: 80, step: 5 },
  { id: 'prism', category: 'cards', kind: '卡牌', title: '稜鏡收藏卡', description: '原創幾何圖案卡牌，展示卡牌收藏的拍品選擇與出價互動。', amount: 200, step: 20 },
];
export function createLots() { return seeds.map(lot => ({ ...lot, bids: 0 })); }
export function filterLots(lots, category, search) {
  const term = String(search).trim().toLocaleLowerCase();
  return lots.filter(lot => (category === 'all' || lot.category === category) && `${lot.title} ${lot.kind} ${lot.description}`.toLocaleLowerCase().includes(term));
}
export function placeDemoBid(lots, id, input) {
  const lot = lots.find(item => item.id === id);
  if (!lot) return { ok: false, reason: 'missing' };
  const amount = typeof input === 'string' && !input.trim() ? NaN : Number(input);
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10000000) return { ok: false, reason: 'invalid' };
  const minimum = lot.amount + lot.step;
  if (amount < minimum) return { ok: false, reason: 'below', minimum };
  lot.amount = amount;
  lot.bids += 1;
  return { ok: true, amount };
}
