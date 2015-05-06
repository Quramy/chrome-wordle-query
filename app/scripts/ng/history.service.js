'use strict';

angular.module('extension').factory('history', function ($q, stopwords) {
  // TODO Remove tmp
  var opts = {
    ignoreMultiByteChar: true,
    count: 200
  };

  var summarize = function(opts, res){
    var wordMap={}, words=[],maxCount = -1;
    var minDate= new Date(),maxDate=0;
    res.forEach(function(history){
      var query=[];
      var adjoints=[];
      //if(query=history.url.match(/(www\.google|www\.bing\.com|yahoo).*search.*[&\?#]q=([^&]+)/)){
      if(query=history.url.match(/(www\.google|www\.bing\.com|yahoo).*[&\?#]q=([^&]+)/)){
        (adjoints = decodeURIComponent(query[2]).split(/[\+\s]/).map(function(it){return it.toLowerCase();})).forEach(function(word){
          var ref;
          if(opts.ignoreMultiByteChar && !word.match(/^[\x01-\x7f]+$/)) return;
          if(stopwords[word]) return;
          if(!word.match(/[a-zA-Z]/)) return;
          if(!wordMap[word]){
            ref = {
              key: word,
              count: 1,
              histories: [],
              date: history.lastVisitTime,
              adjointMap: {}
            };
            words.push(word);
            wordMap[word] = ref;
          }else{
            (ref=wordMap[word]).count++;
            ref.date = history.lastVisitTime > ref.date ? history.lastVisitTime:ref.date;
          }
          adjoints.forEach(function(it){
            if(it !== word){
              ref.adjointMap[it]=it;
            }
          });
          ref.histories.push(history);
          maxCount = ref.count > maxCount ? ref.count : maxCount;
          maxDate = Math.max(maxDate, ref.date);
          minDate = Math.min(minDate, ref.date);
        });
      }
    });
    var target = words.sort(function(a,b){
      var diffCount = wordMap[b].count-wordMap[a].count;
      return diffCount !== 0 ? diffCount : wordMap[b].date - wordMap[a].date;
    }).slice(0, opts.count).map(function(word){
      return {
        key: word,
        count: wordMap[word].count,
        date: wordMap[word].date,
        adjoints: []
      };
    });
    var indexMap = {};
    target.forEach(function(word, i){indexMap[word.key] = i;});
    target.indexOf = function(arg){
      var key;
      if(typeof(arg) === 'string'){
        key = arg;
      }else{
        key = arg.key;
      }
      return indexMap[key]>=0?indexMap[key]:-1;
    };
    target.get = function(key){
      return this[this.indexOf(key)];
    };
    target.forEach(function(word){
      for(var adjoint in wordMap[word.key].adjointMap){
        if(target.indexOf(adjoint) !== -1){
          word.adjoints.push(target.get(adjoint));
        }
      }
    });
    return {
      data:target,
      maxCount:maxCount,
      minDate:minDate,
      maxDate:maxDate
    };
  };

  return function (options) {
    var dfrd = $q.defer();
    chrome.extension.sendRequest({
      type:'history',
      params: {
        startTime: 0,
        maxResults: 20000
      }
    }, function (res) {
      //console.log(res);
      dfrd.resolve(summarize(options || opts, res));
    });
    return dfrd.promise;
  };

});
