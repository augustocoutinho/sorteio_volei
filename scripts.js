const playersPool = document.getElementById("playersPool");
const playerInput = document.getElementById("playerInput");
const groupsContainer = document.getElementById("groupsContainer");
const generateTeamsBtn = document.getElementById("generateTeamsBtn");
const teamsContainer = document.getElementById("teamsContainer");

let draggedPlayer = null;

document.addEventListener("DOMContentLoaded", () => {
  createFixedGroups();
  distributePlayersByColor();
  enableDragAndDrop();
});

playerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();

    const name = playerInput.value.trim();
    if (!name) return;

    const span = document.createElement("span");
    span.className = "badge player text-white bg-secondary m-1";
    span.draggable = true;
    span.textContent = name;

    playersPool.insertBefore(span, playerInput);
    playerInput.value = "";

    enableDragAndDrop();
  }
});

playersPool.addEventListener("click", () => {
  playerInput.focus();
});

function createFixedGroups() {
  groupsContainer.innerHTML = "";

  for (let i = 1; i <= 4; i++) {
    const row = document.createElement("div");
    row.className = "col-12";

    row.innerHTML = `
      <div class="drop-zone p-3 rounded mb-3" data-group="${i}">
        <h6 class="mb-2">Grupo ${i}</h6>
      </div>
    `;

    groupsContainer.appendChild(row);
  }
}

function distributePlayersByColor() {
  const zones = document.querySelectorAll(".drop-zone");

  document.querySelectorAll(".player").forEach(player => {
    if (player.classList.contains("bg-primary")) {
      zones[0].appendChild(player);
    } else if (player.classList.contains("bg-info")) {
      zones[1].appendChild(player);
    } else if (player.classList.contains("bg-warning")) {
      zones[2].appendChild(player);
    } else if (player.classList.contains("bg-dark")) {
      zones[3].appendChild(player);
    }
  });
}

function enableDragAndDrop() {
  const players = document.querySelectorAll(".player");
  const zones = document.querySelectorAll(".drop-zone");

  players.forEach(player => {
    player.addEventListener("dragstart", () => {
      draggedPlayer = player;
      setTimeout(() => player.classList.add("opacity-50"), 0);
    });

    player.addEventListener("dragend", () => {
      draggedPlayer = null;
      player.classList.remove("opacity-50");
    });
  });

  zones.forEach(zone => {
    zone.addEventListener("dragover", e => {
      e.preventDefault();
      zone.style.borderColor = "#0d6efd";
    });

    zone.addEventListener("dragleave", () => {
      zone.style.borderColor = "#dee2e6";
    });

    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.style.borderColor = "#dee2e6";

      if (draggedPlayer) {
        zone.appendChild(draggedPlayer);
      }
    });
  });
}

playersPool.addEventListener("dragover", e => {
  e.preventDefault();
  playersPool.style.borderColor = "#0d6efd";
});

playersPool.addEventListener("dragleave", () => {
  playersPool.style.borderColor = "#dee2e6";
});

playersPool.addEventListener("drop", e => {
  e.preventDefault();
  playersPool.style.borderColor = "#dee2e6";

  if (draggedPlayer) {
    playersPool.insertBefore(draggedPlayer, playerInput);
  }
});

generateTeamsBtn.addEventListener("click", () => {
  teamsContainer.innerHTML = "";

  const groups = Array.from(document.querySelectorAll(".drop-zone"))
    .map(zone =>
      Array.from(zone.querySelectorAll(".player")).map(p => p.textContent)
    );

  const totalPlayers = groups.flat().length;

  if (totalPlayers === 0) {
    alert("Não há jogadores nos grupos.");
    return;
  }

  const shuffledGroups = groups.map(g => shuffle([...g]));
  const teams = [];

  while (shuffledGroups.some(g => g.length > 0)) {
    const team = [];

    while (team.length < 6 && shuffledGroups.some(g => g.length > 0)) {
      for (const g of shuffledGroups) {
        if (g.length && team.length < 6) {
          team.push(g.shift());
        }
      }
    }

    teams.push(team);
  }

  renderTeams(teams);
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderTeams(teams) {
  teams.forEach((team, index) => {
    const div = document.createElement("div");
    div.className = "mb-3 p-3 border rounded";

    div.innerHTML = `
      <h6>
        Time ${index + 1}
        ${team.length < 6
          ? `<span class="badge bg-warning text-dark ms-2">quebrado</span>`
          : ""}
      </h6>
      <ul class="mb-0">
        ${team.map(p => `<li>${p}</li>`).join("")}
      </ul>
    `;

    teamsContainer.appendChild(div);
  });
}
