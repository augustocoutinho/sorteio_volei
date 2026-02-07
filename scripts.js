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

createGroupsBtn.onclick = () => {
  groupsSection.classList.remove("d-none")
  groupsContainer.innerHTML = ""

  for (let i = 1; i <= +groupsSelect.value; i++) {
    groupsContainer.innerHTML += `
      <div class="col-12 col-md-6">
        <div class="drop-zone p-2 border rounded">
          <strong>Grupo ${i}</strong>
        </div>
      </div>`
  }

  enableDragAndDrop()
}

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

generateTeamsBtn.onclick = () => {
  teamsContainer.innerHTML = ""
  alertBox.innerHTML = ""

  const players = [...groupsContainer.querySelectorAll(".player")]

  if (!players.length)
    return alertMsg("Arraste participantes para os grupos.")

  if (players.length > 24)
    return alertMsg("Máximo permitido: 24 participantes.", "danger")

  const women = players.filter(p => p.classList.contains("bg-info"))
  const warning = players.filter(p => p.classList.contains("bg-warning"))
  const others = players.filter(
    p => !p.classList.contains("bg-info") && !p.classList.contains("bg-warning")
  )

  const teamsQty = Math.ceil(players.length / 6)

  if (warning.length > teamsQty)
    return alertMsg("Participantes 'warning' demais para separar.", "danger")

  shuffle(women)
  shuffle(warning)
  shuffle(others)

  const teams = Array.from({ length: teamsQty }, () => [])

  warning.forEach((p, i) => {
    if (teams[i] && teams[i].length < 6)
      teams[i].push(p)
  })

  let wi = 0
  for (const w of women) {
    let attempts = 0
    while (
      teams[wi].filter(p => p.classList.contains("bg-info")).length >= 2 ||
      teams[wi].length >= 6
    ) {
      wi = (wi + 1) % teamsQty
      attempts++
      if (attempts > teamsQty) break
    }
    if (teams[wi].length < 6)
      teams[wi].push(w)
  }

  for (const p of others) {
    const team = teams.find(t => t.length < 6)
    if (!team) break
    team.push(p)
  }

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
      </ul>`

    teamsContainer.appendChild(div)
  })

  teamsContainer.scrollIntoView({ behavior: "smooth" })
}


enableDragAndDrop()
