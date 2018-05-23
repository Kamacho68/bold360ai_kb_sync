const request = require('request');

// Return the JSON representation of the 3rd party KB content
// JSON format should be as follows:
// [ {"title" : "some title" ,"body" : "some body","labels" : "label1|label2|label3"} ]
// labels is optional


exports.fetchKB = function (KBFetchCompletionCB) {
	
	var json = [];
		
	request('https://sheets.googleapis.com/v4/spreadsheets/1gINcC20VYZbWQtNnpNsIeNXHTsGzOmN8JSp7E1845qk/values/A:B?key=AIzaSyCD8pdo4RRkfPaJNUWcAsLve2Zs3WG-2-g', { json: true }, (err, res, body) => {
	  if (err) { return console.log(err); }
	  
	  
	  for (var pos=0; pos<body.values.length; pos++) { json[pos] = { "title" : body.values[pos][0], "body" : body.values[pos][1] } };
	  return KBFetchCompletionCB(json);
	  	  
	});	
}
