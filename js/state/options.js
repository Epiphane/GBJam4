var OptionsState = PauseState.extend({
   constructor: function(nextState) {
      var menu_items = [
         {
            text: 'Music ' + (music.muted ? 'on' : 'off'),
            oncomplete: function() {
               this.toggleMusic()
            }
         },
         {
            text: 'SFX ' + (sfx.muted ? 'on' : 'off'),
            oncomplete: function() {
               this.toggleSFX()
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

      this.music = menu_items[0];
      this.sfx = menu_items[1];

      PauseState.call(this, nextState, menu_items);
   },

   toggle: function(obj, sound, string) {
      if (!sound.muted) {
         obj.text.text = string + ' on';
         sound.mute();
      }
      else {
         obj.text.text = string + ' off';
         sound.unmute();
      }

      this.updated = true;
   },

   toggleMusic: function() {
      this.toggle(this.music, music, 'Music');
   },

   toggleSFX: function() {
      this.toggle(this.sfx, sfx, 'SFX');
   }
});