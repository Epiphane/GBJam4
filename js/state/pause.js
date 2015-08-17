var PauseState = Juicy.State.extend({
    constructor: function(prevState, menu_items) {
        this.prevState = prevState;

        this.menu_top = 20;
        this.menu_left = 25;
        this.menu_width = 110;
        this.menu_height = 100;

        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        this.ui.addText({
            text: 'PAUSED',
            font: 'BIG',
            brightness: 3,
            center: true,
            animate: 'NONE',
            position: Juicy.Point.create(80, this.menu_top + 5)
        });

        menu_items = menu_items || [
            {
                text: 'Continue',
                oncomplete: function() {
                    this.game.setState(this.prevState);
                }
            },
            {
                text: 'Options',
                oncomplete: function() {
                    this.game.setState(new OptionsState(this));
                }
            },
            {
                text: 'New Game',
                oncomplete: function() {
                    this.prevState.cleanup();
                    newGame();
                }
            },
            {
                text: 'Back to town',
                oncomplete: function() {
                    this.prevState.cleanup();
                    this.game.setState(new CityLevel());
                }
            },
            {
                text: 'Free Play',
                oncomplete: function() {
                    this.prevState.cleanup();
                    this.game.setState(new InfiniteLevel());
                }
            }
        ];
        
        this.menu_items = [];
        for (var i = 0; i < menu_items.length; i ++) {
            this.menu_items.push(menu_items[i]);
        }

        extraMenuItems = prevState.pauseMenuItems || [];
        for (var i = 0; i < extraMenuItems.length; i ++) {
            this.menu_items.push(extraMenuItems[i]);
        }

        var menu_pos = Juicy.Point.create(this.menu_left + 10, this.menu_top + 25);

        for (var i = 0; i < this.menu_items.length; i ++) {
            var item = this.menu_items[i];
            item.brightness = 3;
            item.position = menu_pos.clone();
            item.showBackground  = true;

            this.menu_items[i].text = this.ui.addText(item);

            menu_pos.y += 10;
        }

        this.menu_choice = 0;
        this.menu_items[this.menu_choice].text.brightness = 0;
    },

    key_ESC: function() {
        this.game.setState(this.prevState);
    },
    
    key_DOWN: function() {
        this.menu_items[this.menu_choice].text.brightness = 3;
        this.menu_choice = (this.menu_choice + 1) % this.menu_items.length;
        this.menu_items[this.menu_choice].text.brightness = 0;

        this.updated = true;
    },
    
    key_UP: function() {
        this.menu_items[this.menu_choice].text.brightness = 3;
        this.menu_choice = (this.menu_choice - 1) % this.menu_items.length;
        if (this.menu_choice < 0) this.menu_choice += this.menu_items.length;
        this.menu_items[this.menu_choice].text.brightness = 0;

        this.updated = true;
    },

    key_ENTER: function() {
        this.menu_items[this.menu_choice].oncomplete.apply(this);
    },

    init: function() {
    
    },
    
    update: function(dt) { 
        this.ui_entity.update(dt);

        return true;
    },

    render: function(context) {
        this.prevState.render(context);

        context.fillStyle = Palette.getStyle('LIGHT');
        context.fillRect(this.menu_left - 1, this.menu_top - 1, this.menu_width + 2, this.menu_height + 2);

        context.fillStyle = Palette.getStyle('DARK');
        context.fillRect(this.menu_left, this.menu_top, this.menu_width, this.menu_height);

        this.ui_entity.render(context);
    }
});
