(function() {
    function Player(x, y, width, height, anims, initialAnim, hitbox) {
 
		this.enabled = true;
		this.type= Const.actors.player;
        this.dx = 0;
		this.dy = 0;

		this.scale = 4;
		this.rotation = 0;
        this.max = 3;
        this.accel = 9;   

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

		this.defaultHitBox = hitbox;
        this.touching = {l:false, r:false, t:false, b:false}; 
        
		this.anims = anims;
		this.currentAnim = initialAnim;
        this.frame = 0;
        this.frameNum = 0;
		this.frameRate = 16;

        this.sprite = new Sprite();
        this.sprite.Init(
            {
                src: this.currentAnim,
                x:this.x,
				y:this.y,
				scale:this.scale
            });
        this.mob;
        this.strength = 0;        
    };

    Player.prototype = {
        score: function(){
            return this.mob.social;
        },
        stop: function (){
            this.enabled = this.mob.enabled = false;            
        },
        start: function(x, y){
            this.x = x;
            this.y = y;
            this.mob.reset();
            this.enabled = true;
        },
        txt:function(){
            this.mob.enable(this.strength);
        },
		logic: function (dt){		
			var playerSpeed = this.accel * dt;
            var friction = Const.game.friction * dt;
            
	        if(!this.mob.enabled){

                if(!this.touching.t && input.isDown('UP') || input.isDown('W') ) {
                    this.dy -= (this.dy > -this.max) ? playerSpeed : 0;
                    this.currentAnim = this.anims.up;
                    this.nextanim();
                }
                if(!this.touching.b && input.isDown('DOWN') || input.isDown('S') ) {
                    this.dy += (this.dy < this.max) ? playerSpeed : 0;
                    this.currentAnim = this.anims.down;
                    this.nextanim();
                }

                if(!this.touching.l && input.isDown('LEFT') || input.isDown('A') ) {
                    this.dx -= (this.dx > -this.max) ? playerSpeed : 0;
                    this.nextanim();			
                }
                else if(!this.touching.r &&  input.isDown('RIGHT') || input.isDown('D') ) {
                    this.dx += (this.dx < this.max) ? playerSpeed : 0;
                    this.nextanim();
                }  
            }                
            if(this.dx > 0){
                this.dx = ((this.dx - friction) < 0) ? 0 : this.dx - friction;
            }
            if(this.dx < 0){
                this.dx = ((this.dx + friction) > 0) ? 0 : this.dx + friction;
            }	

            if(this.dy > 0){
                this.dy = ((this.dy - friction) < 0) ? 0 : this.dy - friction;
            }
            if(this.dy < 0){
                this.dy = ((this.dy + friction) > 0) ? 0 : this.dy + friction;
            }
				
        },	
        nextanim: function (){
			if(++this.frameNum > this.frameRate){
                this.frameNum = 0;
                this.frame = 1-this.frame;
            }  
		}, 
		move: function (){
			this.x += this.dx;
			this.y += this.dy; 	
		},		
        update: function(dt, os) {
			this.move();
			this.sprite.Update(dt, 
				{
					x:this.x-os.x, 
					y:this.y-os.y, 
					frame:this.frame, 					
					src:this.currentAnim
                });
            this.mob.online = (this.strength>0);
        },
        render: function(ctx) {
            this.sprite.Render();
		},
		hitBox: function(){
			return this.defaultHitBox;
        },
        sideBox: function(){
			var box = this.hitBox();
			return {l:box.l-1, r:box.r+1, t:box.t-1, b:box.b+1 };
		}
    };

    window.Player = Player;
})();


