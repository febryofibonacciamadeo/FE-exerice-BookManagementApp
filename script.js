const books = [];
const RENDER_EVENT = 'render-book';
const SAVE_EVENT = 'save-book';
const STORAGE_KEY = 'BOOK_MANAGEMENT';

function isStorageExists() {
    if(typeof(Storage) === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVE_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        insertBook();
    });
    if(isStorageExists()) {
        fetchDataFromStorage();
    }
});

function fetchDataFromStorage() {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);

    if(data !== null) {
        for(const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function saveData() {
    if(isStorageExists()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVE_EVENT));
    }
}

function insertBook() {
    const id = generateId();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = parseInt(document.getElementById('year').value, 10);
    const isComplete = false;
    const bookObjectData = generateBookObject(id, title, author, year, isComplete);
    books.push(bookObjectData);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for(const bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findBookIndex(bookId) {
    for(const index in books) {
        if(books[index].id === bookId) {
            return index;
        }
    }
    bookId

    return -1;
}

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);
    
    if(bookTarget === null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget === null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;
   
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeProgressRead(bookObjectData) {
    const txtTitle = document.createElement('h2');
    txtTitle.innerText = bookObjectData.title;
    const txtAuthor = document.createElement('p');
    txtAuthor.innerText = bookObjectData.author;
    const txtYear = document.createElement('p');
    txtYear.innerText = bookObjectData.year;

    const txtContainer = document.createElement('div');
    txtContainer.classList.add('inner');
    txtContainer.append(txtTitle, txtAuthor, txtYear);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(txtContainer);
    container.setAttribute('id', `book-${bookObjectData.id}`);

    if(bookObjectData.isComplete) {
        const undoBtn = document.createElement('button');
        undoBtn.classList.add('undo-button');

        undoBtn.addEventListener('click', function() {
            undoBookFromCompleted(bookObjectData.id);
        });

        const trashBtn = document.createElement('button');
        trashBtn.classList.add('trash-button');

        trashBtn.addEventListener('click', function() {
            removeBookFromCompleted(bookObjectData.id);
        });

        container.append(undoBtn, trashBtn);
    } else {
        const checkBtn = document.createElement('button');
        checkBtn.classList.add('check-button');

        checkBtn.addEventListener('click', function() {
            addBookToComplete(bookObjectData.id);
        });

        container.append(checkBtn);
    }

    return container;
}

document.addEventListener(RENDER_EVENT, function() {
    const isProgressRead = document.getElementById('isProgress');
    isProgressRead.innerHTML = '';
    const isCompleteRead = document.getElementById('isComplete');
    isCompleteRead.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeProgressRead(bookItem);
        if(!bookItem.isComplete) {
            isProgressRead.append(bookElement);
        } else {
            isCompleteRead.append(bookElement);
        }
    }
});
