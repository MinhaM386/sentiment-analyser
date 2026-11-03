
import { pipeline } from
"https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";

// =====================================
// SENTIMENT ANALYSER - 3 CLASS MODEL
// =====================================

let sentimentModel = null;

// HTML elements
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

// =====================================
// CHARACTER COUNTER
// =====================================

textInput.addEventListener("input", () => {
    charCounter.textContent =
        `${textInput.value.length} / 500 characters`;
});

// =====================================
// LOAD PRE-TRAINED AI MODEL
// =====================================

async function loadModel() {

    if (!sentimentModel) {

        analyzeBtn.querySelector("span").textContent =
            "Loading AI model...";

        sentimentModel = await pipeline(
            "text-classification",
            "Horizon-Labs/multilingual-sentiment-small",
            { dtype: "q8" }
        );
    }

    return sentimentModel;
}

// =====================================
// ANALYZE SENTIMENT
// =====================================

async function analyzeSentiment() {

    const text = textInput.value.trim();

    errorMsg.classList.remove("visible");

    if (!text) {

        errorText.textContent =
            "Please enter some text.";

        errorMsg.classList.add("visible");
        return;
    }

    if (text.length > 500) {

        errorText.textContent =
            "Please enter text within 500 characters.";

        errorMsg.classList.add("visible");
        return;
    }

    analyzeBtn.disabled = true;

    try {

        const model = await loadModel();

        analyzeBtn.querySelector("span").textContent =
            "Analyzing...";

        const result = await model(text);

        console.log("Model prediction:", result);

        // Get model prediction
        const label = result[0].label.toLowerCase();
        const confidence = result[0].score;

        const percentage =
            (confidence * 100).toFixed(2);

        // Determine sentiment
        let sentiment;
        let emoji;
        let resultClass;

        if (label.includes("positive")) {

            sentiment = "Positive";
            emoji = "😊";
            resultClass = "positive";

        } else if (label.includes("negative")) {

            sentiment = "Negative";
            emoji = "😞";
            resultClass = "negative";

        } else if (label.includes("neutral")) {

            sentiment = "Neutral";
            emoji = "😐";
            resultClass = "neutral";

        } else {

            throw new Error(
                "Unknown sentiment label: " + label
            );
        }

        // Display result
        resultContainer.classList.add("visible");

        resultCard.className =
            `result-card ${resultClass}`;

        resultEmoji.textContent = emoji;
        resultValue.textContent = sentiment;

        scoreNumber.textContent =
            `Model Confidence: ${percentage}%`;

        // Update sentiment bars
        fillPos.style.width =
            label.includes("positive")
                ? `${percentage}%` : "0%";

        fillNeg.style.width =
            label.includes("negative")
                ? `${percentage}%` : "0%";

        fillNeu.style.width =
            label.includes("neutral")
                ? `${percentage}%` : "0%";

        // Display model information
        const matches =
            document.querySelector(".matches-section");

        matches.innerHTML = `
            <h4>AI Model Prediction</h4>
            <p>Model: Horizon-Labs Multilingual Sentiment Small</p>
            <p>Predicted sentiment: ${sentiment}</p>
            <p>Confidence: ${percentage}%</p>
        `;

    } catch (error) {

        console.error("Sentiment analysis error:", error);

        errorText.textContent =
            "Unable to analyse text. Please check your internet connection or model compatibility.";

        errorMsg.classList.add("visible");

    } finally {

        analyzeBtn.disabled = false;

        analyzeBtn.querySelector("span").textContent =
            "Analyze Sentiment";
    }
}

// =====================================
// BUTTON EVENTS
// =====================================

analyzeBtn.addEventListener(
    "click",
    analyzeSentiment
);

// Clear button
clearBtn.addEventListener("click", () => {

    textInput.value = "";

    charCounter.textContent =
        "0 / 500 characters";

    resultContainer.classList.remove("visible");
    errorMsg.classList.remove("visible");

    fillPos.style.width = "0%";
    fillNeg.style.width = "0%";
    fillNeu.style.width = "0%";

    textInput.focus();
});
