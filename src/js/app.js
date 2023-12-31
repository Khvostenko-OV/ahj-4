import { storeColumn, restoreColumn } from "./storage";

const board = document.querySelector('.board');

let btnContainer;
let draggedCard;
let edittedCard;
let previousText = '';
let deltaX = 0;
let deltaY = 0;

function editCard(card) {
  edittedCard = card;
  if (card.firstChild) {
    previousText = card.firstChild.textContent;
  } else {
    previousText = ''
  }
  btnContainer = undefined;
  card.innerHTML = `
    <textarea class="input" rows="2" placeholder="Enter title..." >${previousText}</textarea>
    <button class="save_btn">Save</button><button class="cancel_btn">Cancel</button>
  `;
  const input = card.querySelector('.input');
  input.addEventListener('click', input.focus())
  input.focus();

  card.querySelector('.save_btn').addEventListener('click', () => {
    if (input.value) {
      card.innerHTML = input.value;
      storeColumn(edittedCard.parentElement)
    } else {
      edittedCard.remove();
    }
    edittedCard = undefined;
  });

  card.querySelector('.cancel_btn').addEventListener('click', () => {
    if (previousText) {
      card.innerHTML = previousText;
    } else {
      edittedCard.remove();
    }
    edittedCard = undefined;
  });
}

const closeBtn = document.createElement('div');
closeBtn.className = 'close';
closeBtn.textContent = '✕';
closeBtn.addEventListener('click', () => {
  const column = btnContainer.parentElement;
  btnContainer.remove();
  btnContainer = undefined;
  storeColumn(column);
});

const editBtn = document.createElement('div');
editBtn.className = 'edit';
editBtn.textContent = '✎';
editBtn.addEventListener('click', () => { 
  editCard(editBtn.parentElement);
});

const dummy = document.createElement('div');
dummy.className = 'dummy';

for (const column of board.children) {
  restoreColumn(column);
}

board.addEventListener('mouseover', (e) => {
  if (draggedCard || edittedCard) {
    return;
  }
  if (e.target.className === 'edit' || e.target.className === 'close') {
    return;
  }

  if (e.target.className === 'card') { 
    btnContainer = e.target;
    btnContainer.appendChild(editBtn); 
    btnContainer.appendChild(closeBtn); 
    return;
  }
  
  if (btnContainer) {
    btnContainer.removeChild(editBtn);
    btnContainer.removeChild(closeBtn);
    btnContainer = undefined;
  }
});

board.addEventListener('mousedown', (e) => {
  if (e.target.className === 'card') {
    if (btnContainer) {
      btnContainer.removeChild(editBtn);
      btnContainer.removeChild(closeBtn);
      btnContainer = undefined;
    }
    draggedCard = e.target;
    const rect = draggedCard.getBoundingClientRect();
    deltaX = e.pageX - rect.x;
    deltaY = e.pageY - rect.y;
    draggedCard.style.width = `${draggedCard.offsetWidth}px`;
    dummy.style.height = `${draggedCard.offsetHeight}px`
    draggedCard.parentElement.insertBefore(dummy, draggedCard);
    draggedCard.className = 'card drag';
    draggedCard.style.left = `${e.pageX - deltaX}px`;
    draggedCard.style.top = `${e.pageY - deltaY}px`;
    storeColumn(draggedCard.parentElement);
  } 
});

board.addEventListener('mousemove', (e) => {
  e.preventDefault();
  if (!draggedCard) { 
    return;
  }

  draggedCard.style.left = `${e.pageX - deltaX}px`;
  draggedCard.style.top = `${e.pageY - deltaY}px`;

  const closest = document.elementFromPoint(e.clientX, e.clientY);
  switch (closest.className) {
    case 'dummy':
      break;
    case 'column_header':
      closest.parentElement.insertBefore(dummy, closest.nextElementSibling);
      break;
    case 'add_card':
      closest.parentElement.insertBefore(dummy, closest);
      break;
    case 'card':
      if (e.pageY < closest.getBoundingClientRect().y + closest.offsetHeight / 2) {
        closest.parentElement.insertBefore(dummy, closest);
      } else {
        closest.parentElement.insertBefore(dummy, closest.nextElementSibling);
      }
      break;
    default:
      break;
  }
});

window.addEventListener('mouseup', () => {
  if (draggedCard) {
    draggedCard.className = 'card';
    draggedCard.style.left = '0';
    draggedCard.style.top = '0';
    dummy.parentElement.insertBefore(draggedCard, dummy);
    dummy.parentElement.removeChild(dummy);
    storeColumn(draggedCard.parentElement)
    draggedCard = undefined;
  }
});

board.addEventListener('click', (e) => {
  if (!edittedCard && e.target.className === 'add_card') { 
    const newCard = document.createElement('div');
    newCard.className = 'card';
    e.target.parentElement.insertBefore(newCard, e.target);
    editCard(newCard);
  }
});
