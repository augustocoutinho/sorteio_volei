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

  // 🔴 Se diminuir quantidade, recria tudo
  if (desiredQty < existingGroups) {
    groupsContainer.innerHTML = ""
  }

  const startIndex = groupsContainer.querySelectorAll(".drop-zone").length

  // 🟢 Cria apenas os grupos faltantes
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

/* 🔹 GERAR TIMES */
generateTeamsBtn.onclick = () => {
  teamsContainer.innerHTML = ""
  alertBox.innerHTML = ""

  const players = [...groupsContainer.querySelectorAll(".player")]

  if (!players.length)
    return alertMsg("Arraste participantes para os grupos.")

  if (players.length > 24)
    return alertMsg("Máximo permitido: 24 participantes.", "danger")

  shuffle(players)

  const teamsQty = Math.ceil(players.length / 6)
  const teams = Array.from({ length: teamsQty }, () => [])

  players.forEach(p => {
    const team = teams.find(t => t.length < 6)
    if (team) team.push(p)
  })

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
