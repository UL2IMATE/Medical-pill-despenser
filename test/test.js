async function getData() {
  const nameInput = document.getElementById("input");
  const ageElement = document.getElementById("Age");
  const bountyElement = document.getElementById("bounty");
  const fruitElement = document.getElementById("fruit");
  const descriptionElement = document.getElementById("description");
  const sizeElement = document.getElementById("size");
  const jobElement = document.getElementById("job");
  const statusElement = document.getElementById("status");

  const query = nameInput.value.trim();
  if (!query) {
    alert("Please enter a character name.");
    return;
  }

  try {
    const response = await fetch(
      `https://api.api-onepiece.com/v2/characters/en/search/?name=${encodeURIComponent(query)}`,
    );
    const data = await response.json();
    const character = Array.isArray(data) ? data[0] : data;

    if (!character || typeof character !== "object") {
      alert("No character found.");
      return;
    }

    console.log(character);

    const { age, bounty, size, job, status } = character;

    const fruitName = character.fruit?.name || character.fruit?.[0]?.name || "";
    const fruitType = character.fruit?.type || character.fruit?.[0]?.type || "";
    ageElement.textContent = age || "";
    bountyElement.textContent = bounty || "";
    fruitElement.textContent = fruitName;
    descriptionElement.textContent = fruitType;
    sizeElement.textContent = size || "";
    jobElement.textContent = job || "";
    statusElement.textContent = status || "";

    nameInput.value = "";
  } catch (e) {
    console.error("Fetch error:", e);
    alert("Error fetching data. Try again later.");
  }
}

const button = document.getElementById("button");
button.addEventListener("click", getData);

const input = document.getElementById("input");

input.addEventListener("keypress", function (e) {
  if (e.key == "Enter") getData();
});
