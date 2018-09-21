//handles loading and keeps track of all graphics
//performs all rendering operations
var Rendering = function () {
    var spritesheet;
    var context;
    var spriteData = {};
    var onReady;
    var assets = [];
    var centerBased = false;

    function rbox(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        context.beginPath();
        context.moveTo(x+r, y);
        context.arcTo(x+w, y,   x+w, y+h, r);
        context.arcTo(x+w, y+h, x,   y+h, r);
        context.arcTo(x,   y+h, x,   y,   r);
        context.arcTo(x,   y,   x+w, y,   r);
        context.closePath();
        context.fill();
        context.stroke();
      }

    function RenderBox(box, fill, pen, r, a){
        context.globalAlpha = a;
        context.fillStyle = fill;
        context.strokeStyle  = pen;
        rbox(box.x, box.y, box.width, box.height, r);
    }

    function RenderSprite(x, y, sprite, fr, center) {
        var s = spriteData[sprite];
        var frame = s.src[fr];
        if(center){
            x-=(s.w/2);
            y-=(s.h/2);
        }        
        context.drawImage(assets[s.tag], frame.x, frame.y, s.w, s.h, 
            Math.round(x), Math.round(yield), s.w, s.h);
    }
    
    function DrawSprite(x, y, sprite, spriteInd, s, r, a){
        var spr = spriteData[sprite];
        var frame = spr.src[spriteInd];
        var w = spr.w;
        var h = spr.h;
        context.setTransform(s, 0, 0,s ,Math.round(x) ,Math.round(y)); // set scale and position
        context.rotate(r);
        context.globalAlpha = a;
        context.drawImage(assets[spr.tag], frame.x, frame.y,
            w, h, -w/2, -h/2, w, h); 
    }

    return {
        Init: function (options) {

            spritesheet = options.spritesheet;
            context = options.context;
            spriteData = options.spriteData;
            onReady = options.onReady;
            centerBased = options.centerBased || centerBased;

            var numAssets = spritesheet.length;

            spritesheet.forEach(function(sheet) 
            {
                if(sheet.recol)
                {
                    --numAssets;
                }
                else
                {
                    var a = new Image();
                    a.src = sheet.src;
                    var tag = sheet.tag;
                    a.onload = function() { 
                        assets[tag] = a;
                        
                        if(--numAssets == 0)
                        {
                            if(onReady){
                                onReady();				
                            }
                        }
                    };
                }

            });
           context.imageSmoothingEnabled = false;
        },
        SetContext: function (sx, sy){
            context.setTransform(sx, 0, 0, sy, 0, 0);
        },
        Clear: function (){
            context.clearRect(0, 0, 640, 480);
        },
        Sprite: function(x, y, sprite, frame, scale, rotate, alpha){
            DrawSprite(x, y, sprite, frame, scale, rotate, alpha);
        },
        Tile: function(x, y, sprite){
            context.setTransform(1, 0, 0, 1, 0, 0);
            RenderSprite(x, y, sprite, 0, false);
        },
        RawTile: function(x, y, sprite){
            //RenderSprite(x, y, sprite, 0, false);
            DrawSprite(x, y, sprite, 0, 4, 0, 1);
        },
        DrawBox: function(box, fill, pen, r, a){
            RenderBox(box, fill, pen, r, a);
        },
        DrawText: function(txt, x, y, font, col){
            context.font = font;
            context.fillStyle = col;
            //context.textAlign = "center";
            context.fillText(txt, x, y);
        }                   
    }
};