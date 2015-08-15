Juicy.Game.init(document.getElementById('game-canvas'), 160, 144, {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    ESC: 27,

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
music.load('lvl1', 'audio/music_cave_in.mp3');
music.load('lvl2', 'audio/music_particles.mp3');

var sfx = new Juicy.SFX();
sfx.load('goal', 'audio/fx_jump.mp3');
sfx.load('quack', 'audio/fx_creature.wav');

document.addEventListener('DOMContentLoaded', function() {
    Juicy.Game.setState(new InfiniteLevel({})).run();
}, false);
