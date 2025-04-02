// Selecting elements from the HTML document
const query = document.querySelector('.search');       // Input field for entering the word
const button = document.querySelector('.btn');         // Button to trigger the word search
const outputbox = document.querySelector('.outputbox'); // Container to display the search results
const audio = document.getElementById('audio');         // Audio element for playing pronunciation

// API endpoint for fetching word definitions
const api = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Adding event listeners to the button and input field for triggering the search
button.addEventListener('click', () => {
    fetchword();
});

query.addEventListener('keydown', (e) => {
    // Trigger the search if the user presses Enter key
    if (e.keyCode === 13 || e.key === "Enter") {
        fetchword();
    }
});

// Function to fetch word details from the API
async function fetchword() {
    // Get the word entered by the user and convert it to lowercase
    const word = query.value.toLowerCase();

    // Check if the user entered a word
    if (!word) {
        alert('Please enter a word');
        return;
    }

    // Display a loading spinner while waiting for the API response
    const loader = displayloader();

    let result;
    try {
        // Fetch word details from the API
        const response = await fetch(`${api}${word}`);

        // Check if the response status is not successful
        if (response.status > 400) {
            throw Error(response.status);
        }

        // Parse the JSON response
        const words = await response.json();

        // Process the API response to get the definition
        result = getdefinition(words);
    } catch (error) {
        // Handle errors and display appropriate error message
        result = getErrorMessage(error);
    } finally {
        // Display the search results or error message, and remove the loading spinner
        outputbox.innerHTML = result;
        query.value = "";
        loader.remove();
    }
}

// Function to display a loading spinner during API request
function displayloader() {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.innerHTML = `
    <i class="fa-solid fa-spinner icon"></i>
    <p class="description">Loading...</p>
    `;
    outputbox.appendChild(loader);
    return loader;
}

// Function to handle API errors and display appropriate error messages
const getErrorMessage = (err) => `
    <section class="error-container">
        ${Number(err.toString().match(/\d{3}$/)) === 404
            ? `<h4 class="reason">Sorry, I couldn't find it.</h4>
            <i class="fa-solid fa-face-frown icon"></i>
            <p class="suggestion">Please check your spelling or try again later.</p>` 
            : `<h4 class="reason">${err}</h4>
            <p class="suggestion">An error occurred, please try again</p>` }
    </section>`;

// Function to process the API response and generate HTML for displaying word definitions
function getdefinition(words) {
    return words.map((wordObj) =>
        wordObj.meanings
            .map(
                (meaning) =>
                    `<section class="card">
                        <!-- Word and pronunciation details -->
                        <section class="word-audio-container">
                            <section class="word-container">
                                <h4 class="word">${wordObj.word}</h4>
                                <p class="part-of-speech">${meaning.partOfSpeech}</p>
                                ${wordObj.origin ? `<p class="origin">Origin: ${wordObj.origin}</p>` : ''}
                            </section>
                            <!-- Audio playback button -->
                            ${wordObj.phonetics.reduce((result, phonetic) => {
                                if (phonetic.audio && phonetic.text && !result) {
                                    result = `<button class="play-audio" data-soundtrack="${phonetic.audio}" onclick="playAudio(this.dataset.soundtrack)"><i class="fa-solid fa-volume-high"></i></button>`;
                                }
                                return result;
                            }, "")}
                        </section>

                        <!-- Phonetic representations -->
                        <section class="phonetic-container">
                            ${wordObj.phonetics
                                .map((phonetic) =>
                                    phonetic.audio && phonetic.text
                                        ? `<button data-soundtrack="${phonetic.audio}" class="phonetic" onclick="playAudio(this.dataset.soundtrack)">${phonetic.text} </button>`
                                        : ""
                                )
                                .join("")}
                        </section>

                        <!-- Definitions and examples -->
                        <section class="definition-container">
                            <ol>
                                ${meaning.definitions
                                    .map((definitionObj) =>
                                        definitionObj.example
                                            ? `<li>
                                                <p class="definition">${definitionObj.definition}</p>
                                                <p class="example">${definitionObj.example}</p>
                                            </li>`
                                            : `<li>
                                                <p class="definition">${definitionObj.definition}</p>
                                            </li>`
                                    )
                                    .join("\n")}
                            </ol>
                        </section>
                    </section>`
            )
            .join("\n")
    )
    .join("\n");
}

// Function to play audio using the provided URL
const playAudio = (url) => {
    audio.setAttribute('src', url);
    audio.play();
}