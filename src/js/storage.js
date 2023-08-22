export function storeColumn(column) {
  let i = 0;
  for (const card of column.children) {
    if (card.className === 'card') {
      localStorage.setItem(`card-${column.dataset.id}-${i++}`, card.firstChild.textContent)
    }
  }
  localStorage.setItem(`column-${column.dataset.id}`, i);
}

export function restoreColumn(column) {
  const num = Number(localStorage.getItem(`column-${column.dataset.id}`) || 0);
  for (let i = 0; i < num; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = localStorage.getItem(`card-${column.dataset.id}-${i}`) || '';
    column.insertBefore(card, column.lastChild);
  }
}
