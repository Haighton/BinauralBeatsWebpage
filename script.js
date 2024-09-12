// JavaScript for Binaural Beats Meditation Tool webpage.

let audioCtx;
let oscillatorLeft, oscillatorRight, gainNodeLeft, gainNodeRight;
let isPlaying = false;
let journeyTimer = null; // Timer for journey control
let journeySteps = [];

// Effect thresholds based on beat frequency
const effectThresholds = {
    delta: { max: 4, label: 'Deep Sleep - Promotes restorative sleep and relaxation.' },
    theta: { max: 8, label: 'Meditation - Facilitates deep meditation and creativity.' },
    alpha: { max: 12, label: 'Relaxation - Encourages a state of relaxation.' },
    beta: { max: 30, label: 'Focus - Enhances concentration and alertness.' },
    gamma: { max: 100, label: 'High Awareness - Linked to high-level cognition.' }
};

function updateBaseFrequency() {
    if (isPlaying) {
        const baseFreq = parseFloat(document.getElementById('baseFreq').value);
        oscillatorLeft.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        updateFrequencyDifference(); // Ensure right oscillator is updated with the new base frequency
    }
}

function updateFrequencyDifference() {
    const input = document.getElementById('diffFreqInput');
    const display = document.getElementById('diffFreqDisplay');
    let inputValue = parseFloat(input.value);

    if (!isNaN(inputValue) && inputValue >= 0.1 && inputValue <= 100.0) {
        display.textContent = inputValue.toFixed(1);
    } else {
        input.value = '1.0';
        display.textContent = '1.0';
    }

    // Update effect display based on beat frequency
    let effectText = 'Relaxation';
    for (const [key, range] of Object.entries(effectThresholds)) {
        if (inputValue <= range.max) {
            effectText = range.label;
            break;
        }
    }
    document.getElementById('effectDisplay').textContent = 'Effect: ' + effectText;

    if (isPlaying) {
        const baseFreq = parseFloat(document.getElementById('baseFreq').value);
        oscillatorRight.frequency.setValueAtTime(baseFreq + inputValue, audioCtx.currentTime); // Real-time update
    }
}

function updateVolume() {
    const volume = parseFloat(document.getElementById('volumeControl').value);
    document.getElementById('volumeValue').textContent = `${Math.round(volume * 100)}%`;
    if (isPlaying) {
        gainNodeLeft.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNodeRight.gain.setValueAtTime(volume, audioCtx.currentTime);
    }
}

// Function to handle preset buttons
document.querySelectorAll('.preset-button').forEach(button => {
    button.addEventListener('click', () => {
        const freq = parseFloat(button.getAttribute('data-frequency'));
        document.getElementById('baseFreq').value = freq.toFixed(2);
        updateBaseFrequency();
    });
});

// Function to draw piano keys
function drawPiano(octave) {
    const piano = document.getElementById('piano');
    piano.innerHTML = '';
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const baseFrequencies = {
        'C': 32.70,
        'D': 36.71,
        'E': 41.20,
        'F': 43.65,
        'G': 49.00,
        'A': 55.00,
        'B': 61.74
    };

    notes.forEach(note => {
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = note;
        key.style.cursor = 'pointer';
        const frequency = baseFrequencies[note] * Math.pow(2, octave - 1);
        key.onclick = function() {
            document.getElementById('baseFreq').value = frequency.toFixed(2);
            updateBaseFrequency();
        };
        piano.appendChild(key);
    });
}

function addJourneyStep() {
    const journeyContainer = document.getElementById('journeyContainer');
    const newStep = document.createElement('div');
    const freqInput = document.createElement('input');
    freqInput.type = 'number';
    freqInput.placeholder = 'Frequency (Hz)';
    freqInput.min = 1.0;
    freqInput.max = 100;
    freqInput.step = 0.1;
    const timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.placeholder = 'Duration (minutes)';
    timeInput.min = 1;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Step';
    deleteButton.onclick = function() {
        journeyContainer.removeChild(newStep);
    };
    newStep.appendChild(freqInput);
    newStep.appendChild(timeInput);
    newStep.appendChild(deleteButton);
    journeyContainer.appendChild(newStep);
}

