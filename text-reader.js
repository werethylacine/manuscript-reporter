
//opens file from user, echoes first 200 characters of input back in #results section
//TODO: does this open files other than .txt? What sort of errors on imgs etc?
//TODO: what guard against bad-actor input?
var openFile = function(event) {
    var input = event.target;

    //FileReader docs: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    var reader = new FileReader();
    reader.onload = function(){
      //clears old input from #results
      $("#results").text("");
      var text = reader.result;
      var textArr = textCleaner(text);
      $("#results").append("<p>The beginning of your text: " + text.substring(0, 200) + "...</p>");
      $("#results").append("<p>Length of your text: " + textLength(textArr) + "</p>");
      //console.log(textArr);
      var dict = textDict(textArr);
      console.log(dict);

      var frequencyTable = $('<table><thead><tr><th> Word </th><th> Frequency </th></tr></thead><tbody></tbody></table>');
        for (var key in dict) {
          console.log("in the dict!");
          var tr = $('<tr>');
              $('<td>').html(key).appendTo(tr);
              $('<td>').html(dict[key]).appendTo(tr);
              frequencyTable.append(tr);
        }
        $("#results").append(frequencyTable);

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
//TODO: what's to be done about capitalized words?
var textDict = function(txt_array) {
  dict = {};
  txt_array.forEach(function(word) {
    //don't care about 1 & 2 letter words for now
    if (word.length > 2) {
      if (!dict[word]) {
        dict[word] = 0;
      }
      dict[word] += 1;
    }
  });
  return dict;
}

//TODO: functions: words used most often, words used only once, probable character names
