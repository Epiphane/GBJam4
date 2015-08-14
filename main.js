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

document.addEventListener('DOMContentLoaded', function() {
    Juicy.Game.setState(new GameState(4)).run();
}, false);
