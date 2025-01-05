// define.js

// Create a container for the popup bubble:
const popup = document.createElement("div");
popup.id = "definition-popup";
popup.style.display = "none"; // hidden by default
document.body.appendChild(popup);

// Listen for double-click events on the page:
document.addEventListener("dblclick", async (event) => {
  // Get the selected text (or the word under mouse if needed)
  const selection = window.getSelection().toString().trim();

  // If there is no selection, do nothing
  if (!selection) return;

  // Position the popup near the cursor:
  const { pageX, pageY } = event;
  popup.style.left = `${pageX + 5}px`;
  popup.style.top = `${pageY + 5}px`;

  // Fetch the definition for the selected word:
  try {
    const definition = await fetchDefinition(selection);
    popup.innerHTML = definition;
    popup.style.display = "block";
  } catch (error) {
    popup.innerHTML = `No definition found for "${selection}".`;
    popup.style.display = "block";
  }
});

// Hide the popup if user clicks elsewhere:
document.addEventListener("click", (event) => {
  // If the popup is visible and the user didn't click inside it on purpose:
  if (popup.style.display === "block" && !popup.contains(event.target)) {
    popup.style.display = "none";
  }
});


/**
 * Fetches the definition of a word from dictionaryapi.dev service.
 *
 * @param {string} word - The word to define.
 * @return {Promise<string>} - A promise that resolves to a string (HTML or plain text).
 */

async function fetchDefinition(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch definition. Status: ${response.status}`);
  }

  const data = await response.json();
  let definitionText = `<strong>${word}</strong>`; // Add word as title

  if (data && data[0] && data[0].meanings) {
    const meanings = data[0].meanings;
    let definitionsIncluded = 0;

    for (const meaning of meanings) {
      if (definitionsIncluded >= 3) break; // Limit to 3 definitions
      const partOfSpeech = meaning.partOfSpeech;

      // Add the part of speech
      definitionText += `<em>${partOfSpeech}</em>`;

      // At least 2 definitions per part of speech
      for (const definition of meaning.definitions) {
        if (definitionsIncluded >= 3) break; // Limit total definitions
        const def = definition.definition;
        definitionText += `<div class="definition">- ${def}</div>`;
        definitionsIncluded++;
      }
    }
  } else {
    definitionText = `<strong>${word}</strong><br/><div class="definition">No definition found.</div>`;
  }

  // Added a close button
  definitionText += `<button class="close-btn" onclick="document.getElementById('definition-popup').style.display='none'">×</button>`;

  return definitionText;
}
