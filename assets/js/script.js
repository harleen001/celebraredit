document.addEventListener('DOMContentLoaded', function () {
    // Declare the undo and redo stacks
    let undoStack = [];
    let redoStack = [];

    // Initialize the Swiper instance
    const swiper = new Swiper('.swiper', {
        loop: true,
        spaceBetween: 10,
        slidesPerView: 1,
        navigation: {
            nextEl: '.nav-button.right',
            prevEl: '.nav-button.left',
        },
        autoplay: false, // Disable automatic sliding
    });

    // Get all required DOM elements
    const textInput = document.getElementById('text-box-input');
    const languageSelect = document.getElementById('language-select');
    const fontTypeSelect = document.getElementById('fontType');
    const fontStyleSelect = document.getElementById('fontStyle');
    const fontSizeInput = document.getElementById('font-size');
    const fontColorInput = document.getElementById('font-color');
    const alignButton = document.querySelector('.text-customization button');
    const lineHeightButton = document.querySelector('.text-customization button:last-child');
    const undoButton = document.querySelector('.navbar .icon-button:nth-child(2)');
    const redoButton = document.querySelector('.navbar .icon-button:nth-child(3)');
    const addTextButton = document.querySelector('#addTextButton');

    // Helper Functions
    function saveStateForUndo() {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const textElements = activeSlide.querySelectorAll('.canvas-text');

        const textState = Array.from(textElements).map(element => ({
            text: element.textContent,
            font: {
                family: element.style.fontFamily,
                size: element.style.fontSize,
                color: element.style.color,
                style: element.style.fontStyle,
                align: element.style.textAlign,
                lineHeight: element.style.lineHeight,
            },
            position: {
                left: element.style.left,
                top: element.style.top,
            },
        }));

        undoStack.push(textState);
        if (undoStack.length > 10) undoStack.shift(); // Limit stack size to 10
        redoStack.length = 0; // Clear redo stack after a new action
    }

    function restoreState(state) {
        const activeSlide = swiper.slides[swiper.activeIndex];

        const textElements = activeSlide.querySelectorAll('.canvas-text');
        textElements.forEach(element => element.remove());

        state.forEach(st => {
            const newText = document.createElement('div');
            newText.textContent = st.text;
            newText.classList.add('canvas-text');
            newText.style.fontFamily = st.font.family;
            newText.style.fontSize = st.font.size;
            newText.style.color = st.font.color;
            newText.style.fontStyle = st.font.style;
            newText.style.textAlign = st.font.align;
            newText.style.lineHeight = st.font.lineHeight;
            newText.style.left = st.position.left;
            newText.style.top = st.position.top;

            activeSlide.appendChild(newText);
            makeTextDraggable(newText);
        });
    }

    function makeTextDraggable(textElement) {
        let isDragging = false;
        let offsetX, offsetY;

        textElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - textElement.getBoundingClientRect().left;
            offsetY = e.clientY - textElement.getBoundingClientRect().top;
            textElement.style.position = 'absolute';
            textElement.style.zIndex = 1000;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                textElement.style.left = `${e.clientX - offsetX}px`;
                textElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            saveStateForUndo();
        });
    }

    function addTextToCanvas(text) {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const newText = document.createElement('div');
        newText.textContent = text;
        newText.classList.add('canvas-text');
        newText.style.fontFamily = fontTypeSelect.value;
        newText.style.fontSize = `${fontSizeInput.value}px`;
        newText.style.color = fontColorInput.value;
        newText.style.fontStyle = fontStyleSelect.value;
        newText.style.textAlign = alignButton.classList.contains('active') ? 'center' : 'left';
        newText.style.position = 'absolute';
        newText.style.left = '50%';
        newText.style.top = '50%';
        activeSlide.appendChild(newText);

        makeTextDraggable(newText);
        saveStateForUndo();
    }

    // Event Listeners
    textInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = textInput.value.trim();
            if (text !== '') {
                addTextToCanvas(text);
                textInput.value = '';
            }
        }
    });

    languageSelect.addEventListener('change', function () {
        const placeholders = {
            english: 'Enter text here',
            french: 'Entrez le texte ici',
            spanish: 'Ingrese texto aquí',
            hindi: 'यहाँ टेक्स्ट दर्ज करें',
            punjabi: 'ਇਥੇ ਲਿਖਾਈ ਦਰਜ ਕਰੋ',
        };
        textInput.placeholder = placeholders[languageSelect.value] || 'Enter text here';
    });

    fontTypeSelect.addEventListener('change', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        activeSlide.querySelectorAll('.canvas-text').forEach(element => {
            element.style.fontFamily = fontTypeSelect.value;
        });
    });

    fontStyleSelect.addEventListener('change', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        activeSlide.querySelectorAll('.canvas-text').forEach(element => {
            element.style.fontStyle = fontStyleSelect.value;
        });
    });

    fontSizeInput.addEventListener('input', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        activeSlide.querySelectorAll('.canvas-text').forEach(element => {
            element.style.fontSize = `${fontSizeInput.value}px`;
        });
    });

    fontColorInput.addEventListener('input', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        activeSlide.querySelectorAll('.canvas-text').forEach(element => {
            element.style.color = fontColorInput.value;
        });
    });

    alignButton.addEventListener('click', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        activeSlide.querySelectorAll('.canvas-text').forEach(element => {
            element.style.textAlign = element.style.textAlign === 'center' ? 'left' : 'center';
        });
        alignButton.classList.toggle('active');
    });

    lineHeightButton.addEventListener('click', function () {
        const activeSlide = swiper.slides[swiper.activeIndex];
        activeSlide.querySelectorAll('.canvas-text').forEach(element => {
            element.style.lineHeight = element.style.lineHeight === '1.5' ? '1' : '1.5';
        });
    });

    undoButton.addEventListener('click', function () {
        if (undoStack.length > 0) {
            const stateToRestore = undoStack.pop();
            redoStack.push(stateToRestore);
            restoreState(stateToRestore);
        }
    });

    redoButton.addEventListener('click', function () {
        if (redoStack.length > 0) {
            const stateToRestore = redoStack.pop();
            undoStack.push(stateToRestore);
            restoreState(stateToRestore);
        }
    });

    addTextButton.addEventListener('click', function () {
        addTextToCanvas('New Text');
    });
});






