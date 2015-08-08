(function() {
   var tile = new Image();
   tile.src = 'img/tile.png';

   Juicy.Component.create('Tile', {
      image: tile,
      render: function(context) {
         context.drawImage(this.image, 0, 0);
      }
   });
})();