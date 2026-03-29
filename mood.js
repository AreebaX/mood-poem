
const moods = {
  Rain:     { bg: "#4A6274", mid: "#3A5264", deep: "#2A3F50", text: "#D6EAF8" },
  Fire:     { bg: "#C4785A", mid: "#B8633F", deep: "#8B4A2F", text: "#FFF0E8" },
  Calm:     { bg: "#6B8F71", mid: "#537A5A", deep: "#3B5940", text: "#EAF4EB" },
  Midnight: { bg: "#3B3355", mid: "#2E2645", deep: "#1E1830", text: "#E8E0F0" },
};


const prompts = {
  Rain:     ["petrichor", "window", "grey", "dripping", "solitude"],
  Fire:     ["ember", "hunger", "restless", "consume", "glow"],
  Calm:     ["still", "breathe", "moss", "drifting", "open"],
  Midnight: ["hollow", "echo", "unseen", "threshold", "ink"],
};


const hints = {
  Rain: [
    "Try describing a sound you hear when it rains.",
    "Write about something you lost, like rain washes things away.",
    "Use short lines — rain falls in drops, not waves.",
  ],
  Fire: [
    "Write about something you want badly.",
    "Use active, urgent verbs — burn, reach, demand.",
    "Try writing a poem that gets shorter as it goes, like a flame dying.",
  ],
  Calm: [
    "Describe a place where time feels slow.",
    "Use long, soft sentences with natural imagery.",
    "Write about breathing — in, out, pause.",
  ],
  Midnight: [
    "Write about something unsaid.",
    "Use negative space — what is absent, not present.",
    "Try starting each line with a question.",
  ],
};


const buttons    = document.querySelectorAll(".moods button");
const promptEl   = document.querySelector(".prompt span");
const textarea   = document.getElementById("poem-body");
const titleInput = document.getElementById("poem-title");
const wordCount  = document.getElementById("word-count");
const helpBtn    = document.getElementById("help-btn");
const helpPanel  = document.getElementById("help-panel");
const helpList   = document.getElementById("help-list");
const saveBtn    = document.getElementById("save-btn");
const copyBtn    = document.getElementById("copy-btn");
const clearBtn   = document.getElementById("clear-btn");
const savedList  = document.getElementById("saved-list");

let currentMood = "Fire";


function randomWord(mood) {
  const list = prompts[mood];
  return list[Math.floor(Math.random() * list.length)];
}


function applyMood(mood) {
  const theme = moods[mood];
  document.body.style.background = theme.bg;
  document.body.style.color      = theme.text;
  document.querySelector("header").style.borderColor          = theme.deep;
  document.querySelector(".prompt").style.background          = theme.mid;
  document.querySelector(".editor textarea").style.background = theme.mid;
  promptEl.textContent = randomWord(mood);
  currentMood = mood;

  helpList.innerHTML = "";
  hints[mood].forEach(hint => {
    const li = document.createElement("li");
    li.textContent = hint;
    helpList.appendChild(li);
  });
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyMood(btn.textContent);
  });
});

textarea.addEventListener("input", () => {
  const text  = textarea.value.trim();
  const count = text === "" ? 0 : text.split(/\s+/).length;
  wordCount.textContent = count + " words";
  localStorage.setItem("draft", textarea.value);
  localStorage.setItem("draft-title", titleInput.value);
});

titleInput.addEventListener("input", () => {
  localStorage.setItem("draft-title", titleInput.value);
});


window.addEventListener("load", () => {
  const savedDraft = localStorage.getItem("draft");
  const savedTitle = localStorage.getItem("draft-title");
  if (savedDraft) textarea.value = savedDraft;
  if (savedTitle) titleInput.value = savedTitle;
  renderSaved();
});

helpBtn.addEventListener("click", () => {
  helpPanel.classList.toggle("open");
  helpBtn.textContent = helpPanel.classList.contains("open") ? "Close" : "Help";
});


function renderSaved() {
  const poems = JSON.parse(localStorage.getItem("poems") || "[]");
  savedList.innerHTML = "";
  poems.forEach((poem, index) => {
    const card = document.createElement("div");
    card.className = "saved-card";
    card.innerHTML = `
      <div>
        <p class="saved-card-title">${poem.title || "Untitled"}</p>
        <p class="saved-card-meta">${poem.mood} · ${poem.words} words</p>
      </div>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) return;
      titleInput.value = poem.title;
      textarea.value   = poem.body;
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
      poems.splice(index, 1);
      localStorage.setItem("poems", JSON.stringify(poems));
      renderSaved();
    });
    savedList.appendChild(card);
  });
}


saveBtn.addEventListener("click", () => {
  const text = textarea.value.trim();
  if (!text) return;
  const poems = JSON.parse(localStorage.getItem("poems") || "[]");
  const count = text.split(/\s+/).length;
  poems.unshift({
    title: titleInput.value || "Untitled",
    body:  textarea.value,
    mood:  currentMood,
    words: count,
  });
  localStorage.setItem("poems", JSON.stringify(poems));
  renderSaved();
});

copyBtn.addEventListener("click", () => {
  const full = (titleInput.value ? titleInput.value + "\n\n" : "") + textarea.value;
  navigator.clipboard.writeText(full).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 2000);
  });
});

clearBtn.addEventListener("click", () => {
  if (confirm("Clear the current poem?")) {
    textarea.value        = "";
    titleInput.value      = "";
    wordCount.textContent = "0 words";
    localStorage.removeItem("draft");
    localStorage.removeItem("draft-title");
  }
});

applyMood("Fire");