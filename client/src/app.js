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
        manuscriptService: function($http, $stateParams) {
          //first $ is string interpolation syntax; second is angular variable. Wow!
          return $http.get(`/manuscripts/${ $stateParams.manuscriptTitle }`);
        }
      },
      controller: function(manuscriptService) {
        this.manuscript = manuscriptService.data;
      },
      controllerAs: 'manuscriptCtrl',
    })
  })