(function() {
    function Enemy(x, y, width, height, anims, initialAnim, hitbox) {
 
        this.bounds = {wt:0,ht:0};
        this.enabled = true;
		this.type = Const.actors.shopr;
        this.visible = false;
		this.scale = 4;
		this.rotation = 0;
        this.max = 0;
        this.accel = 9;    

        this.wifi;
        this.player;
        this.altState;
        this.target;
        this.chasing;
        this.timers = {wait:0, walk:0};
		this.anims = anims;

        this.frame = 0;
        this.frameNum = 0;
		this.frameRate = 32;

        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;        
        this.width = width;
        this.height = height;

		this.defaultHitBox = hitbox;
        this.touching = {l:false, r:false, t:false, b:false}; 
		this.currentAnim = initialAnim;
        this.sprite = new Sprite();
        this.sprite.Init(
            {
                src: this.currentAnim,
                x:this.x,
                y:this.y,
				scale:this.scale
            });
    };

    Enemy.prototype = {        
        set: function(player,wifi, bounds, type){
            this.player = player;
            this.wifi = wifi;
            this.bounds = bounds;
            this.altState = type;
            this.reset();
        }, 
        reset: function(){
            this.type = Const.actors.shopr;
            this.target = {x: Util.Rnd(32, this.bounds.wt), y: Util.Rnd(32, this.bounds.ht)};
            
            this.timers.walk = 240;
            this.max = Util.Rnd(1, 2);
            this.frameRate = (48-this.max*8);
            this.chasing = false;            
        },         
        logic: function (dt){
            var speed = this.accel * dt;
            var friction = Const.game.friction * dt;            

            if(!this.chasing && this.wifi.active){
                this.type = this.altState;     

                if(this.altState == Const.actors.troll){
                    this.target.x = this.wifi.x+Util.Rnd(-32, 32);
                    this.target.y = this.wifi.y+Util.Rnd(-32, 32);
                }
                else{
                    this.target = this.player;    
                }
                this.max = Util.Rnd(2, 4.5);
                this.timers = {wait:0, walk:9000}; 
                this.chasing = true;
            }
            else if(this.chasing && !this.wifi.active){
                this.reset();
            }
            if(this.timers.wait > 0){
                this.timers.wait--;
            }
            else if(this.target){                
                if(!this.touching.r && this.target.x-8 > this.x){
                    this.dx += (this.dx < this.max) ? speed : 0; 
                }
                if(!this.touching.l && this.target.x+8 < this.x){
                    this.dx -= (this.dx > -this.max) ? speed : 0;              
                }

                if(!this.touching.b && this.target.y-8 > this.y){
                    this.dy += (this.dy < this.max) ? speed : 0; 
                    this.currentAnim = this.anims[this.type-Const.actors.shopr].down;              
                }
                if(!this.touching.t && this.target.y+8 < this.y){
                    this.dy -= (this.dy > -this.max) ? speed : 0;  
                    this.currentAnim = this.anims[this.type-Const.actors.shopr].up;             
                }

                if(this.dx > 0){
                    this.dx = ((this.dx - friction) < 0) ? 0 : this.dx - friction;
                    this.nextanim();
                }
                if(this.dx < 0){
                    this.dx = ((this.dx + friction) > 0) ? 0 : this.dx + friction;
                    this.nextanim();
                }
                if(this.dy > 0){
                    this.dy = ((this.dy - friction) < 0) ? 0 : this.dy - friction;                    
                    this.nextanim();
                }
                if(this.dy < 0){
                    this.dy = ((this.dy + friction) > 0) ? 0 : this.dy + friction;
                    this.nextanim();
                }

                var dist = Math.sqrt( ((this.x-this.target.x) * (this.x-this.target.x))
                                       +((this.y-this.target.y) * (this.y-this.target.y)) );
                
                if(this.type == Const.actors.shopr && dist < 10)
                {
                   this.reset();
                   this.timers.wait = Util.Rnd(120, 240);
                   if(!this.visible && Util.Rnd(0, 5) == 0)
                   {
                    this.enabled = false;
                   }
                }

                if(--this.timers.walk < 0){
                    this.reset();
                    if(!this.visible && Util.Rnd(0, 4) == 0)
                   {
                    this.enabled = false;
                   }
                }

            }
        },
        nextanim: function (){
			if(++this.frameNum > this.frameRate){
                this.frameNum = 0;
                this.frame = 1-this.frame;
            }  
		}, 
		move: function (){
			this.x += this.dx;
			this.y += this.dy;  
		},        
        update: function(dt, os) {
            this.move();
            this.sprite.Update(dt, {x:this.x-os.x, y:this.y-os.y, frame:this.frame, src:this.currentAnim});
        },
        render: function() {
            this.sprite.Render();
        },
		hitBox: function(){
			return this.defaultHitBox;
		},
        sideBox: function(){
			var box = this.hitBox();
			return {l:box.l-1, r:box.r+1, t:box.t-1, b:box.b+1 };
		}
    };

    window.Enemy = Enemy;
})();

