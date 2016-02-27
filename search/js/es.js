// We define an EsConnector module that depends on the elasticsearch module.     
var EsConnector = angular.module('EsConnector', ['elasticsearch']);

// Create the es service from the esFactory
EsConnector.service('es', function (esFactory) {
  return esFactory({ host: 'http://apikey:DEVELOPMENT-Indexer@api.exiletools.com' });
});

// Load Terms Map
var terms = {};
$.ajax({
    url:'terms/itemtypes.txt',
    success: function (data){
      //parse your data here
      //you can split into lines using data.split('\n') 
      //an use regex functions to effectively parse it
      lines = data.split('\n');
      for(i in lines) {
          line = lines[i];
          if(line.trim().length > 0 && !line.startsWith(';')) {
              lastEqualsIdx =  line.indexOf("=");
              regex = line.substring(0, lastEqualsIdx).trim();
              terms[regex] = line.substring(lastEqualsIdx + 1).trim();
          }
      }
    }
});

function parseSearchInput(input) {
    tokens = input.split(" ");
    result = [];
    for (i in tokens) {
        token = tokens[i];
        if ( token != "OR" || token != "AND") {
            for (regex in terms) {
               if (terms.hasOwnProperty(regex)) {
                rgex = new RegExp(regex);
                foundMatch = rgex.test(token);
                if (foundMatch) {
                    result.push(terms[regex]);
                    break;
                }
              }
            }
        } else {
            result.push(token);
        }
    }
    resultStr = result.join(" ");
    return resultStr;
}

EsConnector.controller('ExileToolsHelloWorld', function($scope, es) {
  // Default
  $scope.searchInput = "gloves OR boots";
  // attributes.baseItemType:Armour AND shop.updated:>1456191110199
  $scope.doSearch = function() {
          console.log(terms);
          searchQuery = parseSearchInput($scope.searchInput);
          console.log(searchQuery);
          
          es.search({
          index: 'index',
          body: {
            "sort": [
              {
                "shop.updated": {
                  "order": "desc"
                }
              }
            ], 
            "query": {
                "query_string": {
                   "query": searchQuery
                }
            },
            // Is this faster?
            /*"query": {
              "filtered": {
                "query": {
                    "query_string": {
                       "query": $scope.searchInput
                    }
                }
              }
            },*/
            size:100
          }
          }).then(function (response) {
            $scope.Response = response;
          }, function (err) {
            console.trace(err.message);
          });
  }
});

// Custom Directive
EsConnector.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});