// Start Brainwave Entrainment (used to be called journey)
function startJourney() {
    const steps = document.querySelectorAll('#journeyContainer > div');
    let totalTime = 0;
    journeySteps = [];
    steps.forEach(step => {
        const freq = parseFloat(step.children[0].value);
        const time = parseFloat(step.children[1].value);
        if (!isNaN(freq) && !isNaN(time)) {
            journeySteps.push({ frequency: freq, duration: time });
            totalTime += time;
        }
    });

    if (journeySteps.length > 0) {
        let currentIndex = 0;
        let currentStep = journeySteps[currentIndex];
        let currentDuration = currentStep.duration * 60 * 1000; // milliseconds
        let currentFrequency = parseFloat(document.getElementById('diffFreqInput').value);
        let stepFrequencyIncrement = (currentStep.frequency - currentFrequency) / (currentDuration / 100);

        journeyTimer = setInterval(function() {
            if (currentDuration <= 0) {
                currentIndex++;
                if (currentIndex < journeySteps.length) {
                    currentStep = journeySteps[currentIndex];
                    currentDuration = currentStep.duration * 60 * 1000; // milliseconds
                    currentFrequency = parseFloat(document.getElementById('diffFreqInput').value);
                    stepFrequencyIncrement = (currentStep.frequency - currentFrequency) / (currentDuration / 100);
                } else {
                    clearInterval(journeyTimer);
                }
            } else {
                currentFrequency += stepFrequencyIncrement;
                document.getElementById('diffFreqInput').value = currentFrequency.toFixed(1);
                updateFrequencyDifference();
                currentDuration -= 100;
            }
        }, 100);
    }
}

function stopJourney() {
    if (journeyTimer) {
        clearInterval(journeyTimer);
        journeyTimer = null;
    }
}

document.getElementById('addJourneyStep').addEventListener('click', addJourneyStep);
document.getElementById('startJourneyBtn').addEventListener('click', startJourney);
document.getElementById('stopJourneyBtn').addEventListener('click', stopJourney);

document.getElementById('playBtn').addEventListener('click', startSound);
document.getElementById('stopBtn').addEventListener('click', stopSound);

function startSound() {
    if (!isPlaying) {
        audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        oscillatorLeft = audioCtx.createOscillator();
        oscillatorRight = audioCtx.createOscillator();

        const baseFreq = parseFloat(document.getElementById('baseFreq').value) || 261.63;
        oscillatorLeft.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);

        const diffFreq = parseFloat(document.getElementById('diffFreqInput').value) || 1.0;
        oscillatorRight.frequency.setValueAtTime(baseFreq + diffFreq, audioCtx.currentTime);

        const panNodeLeft = audioCtx.createStereoPanner();
        const panNodeRight = audioCtx.createStereoPanner();
        panNodeLeft.pan.setValueAtTime(-1, audioCtx.currentTime);
        panNodeRight.pan.setValueAtTime(1, audioCtx.currentTime);

        gainNodeLeft = audioCtx.createGain();
        gainNodeRight = audioCtx.createGain();

        oscillatorLeft.connect(gainNodeLeft).connect(panNodeLeft).connect(audioCtx.destination);
        oscillatorRight.connect(gainNodeRight).connect(panNodeRight).connect(audioCtx.destination);

        const volume = parseFloat(document.getElementById('volumeControl').value);
        gainNodeLeft.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNodeRight.gain.setValueAtTime(volume, audioCtx.currentTime);

        oscillatorLeft.start();
        oscillatorRight.start();

        isPlaying = true;
    }
}

function stopSound() {
    if (isPlaying) {
        oscillatorLeft.stop();
        oscillatorRight.stop();
        audioCtx.close();
        isPlaying = false;
    }
}

// Initialize piano keys and display
drawPiano(4);

