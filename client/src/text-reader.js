
//opens file from user, echoes first 200 characters of input back in #results section
//TODO: murmurhash? for dictionary hashing
//authentication libraries for node - passport - sign in through Google 
//TODO: does this open files other than .txt? What sort of errors on imgs etc?
//TODO: what guard against bad-actor input?
//TODO: going to need a "table-izer" function... input both dictionaries and arrays...
var openFile = function(event) {
    var input = event.target;
    $("#results").text("Hold tight, your text is being processed!");
    //FileReader docs: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    var reader = new FileReader();
    reader.onload = function(){
      //clears old input from #results
      $("#results").text('');
      var text = reader.result;
      var textArr = textCleaner(text);
      $("#results").append("<p><b>The beginning of your text:</b> " + text.substring(0, 200) + "...</p>");
      $("#results").append("<p><b>Length of your text:</b> " + textLength(textArr) + "</p>");

      //create frequency dictionary from the array
      var dict = textDict(textArr);

      //creates frequency table
      var frequencyTable = $('<table><thead><tr><th> Word </th><th> Frequency </th></tr></thead><tbody></tbody></table>');
      frequencyTable.before('<h2>Frequency of all words</h2>');
        for (var key in dict) {
          //console.log("in the dict!");
          var tr = $('<tr>');
              $('<td>').html(key).appendTo(tr);
              $('<td>').html(dict[key][0]).appendTo(tr);
              frequencyTable.append(tr);
      }
      $("#results").append(frequencyTable);

      var mostFrequentTable = $('<table><thead><tr><th> Word </th><th> Frequency </th></tr></thead><tbody></tbody></table>');
      mostFrequentTable.before('<h2>Most Frequent Words</h2>');
      finishedMostFrequent = mostFrequent(dict);

      for (var idx = 0; idx < finishedMostFrequent.length; idx++) {

        var tr = $('<tr>');
            $('<td>').html(finishedMostFrequent[idx][0]).appendTo(tr);
            $('<td>').html(finishedMostFrequent[idx][1]).appendTo(tr);
            mostFrequentTable.append(tr);
      }
      $("#results").append(mostFrequentTable);


      //adds dict[word][1], which is a true or false value indicating whether the word
      //was found in the Pearson english dictionary
      nonEnglishWords(dict);

      //this timeout is not working for longer texts still.
      //couldn't get .ajaxStop to work
      // could http://api.jquery.com/jQuery.when/ be a solution?
      setTimeout(function(){

        var notEnglishTable = $('<table><thead><tr><th> Word </th><th> Frequency</th></tr></thead><tbody></tbody></table>');
        notEnglishTable.before('<h2>Words that May Not Be English</h2><p>May not work on scientific language or slang</p>');

        var charNames = $('<table><thead><tr><th> Word </th><th>Frequency</th></tr></thead><tbody></tbody></table>');
        charNames.before('<h2>Possible Character Names</h2>');

          for (var key in dict) {

            if (dict[key][1] == "false"){
              var tr = $('<tr>');
              var tr_names = $('<tr>');
              //if this non-english word shows up 5 or fewer times, send it to the non-english table
              if (dict[key][0] <= 5) {
                  $('<td>').html(key).appendTo(tr);
                  $('<td>').html(dict[key][0]).appendTo(tr);
                  notEnglishTable.append(tr);
              }
              //if it shows up more than 5 times, send it to the possible-character-names table
              else {
                $('<td>').html(key).appendTo(tr_names);
                $('<td>').html(dict[key][0]).appendTo(tr_names);
                charNames.append(tr_names);
              }
          }
        }
        $("#results").append(charNames);
        $("#results").append(notEnglishTable);
      }, 15000); //GROSS EW

    };
    reader.readAsText(input.files[0]);
  };

//takes string input and returns array cleaned of punctuation, carriage
//returns, rando white spaces
var textCleaner = function(txt){
  //boolean trick to prevent ' ' results from http://stackoverflow.com/questions/10346722/how-can-i-split-a-javascript-string-by-white-space-or-comma
  //regex from http://stackoverflow.com/questions/20864893/javascript-replace-all-non-alpha-numeric-characters-new-lines-and-multiple-whi
  return txt.replace(/\W+/g, " ").split(" ").filter(Boolean);
};

//this is split out in a separate function because there are different
//ways to measure text length & this will later get more elaborate
var textLength = function(txt_array) {
  return txt_array.length;
};

//creates dictionary (maybe called hash in JS?) of word frequency from text array input
//textDict[word][0] is frequency
var textDict = function(txt_array) {
  dict = {};
  txt_array.forEach(function(word) {
    word = word.toLowerCase();
    //don't care about 1 & 2 & 3 letter words for now
    if (word.length > 3) {
      if (!dict[word]) {
        dict[word] = [0];
      }
      dict[word][0] += 1;
    }
  });
  return dict;
}

//uses Pearson API to check if word is in the dictionary, returns boolean
//TODO: problem with Pearson = has entries for names like George, Judy, Edward. Therefore scheme
//for finding names as common non-english words will not work for many texts.
function englishWord(word) {
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
              dict[word].push('false');
            }
            else {
              dict[word].push('true');
            }
            return lookupable(response);
          }
        });
      }

//takes a dictionary of words with frequencies, checks which can't be found in
//english dictionary, returns dictionary of uniques with frequencies
//TODO: could this just be a filter?
var nonEnglishWords = function(dict) {
  var uniques = {};
  for(var key in dict) {
    if (!englishWord(key)) {
      uniques[key] = dict[key];
    }
  }
  return uniques;
}

//takes a dictionary of words with frequencies & returns array w/ range most frequently used words (default 25)
function mostFrequent(dict, range=25) {
  mostFrequentArr = [];
  //this relies on the arr and keys coming back in the same order as each other from the dict; is that always true?
  var arr = Object.values(dict).map(function(arr) { return arr[0] });
  var keys = Object.keys(dict);
  var max = 0;
  for (var i = 0; i < range; i++){
    max = Math.max.apply( null, arr )
    var key = keys.filter(function(key) {return dict[key][0] === max})[0];
    var index = keys.indexOf(key);
    mostFrequentArr.push([key, max]);
    arr.splice(index, 1);
    keys.splice(index, 1);
  }

  return mostFrequentArr;
}
