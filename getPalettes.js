var http = require('http');
var fs = require('fs');

http.get('http://colorhunt.co', function(response) {
   var body = '';
   response.on('data', function(d) {
      body += d;
   });

   response.on('end', function() {
      parseBody(body);
   });
});

function Brightness(c)
{
   return Math.sqrt(
      c[0] * c[0] * .241 + 
      c[1] * c[1] * .691 + 
      c[2] * c[2] * .068);
}

function parseBody(body) {
   var generatedCode = 'function dynamicPalette() { return [';
   var items = body.match(/itemer\('([a-zA-Z0-9]*)'/g);

   while (items.length > 0) {
      generatedCode += '[';
      var item = items.shift();

      var code = item.match(/itemer\('([a-zA-Z0-9]*)'/)[1];

      var colors = [ 
         code.substring(0,6),
         code.substring(6,12),
         code.substring(12,18), 
         code.substring(18,24)
      ];

      for (var i = 0; i < colors.length; i ++) {
         var r = parseInt(colors[i].substring(0, 2), 16);
         var g = parseInt(colors[i].substring(2, 4), 16);
         var b = parseInt(colors[i].substring(4, 6), 16);

         colors[i] = [r, g, b, 255];
      }

      for (var i = 0; i < colors.length; i ++) {
      }

      colors = colors.sort(function(a, b) {
         return Brightness(b) - Brightness(a);
      });

      for (var i = 0; i < colors.length; i ++) { colors[i] = '[' + colors[i].join(',') + ']'; }

      generatedCode += colors.join(',') + '],';
      // if (items.length > 0) generatedCode += ','
   }

   generatedCode += ']; }';

   fs.writeFile('js/dynamic_palette.js', generatedCode);
}