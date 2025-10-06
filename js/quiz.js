/**
 * Quiz functionality for WeatherWise 2.0
 * Funcionalidade do quiz meteorológico
 */

// Quiz questions and answers
const quizData = [
  {
    question: "What instrument is used to measure atmospheric pressure?",
    options: ["Thermometer", "Barometer", "Anemometer", "Hygrometer"],
    correct: 1,
    explanation: "The barometer is the instrument used to measure atmospheric pressure."
  },
  {
    question: "What causes the rainbow phenomenon?",
    options: ["Reflection of sunlight in clouds", "Refraction and reflection of sunlight in raindrops", "Evaporation of water from oceans", "Atmospheric pollution"],
    correct: 1,
    explanation: "Rainbows are formed when sunlight is refracted and reflected in water droplets in the atmosphere."
  },
  {
    question: "Which layer of the atmosphere is closest to the Earth's surface?",
    options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"],
    correct: 1,
    explanation: "The troposphere is the lowest layer of Earth's atmosphere, where most weather phenomena occur."
  },
  {
    question: "What is a tropical cyclone?",
    options: ["A low-pressure system that forms over warm tropical waters", "A high-pressure system that forms over cold tropical waters", "A strong wind that blows from the equator to the poles", "A tropical snowstorm"],
    correct: 0,
    explanation: "A tropical cyclone is a low-pressure system that forms over warm ocean waters in the tropics."
  },
  {
    question: "What is the main cause of the greenhouse effect?",
    options: ["Ultraviolet radiation", "Gases such as CO2, methane, and water vapor", "Ozone layer", "Direct solar radiation"],
    correct: 1,
    explanation: "The greenhouse effect is primarily caused by gases such as carbon dioxide, methane, and water vapor."
  },
  {
    question: "What is a weather front?",
    options: ["The meeting line between two air masses of different temperatures", "The front part of a storm", "The first rain of the season", "The horizon line during sunset"],
    correct: 0,
    explanation: "A weather front is the transition zone between two air masses with different temperatures and/or humidity."
  },
  {
    question: "What is the difference between climate and weather?",
    options: ["There is no difference, they are synonyms", "Weather refers to short-term atmospheric conditions, climate to long-term average conditions", "Weather refers only to temperature, climate includes all meteorological phenomena", "Climate is measured in hours, weather is measured in days"],
    correct: 1,
    explanation: "Weather refers to atmospheric conditions over a short period, climate is the average pattern of these conditions over a longer period."
  },
  {
    question: "What is the El Niño phenomenon?",
    options: ["An abnormal warming of the waters of the equatorial Pacific Ocean", "An abnormal cooling of the Atlantic Ocean waters", "A tropical storm that occurs only in the northern hemisphere", "A type of cloud that causes heavy rainfall"],
    correct: 0,
    explanation: "El Niño is a climate phenomenon characterized by abnormal warming of the surface waters of the equatorial Pacific Ocean."
  },
  {
    question: "How do lightning bolts form during a storm?",
    options: ["By collision of clouds", "By separation of electrical charges within clouds", "By heating of air near the ground", "By Earth's rotation"],
    correct: 1,
    explanation: "Lightning is formed by the separation of electrical charges within storm clouds."
  },
  {
    question: "What is the main cause of the seasons?",
    options: ["The distance between Earth and the Sun", "The tilt of Earth's axis relative to the plane of its orbit", "Earth's rotation", "Ocean currents"],
    correct: 1,
    explanation: "The seasons are primarily caused by the tilt of Earth's axis relative to the plane of its orbit around the Sun."
  }
];

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const questionsContainer = document.getElementById('questionsContainer');
  const resultsContainer = document.getElementById('resultsContainer');
  const quizProgress = document.getElementById('quizProgress');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreMessage = document.getElementById('scoreMessage');
  const explanationsContainer = document.getElementById('explanationsContainer');
  const retryButton = document.getElementById('retryButton');
  const weatherAnimation = document.getElementById('weatherAnimation');
  
  let currentQuestion = 0;
  let score = 0;
  let userAnswers = [];
  
  // Initialize quiz
  initQuiz();
  createWeatherElements();
  
  // Add event listener for retry button
  retryButton.addEventListener('click', resetQuiz);
  
  // Initialize quiz
  function initQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    questionsContainer.innerHTML = '';
    
    // Generate questions
    quizData.forEach((data, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-container';
      questionDiv.dataset.question = index + 1;
      
      questionDiv.innerHTML = `
        <div class="question-header">
          <div class="question-number">${index + 1}</div>
          <h4>${data.question}</h4>
        </div>
        <div class="options">
          ${data.options.map((option, optionIndex) => `
            <input type="radio" name="q${index + 1}" id="q${index + 1}${String.fromCharCode(97 + optionIndex)}" class="option-input" value="${optionIndex}">
            <label for="q${index + 1}${String.fromCharCode(97 + optionIndex)}" class="option-label">${option}</label>
          `).join('')}
        </div>
        <button class="btn btn-primary quiz-btn ${index === quizData.length - 1 ? 'finish-btn' : 'next-btn'}">
          ${index === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      `;
      
      questionsContainer.appendChild(questionDiv);
    });
    // Add event listeners to buttons
    document.querySelectorAll('.next-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => nextQuestion(index));
    });
    
    document.querySelector('.finish-btn').addEventListener('click', finishQuiz);
    
    // Show first question
    showQuestion(0);
    updateProgress();
    resultsContainer.style.display = 'none';
    questionsContainer.style.display = 'block';
  }
  
  // Show question by index
  function showQuestion(index) {
    document.querySelectorAll('.question-container').forEach(q => q.classList.remove('active'));
    document.querySelectorAll('.question-container')[index].classList.add('active');
    updateProgress();
  }
  
  // Go to next question
  function nextQuestion(index) {
    saveAnswer(index);
    currentQuestion = index + 1;
    showQuestion(currentQuestion);
  }
  
  // Save user answer
  function saveAnswer(index) {
    const selectedOption = document.querySelector(`input[name="q${index + 1}"]:checked`);
    userAnswers[index] = selectedOption ? parseInt(selectedOption.value) : -1;
  }
  
  // Finish quiz
  function finishQuiz() {
    saveAnswer(quizData.length - 1);
    calculateScore();
    showResults();
  }
  
  // Calculate score
  function calculateScore() {
    score = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizData[index].correct) score++;
    });
  }
  
  // Show results
  function showResults() {
    questionsContainer.style.display = 'none';
    scoreDisplay.textContent = score;
    
    if (score <= 3) {
      scoreMessage.textContent = 'You can improve! Try again to learn more about meteorology.';
    } else if (score <= 6) {
      scoreMessage.textContent = 'Good job! You have a basic understanding of meteorology.';
    } else if (score <= 9) {
      scoreMessage.textContent = 'Very good! You have great knowledge about meteorology.';
    } else {
      scoreMessage.textContent = 'Excellent! You are a meteorology expert!';
    }
    generateExplanations();
    resultsContainer.style.display = 'block';
    quizProgress.style.width = '100%';
  }
  
  // Generate explanations
  function generateExplanations() {
    explanationsContainer.innerHTML = '';
    
    quizData.forEach((data, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = data.correct;
      const isCorrect = userAnswer === correctAnswer;
      
      const explanationDiv = document.createElement('div');
      explanationDiv.className = `result-item ${isCorrect ? 'correct-answer' : 'wrong-answer'}`;
      
      explanationDiv.innerHTML = `
        <h5>${index + 1}. ${data.question}</h5>
        <p>
          ${userAnswer === -1 ? 
            `<strong>You did not answer.</strong> The correct answer is: <strong>${data.options[correctAnswer]}</strong>` : 
            `<strong>Your answer:</strong> ${data.options[userAnswer]}<br>
             <strong>Correct answer:</strong> ${data.options[correctAnswer]}`
          }
        </p>
        <div class="explanation">${data.explanation}</div>
      `;
      explanationsContainer.appendChild(explanationDiv);
    });
  }
  
  // Reset quiz
  function resetQuiz() {
    initQuiz();
  }
  
  // Update progress bar
  function updateProgress() {
    quizProgress.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;
  }
  
  // Create weather animation elements
  function createWeatherElements() {
    weatherAnimation.innerHTML = '';
    
    // Create clouds
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.style.top = `${Math.random() * 30}%`;
      cloud.style.left = `${Math.random() * 100}%`;
      cloud.style.width = `${60 + Math.random() * 40}px`;
      cloud.style.height = `${30 + Math.random() * 20}px`;
      cloud.style.animationDuration = `${20 + Math.random() * 30}s`;
      weatherAnimation.appendChild(cloud);
    }
    
    // Create raindrops
    for (let i = 0; i < 30; i++) {
      const raindrop = document.createElement('div');
      raindrop.className = 'raindrop';
      raindrop.style.left = `${Math.random() * 100}%`;
      raindrop.style.top = `${Math.random() * 100}%`;
      raindrop.style.animationDuration = `${1 + Math.random() * 2}s`;
      raindrop.style.animationDelay = `${Math.random() * 2}s`;
      weatherAnimation.appendChild(raindrop);
    }
    
    // Create snowflakes
    for (let i = 0; i < 20; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.top = `${Math.random() * 100}%`;
      snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
      snowflake.style.animationDelay = `${Math.random() * 5}s`;
      weatherAnimation.appendChild(snowflake);
    }
    
    // Create sun rays
    for (let i = 0; i < 3; i++) {
      const sunRay = document.createElement('div');
      sunRay.className = 'sun-ray';
      sunRay.style.left = `${Math.random() * 100}%`;
      sunRay.style.top = `${Math.random() * 100}%`;
      sunRay.style.animationDuration = `${3 + Math.random() * 5}s`;
      sunRay.style.animationDelay = `${Math.random() * 3}s`;
      weatherAnimation.appendChild(sunRay);
    }
  }
});