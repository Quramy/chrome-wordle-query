'use strict';

var module = angular.module('extension', []);

module.controller('MainController', function (history) {
  var main = this;
  main.message = 'Hello, world';
  history().then(function (data) {
    console.log(data);
    main.history = data;
  });
  
});

