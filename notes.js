class StaffPlayer {
  constructor() {
    this.audio = new (window.AudioContext || window.webkitAudioContext)()
    this.players = []

    const staff = document.querySelectorAll('.staff')
    this.populateStaff(staff[0], 'c', 15)
    this.populateStaff(staff[1], 'e', -5)

    const notes = document.querySelectorAll('.staff .note')
    notes.forEach((note, index) => {
      note.addEventListener('click', () => {
        new Player(note, this.audio).stopAfter(1)
      })

      note.addEventListener('touchstart', e => {
        this.players[index] = new Player(note, this.audio)
        e.preventDefault()
      })

      note.addEventListener('touchend', () => {
        if (this.players[index]) {
          this.players[index].stop()
          delete this.players[index]
        }
      })
    })

    const noteButtons = document.querySelectorAll('.notes > span')
    noteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const matchingNotes = document.querySelectorAll(`.staff .note[title="${button.textContent}"]`)
        matchingNotes.forEach(note => note.click())
      })
    })
  }

  populateStaff(staff, note, halfTones) {
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

      if (note === 'e' || note === 'b') halfTones++
      else halfTones += 2
      note = this.nextNote(note)
    }
  }

  nextNote(note) {
    note = String.fromCharCode(note.charCodeAt(0) + 1)
    if (note === 'h') note = 'a'
    return note
  }
}

class Player {
  constructor(note, audio) {
    this.note = note
    this.audio = audio
    this.freq = note.dataset.freq
    this.startTime = this.audio.currentTime
    this.note.classList.add('active')

    const gain = this.audio.createGain()
    const adjustedGain = Math.max(0.2, 440 / this.freq) * 5
    gain.gain.setValueAtTime(adjustedGain, this.startTime)
    gain.gain.exponentialRampToValueAtTime(adjustedGain * 0.5, this.startTime + 1)
    gain.connect(this.audio.destination)

    this.oscillator = this.audio.createOscillator()
    this.oscillator.connect(gain)
    this.oscillator.frequency.value = this.freq
    this.oscillator.type = 'sine'
    this.oscillator.start()

    const playingDisplay = document.querySelector('.playing')
    playingDisplay.style.display = 'block'
    playingDisplay.textContent = `${this.note.title} = ${this.freq}Hz`
    setTimeout(() => {
      playingDisplay.style.display = 'none'
    }, 1000)
  }

  stop() {
    const elapsed = this.audio.currentTime - this.startTime
    if (elapsed < 1) {
      this.stopAfter(1 - elapsed)
    } else {
      this.oscillator.stop()
      this.note.classList.remove('active')
    }
  }

  stopAfter(sec) {
    setTimeout(() => this.stop(), sec * 1000)
  }
}

new StaffPlayer()
