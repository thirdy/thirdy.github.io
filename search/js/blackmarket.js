
// Load Terms Map
var terms = {};
$.ajax({
    url:'terms/itemtypes.txt',
    success: function (data){
      //parse your data here
      //you can split into lines using data.split('\n') 
      //an use regex functions to effectively parse it
      var lines = data.split('\n');
      for(i in lines) {
          var line = lines[i];
          if(line.trim().length > 0 && !line.startsWith(';')) {
              var lastEqualsIdx = line.indexOf("=");
              var regex = line.substring(0, lastEqualsIdx).trim();
              terms[regex] = line.substring(lastEqualsIdx + 1).trim();
          }
      }
    }
});

function parseSearchInput(input) {
    var tokens = input.split(" ");
    var queryTokens = [];
    console.info("tokens=" + tokens);
    for (i in tokens) {
        var token = tokens[i];
        var evaluatedToken = token;
        if ( token != "OR" && token != "AND" ) {
            evaluatedToken = evalSearchTerm(token);
            console.info(token + "=" + evaluatedToken);
            if (evaluatedToken && hasBackTick(evaluatedToken)) {
                evaluatedToken = parseSearchInput(evaluatedToken);
            }
        }
        queryTokens.push(evaluatedToken);
    }
    var queryString = queryTokens.join(" ");
    console.info("queryString=" + queryString);
    return queryString;
}

function evalSearchTerm(token) {
    var result = "";
    for (regex in terms) {
       if (terms.hasOwnProperty(regex)) {
        var rgex = new RegExp('^' + regex + '$');
        var foundMatch = rgex.test(removeParensAndBackTick(token));
        if (foundMatch) {
            result = terms[regex];
            if (hasOpenParen(token))  result = '(' + result;
            if (hasCloseParen(token)) result = result + ')';
            break;
        }
      }
    }
    return result;
}

function removeParensAndBackTick(token) {
    var _token = token.replace(/[\(\)`]/g, "");
    return _token;
}

function hasOpenParen(token) {
    return token.startsWith('(');
}

function hasCloseParen(token) {
    return token.endsWith(')');
}

function hasBackTick(token) {
    return token.indexOf('`') != -1;
}