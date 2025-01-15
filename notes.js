const staff = document.querySelectorAll('.staff')

populateStaff(staff[0], 'c', 15)
populateStaff(staff[1], 'e', -5)

function populateStaff(staff, note, halfTones) {
  const halfToneBase = Math.pow(2, 1 / 12)
  for (let i = -3; i < 10; i++) {
    let freq = 110 * Math.pow(halfToneBase, halfTones)
    freq = Math.round(freq * 100) / 100

    const noteDiv = document.createElement('div')
    noteDiv.className = 'note'
    noteDiv.style.top = -0.095 * i + 'em'
    noteDiv.style.left = 3 + (i / 4) * 3 + 'em'
    noteDiv.setAttribute('title', note)
    noteDiv.dataset.freq = freq
    staff.appendChild(noteDiv)

    if (note === 'e' || note === 'b') {
      halfTones++
    } else {
      halfTones += 2
    }
    note = nextNote(note)
  }
}

function nextNote(note) {
  note = String.fromCharCode(note.charCodeAt(0) + 1)
  if (note === 'h') note = 'a'
  return note
}

const audio = new (window.AudioContext || window.webkitAudioContext)()
const players = []

const notes = document.querySelectorAll('.staff .note')
notes.forEach((note, index) => {
  note.addEventListener('click', () => {
    new Player(note).stopAfter(1)
  })

  note.addEventListener('touchstart', e => {
    players[index] = new Player(note)
    e.preventDefault()
  })

  note.addEventListener('touchend', () => {
    if (players[index]) {
      players[index].stop()
      delete players[index]
    }
  })
})

const noteButtons = document.querySelectorAll('.notes > span')
noteButtons.forEach(button => {
  button.addEventListener('click', () => {
    const matchingNotes = document.querySelectorAll(`.staff .note[title="${button.textContent}"]`)
    matchingNotes.forEach(note => {
      note.click()
    })
  })
})

function Player(note) {
  const pub = this
  pub.freq = note.dataset.freq
  note.classList.add('active')
  const startTime = audio.currentTime

  const gain = audio.createGain()
  gain.gain.setValueAtTime(1, startTime)
  gain.gain.exponentialRampToValueAtTime(0.5, startTime + 1)
  gain.connect(audio.destination)

  const oscillator = audio.createOscillator()
  oscillator.connect(gain)
  oscillator.frequency.value = pub.freq
  oscillator.type = 'square'
  oscillator.start()

  const playingDisplay = document.querySelector('.playing')
  playingDisplay.style.display = 'block'
  playingDisplay.textContent = note.title + ' = ' + pub.freq + 'Hz'
  setTimeout(() => {
    playingDisplay.style.display = 'none'
  }, 1000)

  this.stop = function() {
    const elapsed = audio.currentTime - startTime
    if (elapsed < 1) {
      pub.stopAfter(1 - elapsed)
    } else {
      oscillator.stop()
      note.classList.remove('active')
    }
  }

  this.stopAfter = function(sec) {
    setTimeout(pub.stop, sec * 1000)
  }
}
