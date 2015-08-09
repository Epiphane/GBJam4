(function() {
    var LIGHT = 255;
    var MID = 170;
    var LOW = 85;
    var DARK = 0;

    var palettes   = [];
    var palette    = new Image();
    palette.src    = 'img/palette.png';
    palette.crossOrigin = 'Anonymous';
    palette.onload = function() {
        var tempcanvas = document.createElement('canvas');
        tempcanvas.width = palette.width;
        tempcanvas.height = palette.height;
        var ctx = tempcanvas.getContext('2d');

        ctx.drawImage(palette, 0, 0);
        var palettedata = ctx.getImageData(0, 0, palette.width, palette.height).data;
    
        for (var p = 0; p < palettedata.length; /* p incremented in the loop */) {
            var new_palette = [];
            while (new_palette.length < 4 /* pixels per palette */) {
                var color = [];
                color[0] = palettedata[p++];
                color[1] = palettedata[p++];
                color[2] = palettedata[p++];
                color[3] = palettedata[p++];

                new_palette.push(color);
            }
            palettes.push(new_palette);
        }

        Palette.set(Palette.current);
    };

    var Palette = window.Palette = { current: 0 };

    Palette.onchange = [];

    Palette.set = function(palette_id) {
        this.current = palette_id;

        if (!palettes[palette_id]) return;

        for (var i = 0; i < Palette.onchange.length; i ++) {
            Palette.onchange[i](palettes[palette_id]);
        }
    };

    Palette.get = function(type) {
        var palette = palettes[this.current];
        switch(type) {
            case 'LIGHT': return palette[0];
            case 'MID': return palette[1];
            case 'LOW': return palette[2];
            default: return palette[3];
        }
    }

    Palette.applyPalette = function(template, destination) {
        var palette = palettes[this.current];

        destination.width  = template.width ;
        destination.height = template.height;

        var context = destination.getContext('2d');
        
        // Draw template to canvas
        context.drawImage(template, 0, 0);
        var templatedata = context.getImageData(0, 0, destination.width, destination.height).data;

        // Create new pixel data
        var colored = context.createImageData(destination.width, destination.height);

        for (var i = 0; i < colored.data.length; i += 4) {
            if (templatedata[i + 3] === 0) continue;

            var pindex = 3;
            var template_c = templatedata[i]
            if (template_c >= LOW) pindex --;
            if (template_c >= MID) pindex --;
            if (template_c >= LIGHT) pindex --;
            var color = palette[pindex];

            colored.data[i+0] = color[0];
            colored.data[i+1] = color[1];
            colored.data[i+2] = color[2];
            colored.data[i+3] = 255;//color[3];
        }

        context.putImageData(colored, 0, 0);
    };
})();