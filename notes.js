var staff = $('.staff');
populateStaff(staff.eq(0), 'c', 15);
populateStaff(staff.eq(1), 'e', -5);

function populateStaff(staff, note, halfTones) {
  var halfToneBase = Math.pow(2, 1/12);
  for (var i = -3; i < 10; i++) {
    var freq = 110 * Math.pow(halfToneBase, halfTones);
    freq = Math.round(freq * 100) / 100;
    $('<div class="note"></div>').appendTo(staff)
      .css({top: -0.095 * i + 'em', left: 3 + i / 4 * 3 + 'em'})
      .attr('title', note).data('freq', freq);
    if (note == 'e' || note == 'b') halfTones++; else halfTones+=2;
    note = nextNote(note);
  }
}

function nextNote(note) {
  note = String.fromCharCode(note.charCodeAt(0) + 1);
  if (note == 'h') note = 'a';
  return note;
}

var audio = new (window.AudioContext || window.webkitAudioContext)();
var players = [];

var notes = $('.staff .note');
notes.on('click', function() {
  new Player($(this)).stopAfter(1);
});
notes.on('touchstart', function(e) {
  var note = $(this);
  players[note.index()] = new Player(note);
  return false;
});
notes.on('touchend', function() {
  var note = $(this);
  var i = note.index();
  players[i].stop();
  delete players[i];
  return false;
});

$('.notes > span').on('click', function() {
  $('.staff .note[title=' + this.textContent + ']').trigger('click');
});

function Player(note) {
  note.addClass('active');
  this.freq = note.data('freq');
  var now = audio.currentTime;

  var gain = audio.createGain();
  gain.gain.setValueAtTime(1, now);
  gain.gain.exponentialRampToValueAtTime(0.5, now + 1);
  gain.connect(audio.destination);

  var oscillator = audio.createOscillator();
  oscillator.connect(gain);
  oscillator.frequency.value = this.freq;
  oscillator.type = 'square';
  oscillator.start();

  $('.playing').show().text(note[0].title + ' = ' + this.freq + 'Hz').fadeOut(1000);

  this.stop = function() {
    oscillator.stop();
    note.removeClass('active');
  };

  this.stopAfter = function(sec) {
    setTimeout(this.stop, sec * 1000);
  }
}
