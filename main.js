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
music.load('tutorial', 'audio/music_tutorial');
music.load('lvl1', 'audio/music_cave_in');
music.load('lvl2', 'audio/music_particles');
music.load('quake', 'audio/music_quake');
music.load('city', 'audio/music_industrial');
music.load('title', 'audio/music_quicksilver');

var sfx = new Juicy.SFX();
sfx.load('goal', 'audio/fx_jump');
sfx.load('quack', 'audio/fx_creature');
sfx.load('textBonk', 'audio/text-impact');
sfx.load('textBeep', 'audio/text-beep');

window.updateVolume(); // From state/options.js

function newGame() {
    localStorage.removeItem('tutorial');
    localStorage.removeItem('altar');

    startGame();
};

function startGame() {
    Palette.set();

    Juicy.Game.setState(new TitleScreen()).run();
}

document.addEventListener('DOMContentLoaded', startGame, false);
