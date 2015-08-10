var sfx = new Juicy.SFX();
sfx.load('goal', 'audio/fx_jump.mp3');

Juicy.Component.create('Goal', {
   update: function(dt, game) {
      if (this.entity.testCollision(game.getPlayer())) {
         this.dead = true;
         console.log('LOL');

         sfx.play('goal');
      }
   }
});