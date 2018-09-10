//私の写真
//Watashi no shashin

(function() {
    function Gordon(levelMap) {
        this.map = new MapManager();
        this.map.SetMap(levelMap);

        this.mapPw = this.map.MapSize().width - 64;
        this.mapPh = this.map.MapSize().height - 64;

        this.maxEnemy = 8;

        this.clock;
        this.decider = 0;
        this.badguys = new ObjectPool(); 

        this.mainTitle = new Title(this.map.ScreenSize());
        this.mainTitle.enabled = true;

        this.player = new Player( 640, 64, 32,32,
            {up:'playeru',down:'playerd'},
            'playerd',
            {l:8, r:23, t:10, b:31 } );
        this.player.enabled = false;

        this.wifi = new WiFi(this.mapPw, this.mapPh);        

        this.gameInfo = new Info(this.map.ScreenSize());
        this.gameInfo.enabled = false;

        this.player.mob = new Device(this.map.ScreenSize(), this.map.MapSize());

        this.decider = Util.Rnd(120, 240);

        input.onKeyUp(function(k){
            if(this.Asset.player.enabled)
            {
                if (k == 'B') { 
                    this.Asset.player.txt();
                }         
                if(k == 'RET'){
                    if(this.Asset.player.mob.send())
                    {
                        this.Asset.wifi.reset();
                    }
                }
                if (k == 'SPACE') {
                    this.Asset.player.mob.enter();
                }
            }
            else{
                if(k=='B')
                {
                    if(this.Asset.mainTitle.screen ==2){
                        this.Asset.mainTitle.screen =0;
                    }else{                    
                        this.Asset.mainTitle.screen++;
                    }
                    if(this.Asset.mainTitle.screen == 2)
                    {
                        this.Asset.player.start(640, 64);
                        this.Asset.gameInfo.enabled = true;
                        this.Asset.mainTitle.enabled = false;

                        this.Asset.wifi.enabled = true;
                        this.Asset.wifi.reset();
                        this.Asset.maxEnemy = 8;
                        this.Asset.clock = new Date();
                    }
                }
            }

            if (k == 'ESC') {//'\u001b') {escape
                this.Asset.gameOver();
            }
        });
    };

    Gordon.prototype = {
        GetAbsHitBox: function (xp, yp, box){
			return {
					x:xp+box.l, y:yp+box.t, 
					width:Math.abs(box.r)-Math.abs(box.l),
					height:Math.abs(box.b)-Math.abs(box.t)
				};
		},	
		RectHit: function (prot, perp){
			return (prot.x < perp.x + perp.width &&
				prot.x + prot.width > perp.x &&
				prot.y < perp.y + perp.height &&
				prot.height + prot.y > perp.y);
        },
        IsTouching: function (prot, perp){
            var sides = {l:false, r:false, t:false, b:false};
            sides.l = ( (prot.x < perp.x + perp.width && prot.x > perp.x) &&
                        (prot.y+1 < perp.y + perp.height && prot.height + prot.y -1 > perp.y)
                      );
            sides.r = ( (prot.x + prot.width < perp.x + perp.width && prot.x + prot.width > perp.x) && 
                        (prot.y+1 < perp.y + perp.height && prot.height + prot.y -1 > perp.y)
                      );

            sides.t = ( (prot.y < perp.y + perp.height && prot.y > perp.y) &&
                        (prot.x+1 < perp.x + perp.width && prot.x + prot.width-1 > perp.x)
                      );    
            sides.b = ( (prot.y+prot.height < perp.y + perp.height && prot.y+prot.height > perp.y) &&
                      (prot.x+1 < perp.x + perp.width && prot.x+prot.width-1 > perp.x)
                    );    
			return sides;
        }, 
        CheckTouching: function(protagonist, perps){
            //determing touching player
            protagonist.touching = {l:false, r:false, t:false, b:false};
            for(var i = 0; i < perps.length; i++) {
                if(perps[i] != protagonist){                    
                    var sides = this.IsTouching(this.GetAbsHitBox(protagonist.x, protagonist.y, protagonist.sideBox()), 
                                this.GetAbsHitBox(perps[i].x, perps[i].y, perps[i].hitBox()));

                    protagonist.touching.l = (sides.l == true) ? true : protagonist.touching.l;
                    protagonist.touching.r = (sides.r == true) ? true : protagonist.touching.r;
                    protagonist.touching.t = (sides.t == true) ? true : protagonist.touching.t;
                    protagonist.touching.b = (sides.b == true) ? true : protagonist.touching.b;
                }
            }
        },
        CheckCollisions: function(obj, perps){
            
            //detect
            for(var i = 0; i < perps.length; i++) {
                if(perps[i] != obj){       
                    //collision
                    if(this.RectHit(this.GetAbsHitBox(obj.x+obj.dx, obj.y+obj.dy, obj.hitBox()), 
                        this.GetAbsHitBox(perps[i].x+perps[i].dx, perps[i].y+perps[i].dy, perps[i].hitBox())))
                            {
                                var h = false;
                                var v = false;
                                //if hori
                                if(obj.dx != 0){
                                    if(this.RectHit(this.GetAbsHitBox(obj.x+obj.dx, obj.y, obj.hitBox()), 
                                        this.GetAbsHitBox(perps[i].x+perps[i].dx, perps[i].y+perps[i].dy, perps[i].hitBox())))
                                    {
                                        h = true;
                                    }
                                }	
                    
                                //if vert
                                if(obj.dy != 0){
                                    if(this.RectHit(this.GetAbsHitBox(obj.x, obj.y+obj.dy, obj.hitBox()), 
                                        this.GetAbsHitBox(perps[i].x+perps[i].dx, perps[i].y+perps[i].dy, perps[i].hitBox())))
                                    {
                                        v = true;
                                    }
                                } 
                               
                                obj.dx = (h==true)? obj.dx = 0: obj.dx;
                                obj.dy = (v==true)? obj.dy = 0: obj.dy;
                            }
                           
                }
            }
            return (h||v);
        }, 
        decisions: function(){
            if(this.badguys.Count() < this.maxEnemy){   
                var doods = this.badguys.Get();
                var clxpool = [];   
                for (var i = 0; i < doods.length; i++) {
                    clxpool.push(doods[i]);
                }
                clxpool.push(this.player);

                var vis, cp;
                var e = new Enemy(
                    0, 0, 32, 32, 
                    [{up:'shopru',down:'shoprd'},
                    {up:'trollu',down:'trolld'},
                    {up:'hateru',down:'haterd'}], 'shoprd',
                    {l:8, r:23, t:10, b:31 } );

                do{
                    e.x = Util.Rnd(32, this.mapPw);
                    e.y = Util.Rnd(32, this.mapPh);
                    vis = this.map.IsVisible(e);
                    cp = this.CheckCollisions(e, clxpool);
                }while(vis || cp || this.map.mapCollision(e, true) );

                e.set(this.player,this.wifi, {wt:this.mapPw, ht:this.mapPh}, 
                    (Util.Rnd(0, 4) == 0) ? Const.actors.hater : Const.actors.troll);
                this.badguys.Add(e);                
            }

            this.decider = Util.Rnd(120, 240);
        },
        gameOver: function(){
            this.maxEnemy = 8;
            this.player.stop();
            this.gameInfo.enabled = false;
            this.mainTitle.pscore = this.player.score();
            this.mainTitle.enabled = true;
        },
        update: function(dt) {
        
            if(--this.decider < 0 ){
                this.decisions();
            }
  
            var enemies = this.badguys.Get();
            var clxpool = [];
            var tpool = [];          
            for (var i = 0; i < enemies.length; i++) {
                clxpool.push(enemies[i]);
                tpool.push(enemies[i]);
            }

            if(this.player.enabled){  
                this.CheckTouching(this.player, tpool );
                tpool.push(this.player);
            }

            for(var e = 0; e < enemies.length; e++){
                //determine if can move
                this.CheckTouching(enemies[e], tpool );          
            }

            if(this.player.enabled){            
                this.player.logic(dt);
                this.map.mapCollision(this.player, false);

                //determin collisions 
                this.CheckCollisions(this.player, enemies);

                clxpool.push(this.player);
            }

            for(var e = 0; e < enemies.length; e++) 
            {
                //do move
                enemies[e].logic(dt);
                if(this.map.mapCollision(enemies[e], false))
                {
                    enemies[e].reset();
                }

                this.CheckCollisions(enemies[e], clxpool);
            } 

            //update
            this.map.ScrollTo(this.player.x, this.player.y);
            var mp = this.map.ScrollOffset(); 

            this.player.update(dt, mp); 

            this.player.strength = this.wifi.InRange(this.player, true);
            if(!this.wifi.active && this.player.strength > 0)
            {
                this.wifi.active = true;
            }
            for(var e = 0; e < enemies.length; e++) { 
                enemies[e].visible = this.map.IsVisible(enemies[e]);
                enemies[e].update(dt, mp);
                if(this.wifi.active){
                    this.wifi.InRange(enemies[e], false);
                }
            }
            var elapsed = (new Date() - this.clock) / 1000;
         
            this.wifi.CheckSignal();
            this.gameInfo.update(this.player.strength, this.player.score(), elapsed);
            this.player.mob.update(this.player, this.wifi.users);

            this.maxEnemy = parseInt(elapsed / 16)+16;

            if(elapsed > 480){
                this.gameOver();
            }
this.gameInfo.debug = "["+this.maxEnemy+"]["+ this.badguys.Count() + "]";

        },
        render: function() {
            var enemies = this.badguys.Get();
            this.map.Render(0);

            if(this.player.enabled){
                this.player.render();  
            }
            
            for(var e = 0; e < enemies.length; e++) {
                enemies[e].render();
            }
            this.map.Render(1);

            this.gameInfo.render();

            this.player.mob.render();

            this.mainTitle.render();
        }
    };

    window.Gordon = Gordon;
})();
