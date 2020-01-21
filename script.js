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
    let rndMsv = [];
    for (let i = 0; i < 3; i++) {
        let rndCard = getRandomInteger(0, 20);
        while (rndCard == rndMsv[0] || rndCard == rndMsv[1])
            rndCard = getRandomInteger(0, 20);
        createCard(0, phrases[rndCard].theme, phrases[rndCard].sourceText, rndCard);
        rndMsv[i] = rndCard;
    }
    for (let i = 0; i < 21; i++) {
        let rnd;
        if (i == rndMsv[0] || i == rndMsv[1] || i == rndMsv[2])
            continue;
        if (columns[0].childNodes.length - 1 < 5)
            rnd = getRandomInteger(0, 2);
        else
            rnd = getRandomInteger(1, 2);
        createCard(rnd, phrases[i].theme, phrases[i].sourceText, i);
    }
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

function createCard(position, phraseTitle, phraseText, number) {
    let itemView = `<div class="card disable-selection">
            <div class="card-title">
                ${phraseTitle}
            </div>
            <div>
                ${phraseText}
            </div>
            <input type="hidden" value="${number}">
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
    textEditorInput.setAttribute('type', 'text');
    textEditorInput.setAttribute('value', phrases[cardNumber].sourceText);
    textEditorInput.setAttribute('placeholder', 'Text');
    textEditorInput.style.width = '95%';
    let textEditorInputElement = elem.appendChild(textEditorInput);
    let translateEditorInput = document.createElement('input');
    translateEditorInput.setAttribute('type', 'text');
    translateEditorInput.setAttribute('value', phrases[cardNumber].translation);
    translateEditorInput.setAttribute('placeholder', 'Translate');
    translateEditorInput.style.width = '95%';
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

function createCardButton() {
    newCardButton.innerHTML = '';
    let titleEditorInput = document.createElement('input');
    titleEditorInput.setAttribute('type', 'text');
    titleEditorInput.setAttribute('placeholder', 'Title');
    titleEditorInput.classList = 'create-card-input-text';
    let titleEditorInputElement = newCardButton.appendChild(titleEditorInput);
    let textEditorInput = document.createElement('input');
    textEditorInput.setAttribute('type', 'text');
    textEditorInput.setAttribute('placeholder', 'Text');
    textEditorInput.classList = 'create-card-input-text';
    let textEditorInputElement = newCardButton.appendChild(textEditorInput);
    let translateEditorInput = document.createElement('input');
    translateEditorInput.setAttribute('type', 'text');
    translateEditorInput.setAttribute('placeholder', 'Translate');
    translateEditorInput.classList = 'create-card-input-text';
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