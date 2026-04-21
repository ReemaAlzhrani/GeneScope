const geneInput = document.getElementById("geneInput");
const countSelect = document.getElementById("countSelect");

const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const clearBtn = document.getElementById("clearBtn");

const message = document.getElementById("message");
const results = document.getElementById("results");

const exampleGenes = ["BRCA1", "TP53", "EGFR", "APOE", "MTOR", "CFTR"];
const BASE_URL = "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search";

function showMessage(text, type = "normal") {
  message.textContent = text;
  message.className = "message " + type;
}

function clearResults() {
  results.innerHTML = "";
}

function showEmptyBox(text) {
  clearResults();
  results.innerHTML = `<div class="empty-box">${text}</div>`;
}

function buildUrl() {
  const term = geneInput.value.trim();
  const count = countSelect.value;

  const params = new URLSearchParams({
    terms: term,
    count: count,
    df: "Symbol,description,chromosome,map_location,type_of_gene",
    ef: "GeneID,HGNC_ID,Synonyms,na_name"
  });

  return `${BASE_URL}?${params.toString()}`;
}

function createCard(item) {
  const symbol = item.display[0] || "N/A";
  const description = item.display[1] || "N/A";
  const chromosome = item.display[2] || "N/A";
  const mapLocation = item.display[3] || "N/A";
  const geneType = item.display[4] || "N/A";

  const geneId = item.extra.GeneID || "N/A";
  const hgnc = item.extra.HGNC_ID || "N/A";
  const officialName = item.extra.na_name || "N/A";

  let synonyms = "N/A";
  if (item.extra.Synonyms && item.extra.Synonyms !== "-") {
    synonyms = item.extra.Synonyms;
  }

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-header">
      <h3>${symbol}</h3>
      <span class="badge">${geneType}</span>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h4>Description</h4>
        <p>${description}</p>
      </div>

      <div class="info-box">
        <h4>Gene ID</h4>
        <p>${geneId}</p>
      </div>

      <div class="info-box">
        <h4>Chromosome</h4>
        <p>${chromosome}</p>
      </div>

      <div class="info-box">
        <h4>Map Location</h4>
        <p>${mapLocation}</p>
      </div>

      <div class="info-box">
        <h4>HGNC ID</h4>
        <p>${hgnc}</p>
      </div>

      <div class="info-box">
        <h4>Official Name</h4>
        <p>${officialName}</p>
      </div>

      <div class="info-box">
        <h4>Synonyms</h4>
        <p>${synonyms}</p>
      </div>
    </div>
  `;

  results.appendChild(card);
}

function isValidGeneInput(term) {
  return /^[a-zA-Z0-9-]+$/.test(term);
}

async function searchGene() {
  const term = geneInput.value.trim();

  if (term === "") {
    showMessage("Please enter a gene symbol.", "error");
    showEmptyBox("No gene data to display.");
    return;
  }

  if (!isValidGeneInput(term)) {
    showMessage("Invalid input. Use letters, numbers, or hyphen only.", "error");
    showEmptyBox("Invalid gene symbol.");
    return;
  }

  showMessage("Loading...", "normal");
  clearResults();

  try {
    const response = await fetch(buildUrl());

    if (!response.ok) {
      throw new Error("Failed to fetch gene data.");
    }

    const data = await response.json();

    const extra = data[2];
    const display = data[3];

    if (!display || display.length === 0) {
      showMessage("No gene was found.", "error");
      showEmptyBox("Try another gene symbol.");
      return;
    }

    showMessage(`Found ${display.length} result(s).`, "success");

    for (let i = 0; i < display.length; i++) {
      createCard({
        display: display[i],
        extra: {
          GeneID: extra?.GeneID?.[i] ?? "N/A",
          HGNC_ID: extra?.HGNC_ID?.[i] ?? "N/A",
          Synonyms: extra?.Synonyms?.[i] ?? "N/A",
          na_name: extra?.na_name?.[i] ?? "N/A"
        }
      });
    }
  } catch (error) {
    console.error(error);
    showMessage("Something went wrong while fetching data.", "error");
    showEmptyBox("Check your internet connection and try again.");
  }
}

function randomExampleSearch() {
  const randomGene = exampleGenes[Math.floor(Math.random() * exampleGenes.length)];
  geneInput.value = randomGene;
  searchGene();
}

function clearAll() {
  geneInput.value = "";
  countSelect.value = "3";
  showMessage("Enter a gene symbol to begin.", "normal");
  showEmptyBox("Your gene cards will appear here.");
}

searchBtn.addEventListener("click", searchGene);
randomBtn.addEventListener("dblclick", randomExampleSearch);
clearBtn.addEventListener("click", clearAll);

geneInput.addEventListener("keyup", function () {
  showMessage("Typing...", "normal");
});

countSelect.addEventListener("change", function () {
  showMessage("Results count changed.", "normal");
});

showEmptyBox("Your gene cards will appear here.");