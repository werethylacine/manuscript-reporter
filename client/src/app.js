import angular from 'angular'
import 'angular-ui-router'

angular.module('manuscriptpg', ["ui.router"])

  .factory("Delete", ['$http', function($http){
    return {
      removeManu: function(manu_id) {
        return $http.delete('/manuscripts/' + manu_id + '/removeManu');
      }
    }
  }])

  .factory("Details", function DetailsFactory() {

    return {
      message: function(){ return ("Hey, you connected with DetailsFactory!");},

      textLength: function(txt) { return txt.length; },

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
              dict[word] = {"frequency": 0};
              //dict[word]["frequency"] = 0;
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
        mostFrequent: function(dict, range=25) {
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
        manuscriptService: function($http, $stateParams, $state, $window, Delete, Details) {
          //first $ is string interpolation syntax; second is angular variable. Wow!
          return $http.get(`/manuscripts/${ $stateParams.manuscriptTitle }`);
        }
      },
      controller: function(manuscriptService, Delete, $state, $window, Details) {
        this.manuscript = manuscriptService.data;
        this.mostFrequent = Details.mostFrequent(this.manuscript.contents);
        this.notEnglish = Details.nonEnglishWords(this.manuscript.contents);

        this.remove = function(manuscript_id) {
          if (confirm("Are you sure you want to delete this manuscript?")) {
              Delete.removeManu(manuscript_id);
              //not a pretty way to refresh but it will do for now
              $window.location.reload();
              $state.go('manuscripts');
            }
          };
      },
      controllerAs: 'manuscriptCtrl',
    })
    .state('manuscripts.new', {
      url: '/manuscript/new',
      templateUrl: 'manuscripts/new-manuscript.html',
      controller: function($stateParams, $state, $http, $window, Details) {

        //TODO: i think we will need to grab user ID here eventually so we have it to save on the new manu
        this.saveManu = function(manuscript){
          var fileTarget = document.getElementById('file').files[0];
          var reader = new FileReader();
          reader.onloadend = function(e){
            var data = e.target.result;
            var cleaned = Details.textCleaner(data);
            var length = Details.textLength(cleaned);
            var frequencyManu = Details.textDict(cleaned);
            var isEnglishFrequencyManu = Details.checkEnglish(frequencyManu);
            manuscript["length"] = length;
            manuscript["contents"] = isEnglishFrequencyManu;
          }
          reader.readAsText(fileTarget);
          setTimeout(function() {
            $http({method: 'POST', url: `/manuscripts`,
            data: JSON.stringify(manuscript)}).then(function(){
                //ugly but needed to get the new manuscript showing in nav. Seeking better solution!
                $window.location.reload();
                $state.go('manuscripts');
              });
            }, 2000);
        };
      },
      controllerAs: 'newManuCtrl'
    })
  })
