import angular from 'angular'
import 'angular-ui-router'

// angular.module('txthandler', [])
//   .service('openFile', [function(input) {
//     console.log(input);
//   });

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
    .state('manuscripts.new', {
      url: '/manuscript/new',
      templateUrl: 'manuscripts/new-manuscript.html',
      controller: function($stateParams, $state, $http) {
        //TODO: i think we will need to grab user ID here eventually so we have it to save on the new manu

        //TODO: problem: new manuscript is added to DB but doesn't show up in navigation bar until reload
        this.saveManu = function(manuscript){
          $http({method: 'POST', url: `/manuscripts`,
          data: JSON.stringify(manuscript)}).then(function(){
              $state.go('manuscripts.title', {manuscriptTitle: manuscript.title});
          });
        };
      },
      controllerAs: 'newManuCtrl'
    })
  })
