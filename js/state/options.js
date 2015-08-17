(function() {
    var volume = JSON.parse(localStorage.getItem('volume')) || {
        music: 4,
        sfx: 3
    };

    window.updateVolume = function() {
        if (volume.music < 0)  volume.music = 0;
        if (volume.sfx < 0)    volume.sfx = 0;
        if (volume.music > 10) volume.music = 10;
        if (volume.sfx > 10)   volume.sfx = 10;
        
        music.setVolume(volume.music / 10);
        sfx.setVolume  (volume.sfx / 10);

        localStorage.setItem('volume', JSON.stringify(volume));
    };

    window.OptionsState = PauseState.extend({
        constructor: function(nextState) {
            var menu_items = [
                {
                    text: 'Back',
                    oncomplete: function() {
                        this.key_ESC();
                    }
                },
                {
                    text: 'Music           ',
                    oncomplete: function() {
                        this.toggleMusic();
                    }
                },
                {
                    text: 'SFX             ',
                    oncomplete: function() {
                        this.toggleSFX();
                    }
                },
                {
                    text: 'Random Palette',
                    oncomplete: function() {
                        Palette.set();

                        this.updated = true;
                    }
                },
            ];

            this.music_ndx = 1;
            this.sfx_ndx = 2;

            this.music = menu_items[this.music_ndx];
            this.sfx = menu_items[this.sfx_ndx];

            PauseState.call(this, nextState, menu_items);

            this.updateVolume();
        },

        updateVolume: function() {
            updateVolume();

            var before = (new Array(volume.music + 1)).join(' ');
            var after  = (new Array(11 - before.length)).join(' ');
            this.music.text.setText('Music ' + before + 'O' + after);

            before = (new Array(volume.sfx + 1)).join(' ');
            after  = (new Array(11 - before.length)).join(' ');
            this.sfx.text.setText('SFX   ' + before + 'O' + after);
            this.updated = true;
        },

        key_LEFT: function() {
            if (this.menu_choice === this.music_ndx) {
                volume.music --;
                this.updateVolume();
            }
            else if (this.menu_choice === this.sfx_ndx) {
                volume.sfx --;
                this.updateVolume();
            }
        },

        key_RIGHT: function() {
            if (this.menu_choice === this.music_ndx) {
                volume.music ++;
                this.updateVolume();
            }
            else if (this.menu_choice === this.sfx_ndx) {
                volume.sfx ++;
                this.updateVolume();
            }
        },
    });
})();