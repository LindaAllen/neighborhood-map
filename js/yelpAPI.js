//Uses phone number from data model to retrieve data from Yelp.
var yelpRequest = function(phoneNumber, callback){

  var auth = {
    consumerKey: "VtY9bp3YAPk2fzdsi0SuxQ",
    consumerSecret: "7UXzcP81_dJeC7iaxIeDsGN5ZwI",
    accessToken: "thK0P36ATh5_oePuLscH5vpmBFIG3rzr",
    // For class exercise only. For a real application, you would not expose your tokens and secrets
    accessTokenSecret: "ggGYlGisPygrT7UagcraScr4w8Q",
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };

  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };

  myParameters = [];

  myParameters.push(['phone', phoneNumber]);
  myParameters.push(['callback', 'cb']);
  myParameters.push(['oauth_consumer_key', auth.consumerKey]);
  myParameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  myParameters.push(['oauth_token', auth.accessToken]);
  myParameters.push(['oauth_signature_method', 'HMAC-SHA1']);

  var myMessage = {
    'action': 'http://api.yelp.com/v2/phone_search', //Uses Yelp API Phone Search.
    'method': 'GET',
    'parameters': myParameters
  };

  OAuth.setTimestampAndNonce(myMessage);
  OAuth.SignatureMethod.sign(myMessage, accessor);

  var parameterMap = OAuth.getParameterMap(myMessage.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

  $.ajax({
    'url': myMessage.action,
    'data': parameterMap,
    'cache': true,
    'dataType': 'jsonp',
    'success': function(data, textStats, XMLHttpRequest) {
      callback(data.businesses[0]);
    }
  }).fail(function(e){
    $('#yelpWindow').text("Error: Yelp data could not be loaded");  //Error handling - Display error message
  });                                                               //in infowindow if the ajax request does not succeed.
};