//wifi hotspot
(function() {
    function WiFi(mapw, maph) {
 
        this.bounds = {wt:mapw, ht:maph};
        this.enabled = false;
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.users = {troll:0, hater:0};
        this.ranges = [];  
        this.strength = 0;
    };

    WiFi.prototype = {
        reset: function(){
            this.active = false;
            this.ranges = [];
            this.users = {troll:0, hate:0};
            this.x = Util.Rnd(32, this.bounds.wt);
            this.y = Util.Rnd(32, this.bounds.ht);

            var rad = Util.Rnd(200, 300);
            var seg = rad/5;
            for(var i = 5; i > 0; i--){
                this.ranges.push(seg * i);
            }       
        },
        InRange: function (obj, reset){
            var s = 0;
            if(this.enabled){
                this.users = (reset) ? {troll:0, hater:0} :this.users;

                var dist = Math.sqrt( ((this.x-obj.x) * (this.x-obj.x))+((this.y-obj.y) * (this.y-obj.y)) );
                for(var i = 0; i < this.ranges.length; i++){
                    if(dist < this.ranges[i]){
                        s = i+1;
                    }
                }
                if(s > 0){
                    if(obj.type == Const.actors.troll){
                        this.users.troll++;
                    }
                    else if(obj.type == Const.actors.hater){
                        this.users.hater++;
                    }
                }              
            }
            return s;
        },
        CheckSignal: function(){
            if(this.users.troll + this.users.hater > 8)
            {
                this.reset();
            }
        }
    };

    window.WiFi = WiFi;
})();

(function() {
    function Title(screen) { 
        this.enabled = false;
        this.dim = {x:128, y:128, fw:screen.width, fh:screen.height, w:screen.width-256, h:screen.height-256};
        this.screen = 0;
        this.pscore = 0;

        this.txt = [
            [
                {font:Const.game.h1Font, txt:" Watashi no shashin", col:"#c10000"},
                {txt:null},
                {font:Const.game.h3Font, txt:"Tony (you)", img:"playerd"},{txt:null},
                {font:Const.game.h3Font, txt:"Shopper", img:"shoprd"},{txt:null},
                {font:Const.game.h3Font, txt:"Troll", img:"trolld"},{txt:null},
                {font:Const.game.h3Font, txt:"Hater", img:"haterd"},{txt:null}
            ],         
            [
                {font:Const.game.h1Font, txt:" Watashi no shashin", col:"#c10000"},
                {txt:null},
                {font:Const.game.h3Font, txt:"You have 1 hour before mom comes to pick you up from the mall."},
                {font:Const.game.h3Font, txt:"Take as many selfies as you can before time runs out."},
                {font:Const.game.h3Font, txt:"Your followers are relying on you Tony."},
                {txt:null},
                {font:Const.game.h3Font, txt:"Don't let them down!"},
                {txt:null},
                {font:Const.game.h3Font, txt:"    [W]"},
                {font:Const.game.h3Font, txt:"[A] [D] [F] / [arrow keys] Movement"},
                {font:Const.game.h3Font, txt:"[B] to open mobile"},
                {font:Const.game.h3Font, txt:"[SPACE] to type txt, [RETURN] to send"}
            ],          
            [
                {font:Const.game.h2Font, txt:"Tony, your followers thank you."},
                {txt:null},
                {txt:"Likes: [like]"},
                {txt:"Dislikes: [hate]"},{txt:null},
                {txt:"Score: [score]"}
            ]
        ];
    };

    Title.prototype = {
        update: function (){            
        },
        render: function (){
            if(this.enabled){
                Renderer.DrawBox({x:-16, y:-16, width:this.dim.fw+16, height:this.dim.fh+16}, '#000000', '#000000', 16, 0.7);

                Renderer.DrawBox({x:this.dim.x, y:this.dim.y, width:this.dim.w, height:this.dim.h}, '#0b2a05', '#1d5712', 16, 0.7);

                var y = this.dim.y + 64, x;

                var ct = this.txt[this.screen];

                for(var i = 0; i<ct.length; i++){    
                    x = this.dim.x + 32;                
                    if(ct[i].txt){9
                        var t = ct[i].txt;
                        t = t.replace("[like]",this.pscore.likes);
                        t = t.replace("[hate]",this.pscore.hates);
                        t = t.replace("[score]", ((this.pscore.likes*45000) - (this.pscore.hates*17000)));

                        if(ct[i].img)
                        {
                            Renderer.Sprite(x+160, y, ct[i].img, 0, 4, 0, 1);
                            x += 200;
                        }
                        Renderer.SetContext(1,1);
                        Renderer.DrawText(t, x, y, ct[i].font, ct[i].col || "#b5af00");
                    }
                    y+=18;
                }
                Renderer.DrawText("              Press [B]", x, this.dim.y + this.dim.h - 32, Const.game.h2Font, '#999999');
            }
        }
    };

    window.Title = Title;
})();

