let columns = [];
columns[0] = document.getElementsByClassName('card-column')[0];
columns[1] = document.getElementsByClassName('card-column')[1];
columns[2] = document.getElementsByClassName('card-column')[2];
let newCardButton = document.getElementById('create-card');
let phrases;
let translateCardTimer;
let isEditorOn = false;
let colors = {
    0: '#00FFFF',
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#7FFFD4',
}

loadPhrases();

function loadPhrases() {
    loadJSON((response) => {
        phrases = JSON.parse(response);
        randomizeCards();
        putCardsInOrder();
        createCardButton();
    });
}

//Randomize three first elements in firts column, then randomize remaning elements.
function randomizeCards() {
    let phrasesBuff = phrases.slice();
    let leftCards = 20;
    let counter = 3;
    for (let i = 0; i <= leftCards;) {
        let rndCard = getRandomInteger(0, leftCards);
        if (counter == 0) {
            let rndColumn;
            if (columns[0].childNodes.length - 1 < 5) {
                rndColumn = getRandomInteger(0, 2);
            } else {
                rndColumn = getRandomInteger(1, 2); 
            }
            console.log('Column: ', rndColumn, ' Card: ', rndCard, ' LeftCards: ', leftCards);
            createCard(rndColumn, phrasesBuff[rndCard].theme, phrasesBuff[rndCard].sourceText, rndCard);
        } else {
            console.log('Column: ', 0, ' Card: ', rndCard, ' LeftCards: ', leftCards);
            createCard(0, phrasesBuff[rndCard].theme, phrasesBuff[rndCard].sourceText, rndCard);
            counter--;
        }
        phrasesBuff.splice(rndCard, 1);
        leftCards--;
    }
}

function createCard(position, phraseTitle, phraseText, cardNumber) {
    let itemView = `<div class="card disable-selection">
            <div class="card-title">
                ${phraseTitle}
            </div>
            <div>
                ${phraseText}
            </div>
            <input type="hidden" value="${cardNumber}">
            <input type="hidden" value="false">
            <img src="img/edit-icon.png" class="edit-icon">
        </div>`;
    let item = document.createElement('div');
    item.classList = 'item';
    item.innerHTML = itemView;
    let cardElement = columns[position].appendChild(item);
    radnomColor = colors[getRandomInteger(0, 3)];
    cardElement.style.backgroundColor = radnomColor;
    createCardListeners(cardElement);
}

function putCardsInOrder() {
    for (let i = 0; i < 3; i++) {
        let toSort = columns[i].children;
        toSort = Array.prototype.slice.call(toSort, 0);
        toSort.sort((a, b) => {
            a = countWords(a.childNodes[0].childNodes[3].innerText);
            b = countWords(b.childNodes[0].childNodes[3].innerText);
            return b - a;
        });
        columns[i].innerHTML = '';
        for (let j = 0; j < toSort.length; j++) {
            columns[i].appendChild(toSort[j]);
        }
    }
}

function createCardListeners(element) {
    element.addEventListener('click', () => {
        if (isEditorOn)
            return;
        let cardNumber = element.childNodes[0].childNodes[5].value;
        let isTranslatePressed = element.childNodes[0].childNodes[7];
        let textOfSelectedCard = element.childNodes[0].childNodes[3];
        if (isTranslatePressed.value == 'true') {
            clearTimeout(translateCardTimer);
            translateBack(cardNumber, textOfSelectedCard);
            isTranslatePressed.value = false;
        } else {
            translateCard(cardNumber, textOfSelectedCard);
            isTranslatePressed.value = true;
        }
        //console.log(child.childNodes[0].childNodes[5].value);
    });
    element.addEventListener('dblclick', () => {
        if (!isEditorOn)
            element.remove();
    });
    element.childNodes[0].childNodes[9].addEventListener('click', () => {
        if (!isEditorOn)
            editCard(element.childNodes[0]);
    });
}

function translateCard(cardNumber, textOfSelectedCard) {
    textOfSelectedCard.innerHTML = phrases[cardNumber].translation;
    translateCardTimer = setTimeout(() => {
        translateBack(cardNumber, textOfSelectedCard);
    }, 5000);
}

function translateBack(cardNumber, textOfSelectedCard) {
    textOfSelectedCard.innerHTML = phrases[cardNumber].sourceText;
}

function loadJSON(callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'Phrases.json', true);
    xobj.onreadystatechange = () => {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

function getRandomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function editCard(elem) {
    isEditorOn = true;
    let cardNumber = elem.childNodes[5].value;
    let textEditorInput = document.createElement('input');
    setEditAttributes(textEditorInput, cardNumber, 'Text');
    let textEditorInputElement = elem.appendChild(textEditorInput);
    let translateEditorInput = document.createElement('input');
    setEditAttributes(translateEditorInput, cardNumber, 'Translate');
    let translateEditorInputElement = elem.appendChild(translateEditorInput);
    let textEditorButton = document.createElement('input');
    textEditorButton.setAttribute('type', 'button');
    textEditorButton.setAttribute('value', 'OK ');
    let textEditorButtonElement = elem.appendChild(textEditorButton);
    textEditorButtonElement.addEventListener('click', () => {
        elem.childNodes[3].innerText = textEditorInputElement.value;
        phrases[cardNumber].sourceText = textEditorInputElement.value;
        phrases[cardNumber].translation = translateEditorInputElement.value;
        textEditorInputElement.remove();
        textEditorButtonElement.remove();
        translateEditorInputElement.remove();
        setTimeout(() => {
            isEditorOn = false;
        }, 500);
    });
}

function setEditAttributes(input, cardNumber, placeholder) {
    input.setAttribute('type', 'text');
    input.setAttribute('value', phrases[cardNumber].sourceText);
    input.setAttribute('placeholder', placeholder);
    input.style.width = '95%';
}

function createCardButton() {
    newCardButton.innerHTML = '';

    let titleEditorInput = document.createElement('input');
    setCreateAttributes(titleEditorInput, 'Title');
    let titleEditorInputElement = newCardButton.appendChild(titleEditorInput);

    let textEditorInput = document.createElement('input');
    setCreateAttributes(textEditorInput, 'Text');
    let textEditorInputElement = newCardButton.appendChild(textEditorInput);

    let translateEditorInput = document.createElement('input');
    setCreateAttributes(translateEditorInput, 'Translate');
    let translateEditorInputElement = newCardButton.appendChild(translateEditorInput);

    let btn = document.createElement('input');
    btn.setAttribute('type', 'button');
    btn.setAttribute('value', 'Create new card');
    let btnElement = newCardButton.appendChild(btn);
    btnElement.addEventListener('click', () => {
        phrases.push({
            theme: titleEditorInputElement.value,
            sourceText: textEditorInputElement.value,
            translation: translateEditorInputElement.value
        });
        let rnd = getRandomInteger(0, 2);
        createCard(rnd, titleEditorInputElement.value, textEditorInputElement.value, phrases.length - 1);
        titleEditorInputElement.value = '';
        textEditorInputElement.value = '';
        translateEditorInputElement.value = '';
    });
}

function setCreateAttributes(input, placeholder) {
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', placeholder);
    input.classList = 'create-card-input-text';
}