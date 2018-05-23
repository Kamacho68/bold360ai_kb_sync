
// Return the JSON representation of the 3rd party KB content
// JSON format should be as follows:
// [ {"title" : "some title" ,"body" : "some body","labels" : "label1|label2|label3"} ]
// labels is optional


exports.fetchKB = function (KBFetchCompletionCB) {
	
	var json = [];
	return KBFetchCompletionCB(json);
	
}
