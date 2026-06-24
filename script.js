 // Sentiment Analyzer - Core JavaScript
// Simple rule-based sentiment analysis engine with dynamic interactive UI

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Core Sentiment Word Lists
  const positiveWords = [
    'happy', 'good', 'excellent', 'amazing', 'wonderful', 'love', 'great', 
    'fantastic', 'awesome', 'nice', 'cheerful', 'positive', 'beautiful', 
    'glad', 'joy', 'delighted', 'super', 'superb', 'brilliant', 'outstanding', 
    'perfect', 'lovely', 'pleased', 'satisfied', 'friendly', 'funny', 
    'excited', 'hope', 'hopeful', 'blessed', 'proud', 'creative', 'kind'
  ];

  const negativeWords = [
    'bad', 'terrible', 'awful', 'hate', 'sad', 'poor', 'horrible', 'worst', 
    'disappointed', 'angry', 'dislike', 'miserable', 'upset', 'depressed', 
    'gloomy', 'nasty', 'ugly', 'fail', 'failure', 'regret', 'pain', 'painful', 
    'loss', 'lost', 'annoying', 'frustrating', 'fear', 'scared', 'stupid', 
    'trash', 'boring', 'lonely', 'worried', 'jealous', 'cruel', 'mean'
  ];

  // 2. DOM Element Selectors
  const textInput = document.getElementById('textInput');
  const charCounter = document.getElementById('charCounter');
  const clearBtn = document.getElementById('clearBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const errorMsg = document.getElementById('errorMsg');
  const resultContainer = document.getElementById('resultContainer');
  const resultCard = document.getElementById('resultCard');
  const resultEmoji = document.getElementById('resultEmoji');
  const resultValue = document.getElementById('resultValue');
  const scoreNumber = document.getElementById('scoreNumber');
  
  // Progress Bar fills
  const fillPos = document.getElementById('fillPos');
  const fillNeu = document.getElementById('fillNeu');
  const fillNeg = document.getElementById('fillNeg');

  // Match details lists
  const posCountText = document.getElementById('posCountText');
  const negCountText = document.getElementById('negCountText');
  const posTagList = document.getElementById('posTagList');
  const negTagList = document.getElementById('negTagList');

  // Word Bank Drawer
  const wordBankCard = document.getElementById('wordBankCard');
  const wordBankToggle = document.getElementById('wordBankToggle');
  const posWordBankList = document.getElementById('posWordBankList');
  const negWordBankList = document.getElementById('negWordBankList');
  const analyzerCard = document.getElementById('analyzerCard');

  // 3. Populate Word Bank Lists (Dynamic Generation)
  function populateWordBank() {
    posWordBankList.innerHTML = positiveWords.map(word => `<span class="word-chip">${word}</span>`).join('');
    negWordBankList.innerHTML = negativeWords.map(word => `<span class="word-chip">${word}</span>`).join('');
  }
  populateWordBank();

  // 4. Character Counter and Clear Button Toggle
  function updateInputMetrics() {
    const length = textInput.value.length;
    charCounter.textContent = `${length} / 500 characters`;
    
    // Near limit warning highlight
    if (length >= 450) {
      charCounter.classList.add('limit-near');
    } else {
      charCounter.classList.remove('limit-near');
    }

    // Toggle clear button visibility
    if (length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  }

  textInput.addEventListener('input', updateInputMetrics);

  // 5. Clear Button Handler
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateInputMetrics();
    errorMsg.classList.remove('visible');
    resultContainer.classList.remove('visible');
    textInput.focus();
  });

  // 6. Word Bank Toggle Drawer
  wordBankToggle.addEventListener('click', () => {
    wordBankCard.classList.toggle('expanded');
  });

  // 7. Core Sentiment Analysis Logic
  function analyzeSentiment() {
    const text = textInput.value.trim();

    // Reset error states
    errorMsg.classList.remove('visible');
    analyzerCard.classList.remove('shake');

    // Validation Check: Empty Input
    if (!text) {
      // Small delay to allow reflow and retrigger the CSS animation
      setTimeout(() => {
        analyzerCard.classList.add('shake');
        errorMsg.classList.add('visible');
      }, 10);
      resultContainer.classList.remove('visible');
      return;
    }

    // Normalize text: lowercase & strip punctuation
    // Keep words, numbers, and basic spacing
    const cleanedText = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
      .replace(/\s+/g, ' ');

    // Split text into individual words
    const words = cleanedText.split(' ').filter(word => word.length > 0);

    // Keep track of counts and specific matched words with occurrence counts
    let positiveCount = 0;
    let negativeCount = 0;
    const matchedPositive = {};
    const matchedNegative = {};

    words.forEach(word => {
      if (positiveWords.includes(word)) {
        positiveCount++;
        matchedPositive[word] = (matchedPositive[word] || 0) + 1;
      } else if (negativeWords.includes(word)) {
        negativeCount++;
        matchedNegative[word] = (matchedNegative[word] || 0) + 1;
      }
    });

    // Determine Sentiment
    let sentiment = 'Neutral';
    let emoji = '😐';
    let resultClass = 'neutral';

    if (positiveCount > negativeCount) {
      sentiment = 'Positive';
      emoji = '😊';
      resultClass = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'Negative';
      emoji = '😢';
      resultClass = 'negative';
    }

    // Calculate score: pos - neg
    const score = positiveCount - negativeCount;

    // Render results in DOM
    renderResults(sentiment, emoji, resultClass, score, positiveCount, negativeCount, matchedPositive, matchedNegative);
  }

  // 8. Render Results in the DOM with Animations
  function renderResults(sentiment, emoji, resultClass, score, posCount, negCount, matchedPos, matchedNeg) {
    // Show container
    resultContainer.classList.add('visible');

    // Update Result Card class (positive, negative, neutral)
    resultCard.className = `result-card ${resultClass}`;

    // Update Text Content
    resultEmoji.textContent = emoji;
    resultValue.textContent = sentiment;
    
    // Formatting Score Display (e.g. "+3" or "-2" or "0")
    const scoreSign = score > 0 ? '+' : '';
    scoreNumber.textContent = `Score: ${scoreSign}${score}`;

    // Update Progress Bar
    const totalWords = posCount + negCount;
    if (totalWords > 0) {
      const posPercent = (posCount / totalWords) * 100;
      const negPercent = (negCount / totalWords) * 100;
      
      fillPos.style.width = `${posPercent}%`;
      fillNeg.style.width = `${negPercent}%`;
      fillNeu.style.width = `0%`;
    } else {
      fillPos.style.width = `0%`;
      fillNeg.style.width = `0%`;
      fillNeu.style.width = `100%`;
    }

    // Update Word Count Badges
    posCountText.textContent = posCount;
    negCountText.textContent = negCount;

    // Render Tag Lists
    renderTags(posTagList, matchedPos, 'pos-tag');
    renderTags(negTagList, matchedNeg, 'neg-tag');

    // Auto-scroll to results card on small devices for better UX
    if (window.innerWidth < 768) {
      setTimeout(() => {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }

  // Helper to render matched word tags
  function renderTags(container, matchedObj, className) {
    const keys = Object.keys(matchedObj);
    if (keys.length === 0) {
      container.innerHTML = '<span class="empty-tag">None found</span>';
      return;
    }

    container.innerHTML = keys
      .map(word => {
        const count = matchedObj[word];
        const countLabel = count > 1 ? ` x${count}` : '';
        return `<span class="tag ${className}">${word}${countLabel}</span>`;
      })
      .join('');
  }

  // 9. Analyze Button Events
  analyzeBtn.addEventListener('click', analyzeSentiment);

  // Form Submission on Ctrl+Enter
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      analyzeSentiment();
    }
  });

  // Handle remove shake class after animation ends
  analyzerCard.addEventListener('animationend', (e) => {
    if (e.animationName === 'shake') {
      analyzerCard.classList.remove('shake');
    }
  });

});