(function() {
    function Info(screen) {
        this.enabled = false; 
        this.score;
        this.wifiStrength = 0;  
        this.width = screen.width;
        this.height = 64;
        this.clock;
    };

    Info.prototype = {
        update: function (strength, score, time){
            this.wifiStrength = strength;
            this.score = score;
            this.clock = time;
        },
        render: function (){
            if(this.enabled){
                Renderer.DrawBox({x:0, y:0, width:this.width, height:this.height}, '#000000', '#000000', 1, 0.7);

                for(var i = 0; i<5; i++){
                    var c = (this.wifiStrength > i) ? '#ffffff':'#555555';
                    Renderer.DrawBox({x:(this.width-100)+(i+1)*10, y:52-((i+1)*8), width:8, height:(i+1)*8}, 
                    c, c, 1, 1);
                }

                var cl = parseInt(this.clock/5);

                Renderer.Sprite(this.width/2, 32, 'like', 0, 3, 0, 1);
                Renderer.Sprite((this.width/2)+80, 32, 'nolike', 0, 3, 0, 1);
                Renderer.SetContext(1,1);
                Renderer.DrawText("Time til mom: "+ (60-cl), this.width/4, 32, Const.game.h3Font, '#ffffff');
                Renderer.DrawText("     "+this.score.likes+"                " + this.score.hates, this.width/2, 36, Const.game.h3Font, '#ffffff');
            }

        }
    };

    window.Info = Info;
})();

(function() {
    function Device(screen, map) { 
        this.enabled = false;
        this.ready = false;
        this.online = false;
        this.screen = screen;
        this.dim = {wd:200,ht:300,sx:10,sy:10,sw:180,sh:220,mw:map.width};
        this.y = this.screen.height-this.dim.ht;
        this.x = 0;
        this.txts = [];
        this.strength; 
        this.leeches = {troll:0, hater:0};
        this.txt = {msg:null, count:0};
        this.social = {likes:0, hates:0};
    };

    Device.prototype = {
        reset: function(){
            this.social = {likes:0, hates:0};
        },
        enable: function (strength){
            this.enabled = !this.enabled;
            this.strength = strength;
            this.txt = {msg:Const.txts.msgs[Util.Rnd(0, Const.txts.msgs.length)], count:0};
        },
        enter: function (){
            if(this.enabled){
                if(this.txt.count < this.txt.msg.length){
                    this.txt.count+=this.strength;
                }
                this.ready = this.txt.count >= this.txt.msg.length;
            }
        },
        send: function (){
            if(this.online && this.ready){
                this.txts.push({txt:this.txt.msg, like:0});
                this.enabled = false;
                this.ready = false;

                this.social.likes += Util.Rnd(0, 8-this.leeches.troll);
                this.social.hates += Util.Rnd(0, this.leeches.hater);
                
                return true;
            }
            return false;
        },
        update: function (plr, l){
            this.leeches = l;
            this.x = (plr.x > (this.dim.mw-(this.screen.width/2))) ? 100 : this.screen.width-this.dim.wd-100;
        },
        render: function (){
            if(this.enabled){
                Renderer.DrawBox({x:this.x, y:this.y, width:this.dim.wd, height:this.dim.ht}, '#000000', '#000000', 12, 0.8);
                Renderer.DrawBox({x:this.x+this.dim.sx, y:this.y+this.dim.sy, width:this.dim.sw, height:this.dim.sh}, '#ffffff', '#cccccc', 8, 0.7);
                
                Renderer.DrawBox({x:this.x+this.dim.sx+this.dim.sw-40, y:this.y+this.dim.sy+this.dim.sh+20, 
                    width:40, height:20}, (this.online && this.ready) ? '#00ff00' : '#555555', '#cccccc', 8, 0.8);
                
                if(this.online){
                    if(this.txt.count > 0){
                        this.tmsg(this.txt.msg, this.txt.count, this.y+this.dim.sy+this.dim.sh);
                    } 

                    Renderer.Sprite(this.x+(this.dim.wd/2), this.y+this.dim.sy+(this.dim.sh/2), 'selfie', 0, 8, 0, 1);
                    
                }else{
                    this.tmsg(" OFFLINE", 8, this.y+this.dim.sy+(this.dim.sh/2));
                }
            }
        },
        tmsg: function (txt, count, y){
            if(count > 32){
                y-=12;
            }
            Renderer.DrawText(txt.substr(0, count>32?32:count), this.x+this.dim.sx+2, y-2, Const.game.mobFont, '#000000');
            if(count > 32){
                y+=12;
                Renderer.DrawText(txt.substr(32, count-32), this.x+this.dim.sx+2, y-2, Const.game.mobFont, '#000000');
            }
        }

    };

    window.Device = Device;
})();