Juicy.Component.create('Goal', {
   update: function(dt, game) {
      if (this.entity.testCollision(game.getPlayer())) {
         this.dead = true;

         Juicy.Sound.play('goal');
      }
   }
});