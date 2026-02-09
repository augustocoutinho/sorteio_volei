const $ = id => document.getElementById(id)

const playersPool = $("playersPool")
const playerInput = $("playerInput")
const groupsContainer = $("groupsContainer")
const groupsSection = $("groupsSection")
const groupsSelect = $("groupsSelect")
const teamsContainer = $("teamsContainer")
const alertBox = $("alertBox")
const createGroupsBtn = $("createGroupsBtn")
const generateTeamsBtn = $("generateTeamsBtn")

let draggedPlayer = null

const alertMsg = (msg, type = "warning") => {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${msg}
      <button class="btn-close" data-bs-dismiss="alert"></button>
    </div>`
}

const shuffle = arr => arr.sort(() => Math.random() - 0.5)

function enableDragAndDrop() {
  document.querySelectorAll(".player").forEach(p => {
    p.ondragstart = () => draggedPlayer = p
    p.ondragend = () => draggedPlayer = null
  })

  document.querySelectorAll(".drop-zone, #playersPool").forEach(z => {
    z.ondragover = e => e.preventDefault()
    z.ondrop = () => {
      if (!draggedPlayer) return
      z.id === "playersPool"
        ? z.insertBefore(draggedPlayer, playerInput)
        : z.appendChild(draggedPlayer)
    }
  })
}

/* 🔹 CRIAR / EXPANDIR GRUPOS */
createGroupsBtn.onclick = () => {
  groupsSection.classList.remove("d-none")

  const desiredQty = +groupsSelect.value
  const existingGroups = groupsContainer.querySelectorAll(".drop-zone").length

  if (desiredQty < existingGroups) {
    groupsContainer.innerHTML = ""
  }

  const startIndex = groupsContainer.querySelectorAll(".drop-zone").length

  for (let i = startIndex + 1; i <= desiredQty; i++) {
    const col = document.createElement("div")
    col.className = "col-12 col-md-6"
    col.innerHTML = `
      <div class="drop-zone">
        <strong>Grupo ${i}</strong>
      </div>
    `
    groupsContainer.appendChild(col)
  }

  enableDragAndDrop()
}

/* 🔹 ADICIONAR PARTICIPANTE */
playerInput.onkeydown = e => {
  if (e.key !== "Enter") return

  const name = playerInput.value.trim()
  if (!name) return

  const s = document.createElement("span")
  s.className = "badge player bg-secondary"
  s.draggable = true
  s.textContent = name

  playersPool.insertBefore(s, playerInput)
  playerInput.value = ""

  enableDragAndDrop()
}

/* 🔹 GERAR TIMES (REGRAS AJUSTADAS) */
generateTeamsBtn.onclick = () => {
  teamsContainer.innerHTML = ""
  alertBox.innerHTML = ""

  const players = [...groupsContainer.querySelectorAll(".player")]

  if (!players.length)
    return alertMsg("Arraste participantes para os grupos.")

  if (players.length > 24)
    return alertMsg("Máximo permitido: 24 participantes.", "danger")

  const women = players.filter(p => p.classList.contains("bg-info"))
  const setters = players.filter(p => p.classList.contains("bg-warning"))
  const others = players.filter(
    p => !p.classList.contains("bg-info") && !p.classList.contains("bg-warning")
  )

  const teamsQty = Math.ceil(players.length / 6)

  if (setters.length > teamsQty)
    return alertMsg("Há mais levantadores do que times.", "danger")

  shuffle(women)
  shuffle(setters)
  shuffle(others)

  const teams = Array.from({ length: teamsQty }, () => [])

  /* 1️⃣ UM LEVANTADOR POR TIME */
  setters.forEach((p, i) => {
    teams[i].push(p)
  })

  /* 2️⃣ UMA MULHER POR TIME (SE HOUVER) */
  for (let i = 0; i < teamsQty && women.length; i++) {
    teams[i].push(women.shift())
  }

  /* 3️⃣ MULHERES EXTRAS (SÓ SE > 4 NO TOTAL, MÁX 2 POR TIME) */
  if (players.filter(p => p.classList.contains("bg-info")).length > 4) {
    let idx = 0
    while (women.length) {
      const team = teams[idx]
      const womenInTeam = team.filter(p => p.classList.contains("bg-info")).length

      if (team.length < 6 && womenInTeam < 2) {
        team.push(women.shift())
      }

      idx = (idx + 1) % teamsQty

      if (idx === 0 && women.length) break
    }
  }

  /* 4️⃣ COMPLETAR COM OUTROS */
  for (const p of others) {
    const team = teams.find(t => t.length < 6)
    if (!team) break
    team.push(p)
  }

  /* 5️⃣ RENDER */
  teams.forEach((team, i) => {
    const broken = i === teams.length - 1 && team.length < 6

    const div = document.createElement("div")
    div.className = "team-card mb-3"
    div.innerHTML = `
      <h6>
        Time ${i + 1}
        ${broken ? `<span class="badge bg-warning ms-2">quebrado</span>` : ""}
      </h6>
      <ul class="mb-0">
        ${team.map(p => `<li>${p.textContent}</li>`).join("")}
      </ul>
    `
    teamsContainer.appendChild(div)
  })

  teamsContainer.scrollIntoView({ behavior: "smooth" })
}

enableDragAndDrop()
