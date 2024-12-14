const openAIKey = "c2stcHJvai1OUG9oUWxRQTZodmU0WnJvX3R1ZWk5eHFRaV92Z0N6d3NrREE3Yk9CNkNWM0lUaXZpNHVfbFo1NllPVDNCbGJrRkowdTR4amU4MVNmNFFBR1JkQkc5NXIxRGNXSFctbzBvbFhUV3lRNFNRVXh5SlFDaUVDeWZESGVzYmNB";
const apiEndpoint = "https://api.openai.com/v1/completions";

const gameContainer = document.getElementById("gameContainer");
const wordContainer = document.getElementById("wordContainer");
const hintDisplay = document.getElementById("hint");
const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const newGameBtn = document.getElementById("newGameBtn");
const exitBtn = document.getElementById("exitBtn");
const resultDisplay = document.getElementById("result");
const remainingAttemptsDisplay = document.getElementById("remainingAttempts");
const navigateContainer = document.getElementById("navigateContainer");
let randomWord = '';
let attempts = 5;


// Function to get a random word from OpenAI - can improve/add difficulty level that will be based on the prompt for AI
async function getRandomWord() {
    try {
        const payload = {
            model: "gpt-3.5-turbo-instruct",
            prompt: "Generate a random word",
            max_tokens: 5
        }

        const request = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${atob(openAIKey)}`,
            },
            body: JSON.stringify(payload)
        });

        const response = await request.json();

        return response.choices[0].text.replace(/\n/g, '').trim().toUpperCase();
    } catch (error) {
        console.log("Error: ", error);
    }
}

// Function to get the meaning of a word from the Free Dictionary API
async function getWordMeaning(word) {
    const request = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const response = await request.json();

    if (response.title){
        throw new Error("Word not found!");
    }

    return response[0].meanings[0].definitions[0].definition;
}

// Initialize the game
async function startGame() {
    attempts = 5;
    submitBtn.disabled = false;
    resultDisplay.textContent = "";
    remainingAttemptsDisplay.textContent = `Remaining Attempts: ${attempts}`;
    hintDisplay.textContent = "Generating word..."
    wordContainer.innerHTML = "";

    try {
        randomWord = await getRandomWord();
        // randomWord = "elephant";
        const hint = await getWordMeaning(randomWord);
        hintDisplay.textContent = `Hint: ${hint}`;

        generateLetterBoxes(randomWord);
        
    } catch (error) {
        let wordNotFound = error.message === "Word not found!";

        if (wordNotFound) startGame();

        console.log("Error: ", error.message);
    }
}

// Create letter boxes and reveal 40% of the letters - can improve/add diffiulty level that will be based on the shown letters
function generateLetterBoxes(word) {
    const letterToShow = Math.ceil(word.length * 0.4);
    let revealedIndexex = new Set();

    // Randomly select indexes to reveal
    while (revealedIndexex.size < letterToShow) {
        const randomIndex = Math.floor(Math.random() * word.length);
        revealedIndexex.add(randomIndex);
    }

    // Create textarea boxes and fill in revealed letters
    word.split('').map((letter, index) => {
        const box = document.createElement("textarea");
        box.className = "letter-box";
        box.maxLength = 1;
        box.cols = 1;
        box.rows = 1;

        if (revealedIndexex.has(index)) {
            box.value = letter;
            box.disabled = true;
        } else {
            box.value = "";
        }

        wordContainer.appendChild(box);
    });
}

// Event listener for start button
startBtn.addEventListener("click", () => {
    startGame();
    gameContainer.classList.toggle("flex");
    startBtn.classList.toggle("hide");
});

// Event lister for guess button
submitBtn.addEventListener("click", () => {
    let hadAnswer = false;
    const listTextArea = wordContainer.querySelectorAll("textarea");
    const userGuess = Array.from(wordContainer.querySelectorAll("textarea"))
        .map(box => box.value.trim().toUpperCase())
        .join('');

    // check if there's any guess
    Array.from(listTextArea).map(box => {
        if(box.value && !box.disabled) hadAnswer = true;
    })

    if (userGuess === randomWord.trim().toUpperCase()) {
        for (const node of listTextArea) {
            if (!node.disabled) node.classList.add("correct");
        }

        resultDisplay.textContent = "Congratulations! You guessed the correct word!";
        submitBtn.disabled = true;
        navigateContainer.classList.toggle("hide");
    } else {
        Array.from(listTextArea).map((box, index) => {
            if ((box.value.trim().toUpperCase() === randomWord[index].trim().toUpperCase()) && !box.disabled) {
                listTextArea[index].classList.add("correct");
            } else {
                listTextArea[index].classList.remove("correct");
            }
        })

        if (!hadAnswer) return; 

        attempts--
        remainingAttemptsDisplay.textContent = `Remaining Attempts: ${attempts}`;
        resultDisplay.textContent = attempts > 0 ? "Incorrect! Try Again." : `Game over! The correct word was "${randomWord}".`
        if (attempts <= 0) {
            submitBtn.disabled = true;
            navigateContainer.classList.toggle("hide");
        }
    }
});

newGameBtn.addEventListener("click", () => {
    navigateContainer.classList.toggle("hide");
    startGame();
});

exitBtn.addEventListener("click", () => {
    gameContainer.classList.toggle("flex");
    startBtn.classList.toggle("hide");
    navigateContainer.classList.toggle("hide");
});