//const API_KEY = '2zyLM9SEVTdFe9UdVQKEl0bDMRDyX461mYemcs3S';  // Replace with your Freesound API Key
const soundList = document.getElementById('soundList');
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');

// Function to search and fetch sounds from the Heroku backend
function fetchFreesound(query) {
    const url = `https://fathomless-badlands-08982-d3350df42aa9.herokuapp.com/api/search?q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);  // Log the data for debugging
            displaySounds(data.results);  // Display the sounds on the page
        })
        .catch(error => console.error('Error fetching Freesound data:', error));
}

function displaySounds(sounds) {
    const soundList = document.getElementById('soundList');
    soundList.innerHTML = '';  // Clear previous results

    // Filter sounds that have at least one preview available
    const soundsWithPreviews = sounds.filter(sound => sound.previews && (sound.previews['preview-lq-mp3'] || sound.previews['preview-hq-mp3']));

    if (soundsWithPreviews.length === 0) {
        soundList.innerHTML = '<p>No sounds with previews available.</p>';
        return;
    }

    soundsWithPreviews.forEach(sound => {
        const listItem = document.createElement('li');

        // Format duration as hours:minutes:seconds
        const hours = Math.floor(sound.duration / 3600);
        const minutes = Math.floor((sound.duration % 3600) / 60);
        const seconds = Math.floor(sound.duration % 60);
        const formattedDuration = 
            (hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:` : `${minutes}:`) + 
            seconds.toString().padStart(2, '0');  // Ensures two digits for minutes/seconds

        // Create the Play button with the play symbol
        const playButton = document.createElement('button');
        playButton.textContent = '▶️';  // Play symbol
        if (sound.previews['preview-hq-mp3']) {
            playButton.addEventListener('click', () => playSound(sound.previews['preview-hq-mp3'], sound));
        } else if (sound.previews['preview-lq-mp3']) {
            playButton.addEventListener('click', () => playSound(sound.previews['preview-lq-mp3'], sound));
        }

        // Add the Play button and display the name and duration
        listItem.appendChild(playButton);
        listItem.appendChild(document.createTextNode(` ${sound.name} - Duration: ${formattedDuration}`));
        soundList.appendChild(listItem);
    });
}


function playSound(url, sound) {
    const audioSource = document.getElementById('audioSource');
    const audioPlayer = document.getElementById('audioPlayer');
    const soundDetails = document.getElementById('soundDetails');

    // Pause and reset the player to its default state before loading a new file
    audioPlayer.pause();
    audioPlayer.currentTime = 0;  // Reset the audio position to the start

    // Load the selected sound URL into the audio player
    audioSource.src = url;
    audioPlayer.load();

    // Ensure volume and unmute the player
    audioPlayer.muted = false;
    audioPlayer.volume = 1; // Set volume to 100%

    // Try to play the audio right after loading
    audioPlayer.play().then(() => {
        audioPlayer.muted = false;
        audioPlayer.volume = 1;
    }).catch(error => {
        console.log('Auto-play was blocked, waiting for user interaction:', error);
    });

    // Format sound duration
    const hours = Math.floor(sound.duration / 3600);
    const minutes = Math.floor((sound.duration % 3600) / 60);
    const seconds = Math.floor(sound.duration % 60);
    const formattedDuration = 
        (hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:` : `${minutes}:`) + 
        seconds.toString().padStart(2, '0');

    // Display sound details
    soundDetails.innerHTML = `
        <p><strong>Description:</strong> ${sound.description || 'No description available.'}</p>
        <p><strong>Uploaded by:</strong> <a href="https://freesound.org/people/${sound.username}/" target="_blank">${sound.username}</a></p>
        <p><strong>Duration:</strong> ${formattedDuration}</p>
    `;

    // Add the float-right class to any images in the description
    const descriptionImages = soundDetails.querySelectorAll('img');
    descriptionImages.forEach(img => {
        img.classList.add('float-right');
    });
}











// Search button event listener
document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchTerm').value;
    if (!query.trim()) {
        alert('Please enter a search term.');
        return;
    }
    fetchFreesound(query);  // Fetch Freesound data with the query
});
