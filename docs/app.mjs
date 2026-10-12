import { createLots, filterLots, placeDemoBid } from './demo-model.mjs';
const $ = id => document.getElementById(id);
const money = amount => `HK$${new Intl.NumberFormat('en-HK').format(amount)}`;
let lots = createLots();
let selected = lots[0].id;
let category = 'all';
const imageFor = lot => `assets/${lot.category}.svg`;

function renderList() {
  const visible = filterLots(lots, category, $('search').value);
  $('result-count').textContent = `${visible.length} 件示範拍品`;
  const fragment = document.createDocumentFragment();
  if (!visible.length) {
    const empty = document.createElement('p'); empty.className = 'empty-state';
    empty.textContent = '未找到示範拍品。試試其他關鍵字或分類。'; fragment.append(empty);
  }
  for (const lot of visible) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'lot-button'; button.dataset.lot = lot.id;
    button.setAttribute('aria-pressed', String(lot.id === selected));
    const img = document.createElement('img'); img.src = imageFor(lot); img.alt = ''; img.width = 105; img.height = 105;
    const copy = document.createElement('span');
    const kind = document.createElement('span'); kind.className = 'lot-category'; kind.textContent = `${lot.kind}・示範`;
    const title = document.createElement('span'); title.className = 'lot-title'; title.textContent = lot.title;
    const price = document.createElement('span'); price.className = 'lot-price'; price.textContent = money(lot.amount);
    const label = document.createElement('small'); label.textContent = '示範目前價格'; price.append(label);
    copy.append(kind, title, price); button.append(img, copy);
    button.addEventListener('click', () => { selected = lot.id; renderList(); renderDetail(); $('bid-amount').focus({ preventScroll: true }); });
    fragment.append(button);
  }
  $('lot-list').replaceChildren(fragment);
}
function renderDetail() {
  const lot = lots.find(item => item.id === selected);
  const image = document.createElement('img'); image.src = imageFor(lot); image.alt = ''; image.width = 205; image.height = 205;
  $('detail-art').replaceChildren(image);
  $('selected-category').textContent = `${lot.kind}・合成示範拍品`;
  $('selected-title').textContent = lot.title;
  $('selected-description').textContent = lot.description;
  $('current-price').textContent = money(lot.amount);
  $('bid-count').textContent = `${lot.bids} 次示範出價`;
  $('bid-amount').min = String(lot.amount + lot.step);
  $('bid-amount').max = '10000000';
  $('bid-amount').value = String(lot.amount + lot.step);
  $('bid-amount').removeAttribute('aria-invalid');
  $('bid-hint').textContent = `最低示範出價 ${money(lot.amount + lot.step)}，每次至少增加 ${money(lot.step)}。`;
  $('bid-feedback').textContent = ''; $('bid-feedback').dataset.error = 'false';
}
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const visible = filterLots(lots, category, $('search').value);
  if (visible.length && !visible.some(item => item.id === selected)) selected = visible[0].id;
  renderList(); renderDetail();
}));
$('search').addEventListener('input', () => {
  const visible = filterLots(lots, category, $('search').value);
  if (visible.length && !visible.some(item => item.id === selected)) { selected = visible[0].id; renderDetail(); }
  renderList();
});
$('bid-form').addEventListener('submit', event => {
  event.preventDefault();
  const result = placeDemoBid(lots, selected, $('bid-amount').value);
  if (!result.ok) {
    $('bid-amount').setAttribute('aria-invalid', 'true');
    $('bid-feedback').dataset.error = 'true';
    $('bid-feedback').textContent = result.reason === 'below' ? `請輸入至少 ${money(result.minimum)}。未提交示範出價。` : '請輸入 1 至 10,000,000 之間的整數金額。未提交示範出價。';
    return;
  }
  renderList(); renderDetail();
  $('bid-feedback').textContent = `示範出價 ${money(result.amount)} 已更新。這不是實際競投，無需付款。`;
});
$('reset-demo').addEventListener('click', () => {
  lots = createLots(); selected = lots[0].id; category = 'all'; $('search').value = '';
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === 'all')));
  renderList(); renderDetail(); $('bid-feedback').textContent = '示範已重設，所有出價紀錄已清除。';
});
renderList(); renderDetail();
