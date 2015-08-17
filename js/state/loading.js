var LoadingState = Juicy.State.extend({
    constructor: function(state, options) {
        this.nextState = state;
        this.load = options.load;

        this.progress = 0;
        this.calls = 0;

        this.loading = new Juicy.Entity(this, ['ColoredSprite']);
        this.loading.getComponent('ColoredSprite').setSheet('img/loading.png', 46, 12);
        this.loading.scale = Juicy.Point.create(2, 2);
        this.loading.position = Juicy.Point.create(30, 20);
    },

    resolve: function(progress) {
        if (progress === 1) {
            this.nextState.loaded = true;
            this.game.setState(this.nextState);
        }

        this.progress = progress;
    },

    update: function(dt) {
        var self = this;
        var promise = self.load(this.calls);

        if (typeof(promise) === 'number') {
            self.resolve(promise);
        }
        else {
            promise.oncomplete = function(progress) {
                self.resolve(progress);
            };
        }
    },

    render: function(context) {
        context.strokeStyle = 'rgba(' + Palette.get('LIGHT').join(',') + ')';
        context.rect(10, this.game.height / 2 - 10, this.game.width - 20, 20);
        context.lineWidth = 4;
        context.stroke();

        context.fillStyle = 'rgba(' + Palette.get('LIGHT').join(',') + ')';
        context.fillRect(12, this.game.height / 2 - 8, (this.game.width - 24) * this.progress, 16);
    
        this.loading.render(context);
    }
})