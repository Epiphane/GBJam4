// Call this to create a "Scene". These are the main
// states that your game can be in. Calling extend()
var GameScreen = Juicy.State.extend({
   constructor: function() {
      this.tiles = [];

      for (var i = 0; i < 16 * 14; i ++) {
         if (Juicy.rand(10) < 8) continue;

         var tile = new Juicy.Entity(this, ['Tile']);
         tile.position.x = (i % 16) * 10;
         tile.position.y = Math.floor(i / 16) * 10;
         this.tiles.push(tile);
      }
   },
   init: function() {
      Juicy.Sound.load('jump', 'fx_jump.mp3');
   },
   key_UP: function() {
      console.log('up!');

      Juicy.Sound.play('jump');
   },
   update: function(dt, input) {

   },
   render: function(context) {
      for (var i = 0; i < this.tiles.length; i ++) {
         this.tiles[i].render(context);         
      }
   }
});