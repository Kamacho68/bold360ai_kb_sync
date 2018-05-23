////////////////////////////
// KB Sync Daemon 		  //
////////////////////////////

var kb_sync_settings = require('./kb_sync_settings.json');

bold_endpoint = {
	apiKey : "", // account API key
	server : "",  // bold360ai server
	account : "", // bold360ai account
	kb : "",  // bold360ai KB
};

sync_options = { 
	directions : "ThirdPartyToBold", // one-way synchronization
	writeMode : "CreateAndUpdate", // perform both creation and update of articles
	matching_algorithm : "Flexible" // titles can have some characters differences and still be identified as identical questions
};

sync_frequency = 3000; // synchronization frequency


// Code - No need to modify

var kb_sync = require('./kb_sync.js');

setInterval(function() {

	kb_sync.fetch_third_party_kb(function(json) { kb_sync.fetch_bold_kb(kb_sync_settings.bold_endpoint, [], function(body) { kb_sync.SyncKBs(kb_sync_settings.bold_endpoint, sync_options); } );  });

}, sync_frequency);