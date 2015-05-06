'use strict';


module.controller('CloudLayoutController', function ($scope) {

  var cloudLayout = this;
  var opts = {
    count: 200,
    maxCount: 200,
    width: 800,
    height: 600,
    font: 'Impact',
    rotator: 'cross',
    minFontSize: 10,
    maxFontSize: 80 
  };


	var rotationBy = {
		cross: function(d){
			return (~~(Math.random() * 3) - 1) * 90;
		},
		analog: function(d){
			return Math.random() * 180 - 90; 
		},
		horizontal: function(){
			return 0;
		}
	};

  cloudLayout.frameTransform = function() {
    return 'translate(' + opts.width / 2 + ', ' + opts.height / 2 + ')';
  };

  cloudLayout.transformer = function(item) {
    return 'translate(' + item.x + ', ' + item.y +')rotate(' + item.rotate + ')';
  };

  cloudLayout.style = function(item) {
    return {
      'font-family': opts.font,
      'font-size': item.fontSize + 'px',
      'color': 'black'
    };
  };

  cloudLayout.create = function (target) {

    var fontSize = d3.scale.log().range([opts.minFontSize, opts.maxFontSize]).domain([1, target.maxCount]);

    var layout = d3.layout.cloud().size([opts.width, opts.height])
    .words(target.data.map(function(word) {
      return {
        text: word.key, 
        size: word.count
      };
    }))
    .font(opts.font)
    .fontSize(function(d, i) { 
      //console.log(i, fontSize(+d.size));
      return (d.fontSize = fontSize(+d.size));
    })
    .rotate(rotationBy[opts.rotator])
    .padding(2)
    //.on('word', function(){
      //var p = ++pc*100/opts.count;
      //$('#progress div.bar').width(p+'%');
      //$('#progress').progressbar({value:p});
    //})
    .spiral('rectangular');

    //console.log(layout.start().words());
    layout.on('end', function (words){
      //$scope.$apply(function () {
        cloudLayout.words = words;
        console.log(cloudLayout.words);
      //});
    }).start();

    //cloudLayout.layout = layout.start();
  };

  $scope.$watch('main.history', function(history) {
    history && history.data && cloudLayout.create(history);
  });

});
