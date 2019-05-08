//a generic object that all gameobjects inherit as their on screen presence
var Sprite = function () {
    var src;
    var x = 0;
    var y = 0;
    var scale = 1;
    var rotation = 0;
    var alpha = 1;
    var frame = 0;

    function update(dt) {
    }

    function render() {
        Renderer.Sprite(x, y, src, frame, scale, rotation, alpha);
    }
    return {
        Init: function (options) {
            x = options.x;
            y = options.y;
            src = options.src;
            logic = options.logic;
            scale = options.scale || scale;
        },
        Update: function(dt, args){
            x = (args.x != null) ? args.x : x;
            y = (args.y != null) ? args.y : y;
            frame = (args.frame != null) ? args.frame : frame;
            src = args.src || src;
            scale = (args.scale != null) ? args.scale : scale;
            rotation = (args.rotation != null) ? args.rotation : rotation;
            alpha = (args.alpha != null) ? args.alpha : alpha;

            update(dt);
        },
        Render: function(){
            render();
        }        
    }
};
