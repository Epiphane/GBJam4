Juicy.Game.init(document.getElementById('game-canvas'), 160, 144, {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    ESC: 27,
    ENTER: 13,

    W: 87,
    A: 65,
    S: 83,
    D: 68,
});

Palette.onchange.push(function(palette) {
    var canvas = document.getElementById('game-canvas');
    canvas.style.background = 'rgba(' + palette[3].join(',') +')';
})

var music = new Juicy.Music();
music.load('tutorial', 'audio/music_tutorial.mp3');
music.load('lvl1', 'audio/music_cave_in.mp3');
music.load('lvl2', 'audio/music_particles.mp3');
music.load('quake', 'audio/music_quake.mp3');

var sfx = new Juicy.SFX();
sfx.load('goal', 'audio/fx_jump.mp3');
sfx.load('quack', 'audio/fx_creature.wav');
sfx.load('textBonk', 'audio/text-impact.wav');

window.updateVolume(); // From state/options.js
document.addEventListener('DOMContentLoaded', function() {
    Juicy.Game.setState(new TutorialLevel()).run();
}, false);
