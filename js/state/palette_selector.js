(function() {
    Palette.current = localStorage.getItem('palette');
    if (!Palette.current) {
        Palette.set();
        palette = Palette.current;

        savePaletteChoice();
    }
    else {
        Palette.set(Palette.current);
    }

    function savePaletteChoice() {
        localStorage.setItem('palette', Palette.current);
    };

    window.PaletteSelector = PauseState.extend({
        constructor: function(nextState) {
            PauseState.call(this, nextState, []);
        
            this.original = Palette.current;
            this.menu_choice = Palette.current;

            var menu_pos = Juicy.Point.create(this.menu_left + 10, this.menu_top + 25);

            var numPalettes = Palette.numPalettes();
            for (var i = 0; i < numPalettes; i ++) {
                this.menu_items[i] = {
                    text: this.ui.addText({
                        text: (i + 1) + '',
                        brightness: 3,
                        position: menu_pos.add(20 * (i % 5), 10 * Math.floor(i / 5)),
                        showBackground: true
                    })
                };
            }
        },

        init: function() {
            PauseState.prototype.init.apply(this, arguments);
        },

        updatePalette: function() {
            Palette.set(this.menu_choice);
        },

        key_ESC: function() {
            Palette.set(this.original);

            PauseState.prototype.key_ESC.apply(this, arguments);
        },

        key_ENTER: function() {
            savePaletteChoice();

            PauseState.prototype.key_ESC.apply(this, arguments);
        },

        key_UP: function() {
            for (var i = 0; i < 5; i ++) PauseState.prototype.key_UP.apply(this, arguments);

            this.updatePalette();
        },

        key_DOWN: function() {
            for (var i = 0; i < 5; i ++) PauseState.prototype.key_DOWN.apply(this, arguments);

            this.updatePalette();
        },

        key_LEFT: function() {
            PauseState.prototype.key_UP.apply(this, arguments);

            this.updatePalette();
        },

        key_RIGHT: function() {
            PauseState.prototype.key_DOWN.apply(this, arguments);

            this.updatePalette();
        },
    });
})();