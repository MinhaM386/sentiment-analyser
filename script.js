
import { pipeline } from
  "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

let sentimentModel = null;

const textInput = document.getElementById("textInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const resultContainer = document.getElementById("resultContainer");
const resultCard = document.getElementById("resultCard");
const resultEmoji = document.getElementById("resultEmoji");
const resultValue = document.getElementById("resultValue");
const scoreNumber = document.getElementById("scoreNumber");
const errorMsg = document.getElementById("errorMsg");
const errorText = document.getElementById("errorText");

const fillPos = document.getElementById("fillPos");
const fillNeg = document.getElementById("fillNeg");
const fillNeu = document.getElementById("fillNeu");

const charCounter = document.getElementById("charCounter");

// Update character count
textInput.addEventListener("input", () => {
  charCounter.textContent =
    `${textInput.value.length} / 500 characters`;
});

// Load the pre-trained AI model
async function loadModel() {
  if (!sentimentModel) {
    analyzeBtn.querySelector("span").textContent =
      "Loading AI model...";

    sentimentModel = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
  return sentimentModel;
}

// Analyze text using DistilBERT
async function analyzeSentiment() {
  const text = textInput.value.trim();

  errorMsg.classList.remove("visible");

  if (!text) {
    errorText.textContent = "Please enter some text.";
    errorMsg.classList.add("visible");
    return;
  }

  analyzeBtn.disabled = true;

  try {
    const model = await loadModel();

    analyzeBtn.querySelector("span").textContent =
      "Analyzing...";

    const result = await model(text);

    const label = result[0].label;
    const confidence = result[0].score;
    const percentage = (confidence * 100).toFixed(2);

    const positive = label === "POSITIVE";

    const sentiment = positive ? "Positive" : "Negative";
    const emoji = positive ? "😊" : "😢";
    const resultClass = positive ? "positive" : "negative";

    resultContainer.classList.add("visible");
    resultCard.className = `result-card ${resultClass}`;

    resultEmoji.textContent = emoji;
    resultValue.textContent = sentiment;

    scoreNumber.textContent =
      `Model Confidence: ${percentage}%`;

    fillPos.style.width =
      positive ? `${percentage}%` : "0%";

    fillNeg.style.width =
      positive ? "0%" : `${percentage}%`;

    fillNeu.style.width = "0%";

    // Replace old dictionary results with model information
    const matches = document.querySelector(".matches-section");

    matches.innerHTML = `
      <h4>AI Model Prediction</h4>
      <p>Model: DistilBERT</p>
      <p>Predicted sentiment: ${sentiment}</p>
      <p>Confidence: ${percentage}%</p>
    `;

  } catch (error) {
    console.error(error);
    errorText.textContent =
      "Unable to load the AI model. Check your internet connection and try again.";
    errorMsg.classList.add("visible");

  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.querySelector("span").textContent =
      "Analyze Sentiment";
  }
}

analyzeBtn.addEventListener("click", analyzeSentiment);

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  charCounter.textContent = "0 / 500 characters";
  resultContainer.classList.remove("visible");
  errorMsg.classList.remove("visible");
  textInput.focus();
});
