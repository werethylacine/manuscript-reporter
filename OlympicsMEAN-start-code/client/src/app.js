import angular from 'angular'
import 'angular-ui-router'

angular.module('manuscriptpg', ["ui.router"])

  .config(($stateProvider, $urlRouterProvider) => {
    //if no url is specified go to /manuscripts
    $urlRouterProvider.otherwise('/manuscripts')

    $stateProvider
    .state('manuscripts', {
      url: '/manuscripts',
      templateUrl: 'manuscripts/manuscripts-nav.html',
      //resolve says "don't load template until you've finished what's in here"
      resolve: {
        manuscriptsService: function($http) {
          return $http.get("/manuscripts");
        }
      },
      controller: function(manuscriptsService) {
        //doesn't get assigned until all data is back from the DB
        this.manuscripts = manuscriptsService.data;
      },
      controllerAs: 'manpgCtrl',
    })
    .state('manuscripts.title', {
      url: '/:manuscriptTitle',
      templateUrl: 'manuscripts/manuscript-details.html',
      resolve: {
        //q is angular's implementation of a promise, so this is just temporary mock-up data
        manuscriptService: function($q) {
          return $q((resolve, reject) => {
            let manuscript = {
              "owner": 123456,
              "title": "Nihilist Punk Cooking",
              "author": "Snuggly Bandersnatch",
              "contents": [
                {"word": "eat", "frequency": 12, "isWord": true},
                {"word": "god", "frequency": 10, "isWord": true},
                {"word": "pukeathon", "frequency": 1, "isWord": false}
              ]};
              resolve({ data: manuscript });
          })
        }
      },
      controller: function(manuscriptService) {
        this.manuscript = manuscriptService.data;
      },
      controllerAs: 'manuscriptCtrl',
    })
  })
