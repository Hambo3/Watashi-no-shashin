//handles map rendering and collisons
var MapManager = function () {
    var map = {
        set:null,
        dimensions:{width:0, height:0},
        tile:{width:32, height:32},
        screen:{width:0, height:0},
        colliders:{hit:[],over:[]},
        data:[]
    };
    var offset = {x:0,y:0};
    var scroll = {x:0, y:0,xoffset:0,yoffset:0};
    
    function hpoint(p){
        return Math.floor(p / map.tile.width);
    }		
    function vpoint(p){
        return Math.floor(p / map.tile.height);
    }
    function cell(x, y){
        var h = hpoint(x);
        var v = vpoint(y);
        var p = h + (v * map.dimensions.width);
        return p;
    }
    function content(x,y){
        var cp = map.data[cell(x, y)];
        return cp;
    }
    function lerp(start, end, amt)
    {
        return (end-start) * amt+start;
    }
    function render(level) {
        var m = 0;
        var p;
        var draw = true;
        var mcols = map.dimensions.width;
        var col = map.screen.width+1;
        var row = map.screen.height+1;
        Renderer.SetContext(1, 1);
        for(var r=0; r < row; r++) {
            for(var c = 0; c < col; c++) {
                m = ((r+scroll.yoffset) * mcols) + (c+scroll.xoffset);
                p = map.data[m];
                if(level == 0){
                    if(map.colliders.over.indexOf(p) != -1){
                        p -= 4;
                    }
                    draw = true;
                }
                else{
                    draw = (map.colliders.over.indexOf(p) != -1);
                }
                if(draw == true){
                    Renderer.RawTile(
                        (c * map.tile.width) + scroll.x+offset.x, 
                        (r * map.tile.height) + scroll.y+offset.y, 
                        map.set + p);                    
                }

            } 
        }
    }

    function hitSomething(cell){
        return map.colliders.hit.indexOf(cell) != -1;
    }

    function scrollOffset() {
        return {x:(scroll.xoffset*map.tile.width)-scroll.x,
                y:(scroll.yoffset*map.tile.height)-scroll.y};
    }
    
    return {
        Hit: function(x, y){
            return hitSomething(content(x, y));
        },
        MapSize: function(){
            return {width:map.dimensions.width * map.tile.width, 
                    height:map.dimensions.height * map.tile.height};
        },
        ScreenSize: function(){
            return {width:map.screen.width * map.tile.width, 
                    height:map.screen.height * map.tile.height};
        },        
        SetMap: function (m) {
            map = m;
        },
		Hpoint: function (p) {
			return hpoint(p);
		},
		Vpoint: function (p) {
			return vpoint(p);
		},		
        Content: function (x, y) {
            return content(x, y);
        },   
        IsVisible: function (perp) {
            var left = perp.x;
            var right = perp.x+perp.width;
            var top = perp.y;
            var bottom = perp.y+perp.height;

            var screenPos = scrollOffset();
            return( (right > screenPos.x && left < (screenPos.x + ( map.screen.width*map.tile.width)) ) && 
                (bottom > screenPos.y && top < (screenPos.y + ( map.screen.height*map.tile.height))) );
        },  
        mapCollision: function (perp, static) {
            var clx = false;
			if(static || perp.dx > 0){
				if( hitSomething(content(perp.x + perp.dx + perp.hitBox().r, perp.y + perp.hitBox().t)) || 
                hitSomething(content(perp.x + perp.dx + perp.hitBox().r, perp.y + perp.hitBox().b)) )
                {
                    perp.dx = 0;
                    clx = true;
				}
			}
			else if(static || perp.dx < 0){
				if(	hitSomething(content(perp.x + perp.dx + perp.hitBox().l, perp.y + perp.hitBox().t)) || 
                hitSomething(content(perp.x + perp.dx + perp.hitBox().l, perp.y + perp.hitBox().b)) )
                {
                    perp.dx = 0;
                    clx = true;
				}
            }			

			if(static || perp.dy > 0){
				if(	hitSomething(content(perp.x + perp.hitBox().l, perp.y + perp.dy + perp.hitBox().b)) || 
                hitSomething(content(perp.x + perp.hitBox().r, perp.y + perp.dy + perp.hitBox().b)) )
                {
                    perp.dy = 0;
                    clx = true;
				}
			}
			else if(static || perp.dy < 0){
				if(	hitSomething(content(perp.x + perp.hitBox().l, perp.y + perp.dy + perp.hitBox().t)) || 
                hitSomething(content(perp.x + perp.hitBox().r, perp.y + perp.dy + perp.hitBox().t)))
                {
                    perp.dy = 0;
                    clx = true;
				}
            }
            return clx;
        },
        ScrollOffset: function () {
            return {x:(scroll.xoffset*map.tile.width)-scroll.x,
                    y:(scroll.yoffset*map.tile.height)-scroll.y};
        }, 
        ScrollTo: function(x, y){
            var midx = ( map.screen.width*map.tile.width) / 2;
            var midy = ( map.screen.height*map.tile.height) / 2;
            var maxx = (map.dimensions.width * map.tile.width) - ( map.screen.width*map.tile.width);
            var maxy = (map.dimensions.height * map.tile.height) - ( map.screen.height*map.tile.height);

            var cpx = (scroll.xoffset*map.tile.width)-scroll.x;
            var cpy = (scroll.yoffset*map.tile.height)-scroll.y;
            var destx = lerp(cpx, (x-midx), 0.04);
            var desty = lerp(cpy, (y-midy), 0.04);

            if(destx > 0 && destx < maxx)
            {
                scroll.x = -destx % map.tile.width;
                scroll.xoffset = parseInt(destx / map.tile.width);
            }
            if(desty > 0 && desty < maxy)
            {
                scroll.y = -desty % map.tile.height;
                scroll.yoffset = parseInt(desty / map.tile.height);
            }
        },
        Scroll: function(x, y){             
            var xt = map.tile.width;            
            var yt = map.tile.height;
            var mw = map.dimensions.width - map.screen.width - 1;
            var mh = map.dimensions.height - map.screen.height - 1;
            if( (x > 0 && ((scroll.xoffset > 0) || (scroll.xoffset == 0 && scroll.x+x < 0))) || 
                (x < 0 && ((scroll.xoffset < mw) || (scroll.xoffset == mw && scroll.x+x >= -xt))) )
            {
                scroll.x += x;

                if(scroll.x < -xt){
                    scroll.x += xt;
                    scroll.xoffset++;
                }
                if(scroll.x > 0){
                    scroll.x -= xt;
                    scroll.xoffset--;
                } 
            }            

            if( (y > 0 && ((scroll.yoffset > 0) || (scroll.yoffset == 0 && scroll.y+y < 0))) || 
                (y < 0 && ((scroll.yoffset < mh) || (scroll.yoffset == mh && scroll.y+y >= -yt))) )
            {
                scroll.y += y;    
                if(scroll.y < -yt){
                    scroll.y += yt;
                    scroll.yoffset++;
                }
                if(scroll.y > 0){
                    scroll.y -= yt;
                    scroll.yoffset--;
                } 
            }    
            
        },
        Render: function (layer) {
            render(layer);            
        }    
    }
};