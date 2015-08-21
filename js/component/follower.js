Juicy.Component.create('Follower', {
   constructor: function(entity) {
      this.following = null;

      this.hovering = false;
   },
   follow: function(other, offset, hovering) {
      this.following = other;
      this.offset    = offset;

      this.hovering  = !!hovering;
      this.hover = 0;
      this.speed = 1/8;
   },
   update: function(dt, update) {
      if (!this.following) {
         return;
      }

      var offset = this.offset.clone();
      if (this.hovering) {
         this.hover += dt;
         if (this.hover >= Math.PI * 2) {
            this.hover -= Math.PI * 2;
         }

         offset.y += Math.sin(this.hover * 10);
      }

      var dest = this.following.position.add(offset);
      this.entity.position = this.entity.position.add(dest._sub(this.entity.position)._mult(this.speed));
   
      offset.free();
   }
})