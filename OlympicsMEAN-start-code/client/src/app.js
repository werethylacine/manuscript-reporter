import angular from 'angular'
angular.module('manuscriptpg', [])
.controller('manuscriptpgController', function($http) {
  //sends http request to /words endpoint, when it comes back assigns response data to this.words
  $http.get("/words").then((response) => {
    this.words = response.data;
    console.log(this.words);
  });
})
