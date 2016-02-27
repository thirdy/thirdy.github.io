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
          lastEqualsIdx =  line.lastIndexOf('=');
          arr =  [ line.substring(0, lastEqualsIdx), line.substring(lastEqualsIdx) ];
          terms[arr[0]] = arr[1];
      }
    }
});
console.info(terms);

EsConnector.controller('ExileToolsHelloWorld', function($scope, es) {
  // Default
  $scope.searchInput = "attributes.baseItemType:Armour AND shop.updated:>1456191110199";
  $scope.doSearch = function() {
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
                   "query": $scope.searchInput
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