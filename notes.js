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

$('.staff .note').on('click', function() {
  var note = $(this).addClass('active');
  var freq = note.data('freq');
  var now = audio.currentTime;

  var gain = audio.createGain();
  gain.gain.setValueAtTime(1, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 1);
  gain.connect(audio.destination);

  var oscillator = audio.createOscillator();
  oscillator.connect(gain);
  oscillator.frequency.value = freq;
  oscillator.type = 'square';
  oscillator.start();
  oscillator.stop(now + 1);

  $('.playing').show().text(this.title + ' = ' + freq + 'Hz').fadeOut(1000);
  setTimeout(function() {
    note.removeClass('active');
  }, 1000);
});

$('.notes > span').on('click', function() {
  $('.staff .note[title=' + this.textContent + ']').trigger('click');
});