import angular from 'angular'
import 'angular-ui-router'

angular.module('manuscriptpg', ["ui.router"])

  .factory("Details", function DetailsFactory() {

    return {
      message: function(){ return ("Hey, you connected with DetailsFactory!");},

      textCleaner: function(txt){
        //boolean trick to prevent ' ' results from http://stackoverflow.com/questions/10346722/how-can-i-split-a-javascript-string-by-white-space-or-comma
        //regex from http://stackoverflow.com/questions/20864893/javascript-replace-all-non-alpha-numeric-characters-new-lines-and-multiple-whi
        return txt.replace(/\W+/g, " ").split(" ").filter(Boolean);},

      textLength: function(txt_array) {return txt_array.length;},

      textDict: function(txt_array) {
        var dict = {};
        txt_array.forEach(function(word) {
          word = word.toLowerCase();
          //don't care about 1 & 2 & 3 letter words for now
          if (word.length > 3) {
            if (!dict[word]) {
              dict[word] = {};
              dict[word]["frequency"] = 0;
            }
            dict[word]["frequency"] += 1;
          }
        });
        return dict;
      },

      //uses Pearson API to check if word is in the dictionary, returns boolean
      //TODO: problem with Pearson = has entries for names like George, Judy, Edward. Therefore scheme
      //for finding names as common non-english words will not work for many texts.
      checkEnglish: function(dict) {
          var words = Object.keys(dict);
          words.forEach(function(word) {
          // make an AJAX call to the Pearson API
          $.ajax({
              url: "http://api.pearson.com/v2/dictionaries/entries?headword=" + word,
              success: function(response) {

                  //.count of the response will be 0 if the word wasn't in the dictionary
                  function lookupable(response) {
                    var theAnswer = false;
                    if (response.count > 0) {
                      theAnswer = true;
                    }
                    return theAnswer;
                  }

                  if (!lookupable(response)) {
                    dict[word]["isWord"] = 'false';
                  }
                  else {
                    dict[word]["isWord"] = 'true';
                  }
                  return lookupable(response);
                }
              });
            })
            return dict;
          },

        //takes a dictionary of words with frequencies, checks which can't be found in
        //english dictionary, returns dictionary of uniques with frequencies
        //TODO: could this just be a filter?
        nonEnglishWords: function(dict) {
          var uniques = {};
          for(var key in dict) {
            if (dict[key]["isWord"] == 'false') {
              uniques[key] = dict[key];
            }
          }
          return uniques;
        },

        //takes a dictionary of words with frequencies & returns array w/ range most frequently used words (default 15)
        mostFrequent: function(dict, range=15) {
          var mostFrequentDict = {};
          //this relies on the arr and keys coming back in the same order as each other from the dict; is that always true?
          var arr = Object.values(dict).map(function(obj) { return obj["frequency"] });
          var keys = Object.keys(dict);
          var max = 0;
          for (var i = 0; i < range; i++){
            max = Math.max.apply( null, arr )
            var key = keys.filter(function(key) {return dict[key]["frequency"] === max})[0];
            var index = keys.indexOf(key);
            mostFrequentDict[key] = dict[key];
            arr.splice(index, 1);
            keys.splice(index, 1);
          }

          return mostFrequentDict;
        },
    };
  })

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
      controller: function(manuscriptsService, $window) {
        //doesn't get assigned until all data is back from the DB
        this.manuscripts = manuscriptsService.data;
      },
      controllerAs: 'manpgCtrl',
    })
    .state('manuscripts.title', {
      url: '/:manuscriptTitle',
      templateUrl: 'manuscripts/manuscript-details.html',
      resolve: {
        manuscriptService: function($http, $stateParams, $window) {
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
      controller: function($stateParams, $state, $http, $window, Details) {

        this.add = function(){
          console.log("working on adding");
          var fileTarget = document.getElementById('file').files[0];
          var reader = new FileReader();
          reader.onloadend = function(e){
            var data = e.target.result;
            var frequencyManu = Details.textDict(Details.textCleaner(data));
            var APICheckedManu = Details.checkEnglish(frequencyManu);
            console.log("Length: ", Details.textLength(Details.textCleaner(data)));
            console.log("Most frequent words: ", Details.mostFrequent(frequencyManu));
            setTimeout(function() {
              console.log("Dictionary: ", Details.nonEnglishWords(APICheckedManu));
            }, 8000); //8000 is arbitrary here, just trying to give checkEnglish enough time to do the API requests

          }
          reader.readAsText(fileTarget);
        };

        //TODO: i think we will need to grab user ID here eventually so we have it to save on the new manu
        this.saveManu = function(manuscript){
          $http({method: 'POST', url: `/manuscripts`,
          data: JSON.stringify(manuscript)}).then(function(){
              //ugly but needed to get the new manuscript showing in nav. Seeking better solution!
              $window.location.reload();
              $state.go('manuscripts');
            });
        };
      },
      controllerAs: 'newManuCtrl'
    })
  })
