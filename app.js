const API_KEY = "YOUR_API_KEY_HERE";
const API_URL = "https://api.anthropic.com/v1/messages";

const analyzeBtn = document.getElementById("analyzeBtn");
const resultsSection = document.getElementById("results");
const verdictBox = document.getElementById("verdictBox");
const verdictLabel = document.getElementById("verdictLabel");
const confidenceLabel = document.getElementById("confidenceLabel");
const summaryEl = document.getElementById("summary");
const indicatorsEl = document.getElementById("indicators");

analyzeBtn.addEventListener("click", async () => {
  const sender = document.getElementById("sender").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const body = document.getElementById("body").value.trim();

  if (!body) {
    alert("Please paste an email body before analyzing.");
    return;
  }

  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;
  resultsSection.style.display = "none";

  const prompt = `You are a cybersecurity analyst specializing in phishing detection.
Analyze the following email and return ONLY a valid JSON object with no extra text, no markdown, no backticks.

The JSON must follow this exact structure:
{
  "verdict": "safe" or "suspicious" or "phishing",
  "confidence": a number between 0 and 100,
  "summary": "2-3 sentence plain English explanation",
  "indicators": [
    { "category": "Sender", "flag": "specific red flag" },
    { "category": "Links", "flag": "specific red flag" },
    { "category": "Content", "flag": "specific red flag" }
  ]
}

If no indicators are found for a category, leave it out of the array.

Email to analyze:
Sender: ${sender}
Subject: ${subject}
Body: ${body}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("API Response:", data);
    console.log("Status:", response.status);
    console.log("Content:", data.content);
    console.log("Error:", data.error);
    const rawText = data.content[0].text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(rawText);

    displayResults(result);

  } catch (error) {
    alert("Something went wrong. Check your API key and try again.");
    console.error(error);
  } finally {
    analyzeBtn.textContent = "Analyze Email";
    analyzeBtn.disabled = false;
  }
});

function displayResults(result) {
  verdictBox.className = "verdict-box verdict-" + result.verdict;
  verdictLabel.textContent = result.verdict.toUpperCase();
  confidenceLabel.textContent = result.confidence + "% confidence";
  summaryEl.textContent = result.summary;

  indicatorsEl.innerHTML = "";
  result.indicators.forEach(indicator => {
    const card = document.createElement("div");
    card.className = "indicator-card";
    card.innerHTML = `
      <div class="indicator-category">${indicator.category}</div>
      <div class="indicator-flag">${indicator.flag}</div>
    `;
    indicatorsEl.appendChild(card);
  });

  resultsSection.style.display = "block";
}