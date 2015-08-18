var PreBossLevel = InfiniteLevel.extend({
    completeLevel: function() {
        this.complete = true;
        this.game.setState(new BossLevel());
    },
});

