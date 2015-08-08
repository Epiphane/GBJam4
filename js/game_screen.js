// Call this to create a "Scene". These are the main
// states that your game can be in. Calling extend()
var GameScreen = Juicy.State.extend({
   constructor: function() {
      this.pic = new Juicy.Entity(this, ['Image']);
      this.pic.position.x = 50;
      this.pic.position.y = 10;
      this.pic.getComponent('Image').setImage('doge.png');      
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
      this.pic.render(context);
   }
});