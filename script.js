const symptomGrid = document.getElementById("symptomGrid");
const searchInput = document.getElementById("symptomSearch");
const countLabel = document.getElementById("selectedCount");
const resultBox = document.getElementById("result");
const predictButton = document.getElementById("predictButton");
const clearButton = document.getElementById("clearButton");

const API_URL = "https://disease-prediction-api-2026-ajcpgdghb5eda2bp.eastasia-01.azurewebsites.net/api/predict";

// Load symptoms from JSON file
async function loadSymptoms() {
    try {
        const response = await fetch("static/symptoms.json");

        if (!response.ok) {
            throw new Error("Could not load symptoms.");
        }

        const symptoms = await response.json();

        symptomGrid.innerHTML = "";

        symptoms
            .filter(symptom => symptom !== "Unnamed: 133")
            .forEach(symptom => {
                const label = document.createElement("label");
                label.className = "symptom";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = symptom;

                const span = document.createElement("span");
                span.textContent = symptom.replaceAll("_", " ").trim();

                label.appendChild(checkbox);
                label.appendChild(span);
                symptomGrid.appendChild(label);
            });

    } catch (error) {
        symptomGrid.textContent = error.message;
    }
}

function selectedSymptoms() {
    return [...symptomGrid.querySelectorAll(
        'input[type="checkbox"]:checked'
    )].map(box => box.value);
}

function updateCount() {
    countLabel.textContent = `${selectedSymptoms().length} selected`;
}

symptomGrid.addEventListener("change", updateCount);

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    symptomGrid.querySelectorAll(".symptom").forEach(label => {
        label.hidden = !label.textContent.toLowerCase().includes(query);
    });
});

clearButton.addEventListener("click", () => {
    symptomGrid.querySelectorAll('input[type="checkbox"]')
        .forEach(box => box.checked = false);

    updateCount();
    resultBox.hidden = true;
});

predictButton.addEventListener("click", async () => {
    const symptoms = selectedSymptoms();

    resultBox.hidden = false;

    if (!symptoms.length) {
        resultBox.textContent = "Please select at least one symptom.";
        return;
    }

    predictButton.disabled = true;
    predictButton.textContent = "Predicting...";
    resultBox.textContent = "Processing your selected symptoms...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symptoms })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Prediction failed.");
        }

        resultBox.innerHTML = `
            <h3>Model prediction</h3>
            <div class="prediction"></div>
            <div class="disclaimer"></div>
        `;

        resultBox.querySelector(".prediction").textContent =
            data.prediction.replaceAll("_", " ");

        resultBox.querySelector(".disclaimer").textContent =
            data.disclaimer;

    } catch (error) {
        resultBox.textContent = error.message;
    } finally {
        predictButton.disabled = false;
        predictButton.innerHTML = 'Predict <span>→</span>';
    }
});

loadSymptoms();