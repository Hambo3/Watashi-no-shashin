var Util = {

    Rnd: function (min, max){
        return parseInt(Math.random() * (max-min)) + min;
    }, 
    Lerp: function(start, end, amt)
    {
        return (end-start) * amt+start;
    }
}

// a v simple object pooler
var ObjectPool = function () {
    var list = [];

    return {
        Add: function(obj){
            for (var i = 0; i < list.length; i++) {
                if (list[i].enabled == false)
                {
                    list[i] = obj;
                    return list[i];
                }
            }
            list.push(obj);         
        },
        Get: function(){
            return list.filter(l => l.enabled);
        },
        Count: function(all){
            return (all) ? list : list.filter(l => l.enabled).length;
        }      
    }
};

var Const = {
    game:{
        friction:6,
        mobFont:"12px Arial",
        h1Font:"bold 48px Arial",
        h2Font:"24px Arial",
        h3Font:"16px Arial"
    },
    actors:{
        player:1,
        shopr: 2,
        troll: 3,
        hater: 4,
    },
    txts:{
        msgs:[
        'At the mall, lol',
        'Really need the loo',
        'Ive been here for ages',
        'Just seen @BrianHambo3',
        'Need a charge point, lol',
        'Outside Pret lol',
        'Going to get new shoes',
        'Where can I get a doughnut',
        'I always wanted to be a lumberjack']
    }
}
