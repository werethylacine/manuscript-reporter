
//opens file from user, echoes first 200 characters of input back in #results section
//TODO: does this open files other than .txt? What sort of errors on imgs etc?
//TODO: what guard against bad-actor input?
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
      $("#results").append("<p>The beginning of your text: " + text.substring(0, 200) + "...</p>");
      $("#results").append("<p>Length of your text: " + textLength(textArr) + "</p>");

      //create dictionary from the array
      var dict = textDict(textArr);

      //adds dict[word][1], which is a true or false value indicating whether the word
      //was found in the Pearson english dictionary
      full_dict = nonEnglishWords(dict);

      //this timeout is not working for longer texts still. Plan to break out
      //separate section of just words that aren't in the dictionary & warns it
      //will take some time to load. Probable character names will be in here
      //too. No need for confirmation words are in dictionary.
      setTimeout(function(){
        console.log(full_dict);

        var frequencyTable = $('<table><thead><tr><th> Word </th><th> Frequency </th><th> DictWord</th></tr></thead><tbody></tbody></table>');
          for (var key in dict) {
            //console.log("in the dict!");
            var tr = $('<tr>');
                $('<td>').html(key).appendTo(tr);
                $('<td>').html(dict[key][0]).appendTo(tr);
                $('<td>').html(dict[key][1]).appendTo(tr);
                frequencyTable.append(tr);
        }
        $("#results").append(frequencyTable);

      }, 5000);

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

//TODO: functions: words used most often, words used only once, probable character names

//uses Pearson API to check if word is in the dictionary, returns boolean
function englishWord(word) {
    // make an AJAX call to the Pearson API
    $.ajax({
        url: "http://api.pearson.com/v2/dictionaries/entries?headword=" + word,
        success: function(response) {
            //console.log("We received a response from Pearson!");

            function lookupable(response) {
              var theAnswer = false;
              if (response.count > 0) {
                theAnswer = true;
              }
              return theAnswer;
            }
            //return lookupable(response);
            if (!lookupable(response)) {

              dict[word].push('false');
            }
            else {
              dict[word].push('true');
            }
            //why is this not returning??
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
