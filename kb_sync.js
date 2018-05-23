/*
	Bold360ai Knowledge-base Sync SDK
*/

const request = require('request');
var third_party_kb_provider = require('./3rd_party_kb_provider.js');

// String Scoring Algorithm 0.1.22 | (c) 2009-2015 Joshaven Potter <yourtech@gmail.com>
// MIT License: http://opensource.org/licenses/MIT | https://github.com/joshaven/string_score
String.prototype.score=function(e,f){if(this===e)return 1;if(""===e)return 0;var d=0,a,g=this.toLowerCase(),n=this.length,h=e.toLowerCase(),k=e.length,b;a=0;var l=1,m,c;f&&(m=1-f);if(f)for(c=0;c<k;c+=1)b=g.indexOf(h[c],a),-1===b?l+=m:(a===b?a=.7:(a=.1," "===this[b-1]&&(a+=.8)),this[b]===e[c]&&(a+=.1),d+=a,a=b+1);else for(c=0;c<k;c+=1){b=g.indexOf(h[c],a);if(-1===b)return 0;a===b?a=.7:(a=.1," "===this[b-1]&&(a+=.8));this[b]===e[c]&&(a+=.1);d+=a;a=b+1}d=.5*(d/n+d/k)/l;h[0]===g[0]&&.85>d&&(d+=.15);return d};

/*
	Internal Functions for Bold360ai KB Sync SDK
*/

// get current date in UTC time zone
function getCurrentDate()
{
	var d = new Date();
	localTime = d.getTime();
	localOffset = d.getTimezoneOffset() * 60000;

	// obtain UTC time in msec
	utc = localTime + localOffset;	
	
	var today = new Date(utc);
	var m = today.getMonth()+1;
	if (m.toString().length == 1) m = "0" + m.toString();
	var date = today.getFullYear()+'-'+m+'-'+today.getDate();
	var t = today.getHours();
	if (t.toString().length == 1) t = "0" + t.toString();
	var min = today.getMinutes();
	if (min.toString().length == 1) min = "0" + min.toString();
	var time = t + ":" + min;
	var dateTime = date+'T'+time;
	return dateTime;
}

var createBoldArticle = function(bold_endpoint, title, body, callback)
{
	if (!bold_endpoint || !title || !body)
		return false;
		
	// Set the headers
	var headers = {
		'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/json'
	}

	// Configure the request
	var options = {
		url: "https://" + bold_endpoint.server + "/api/kb/v1/createArticle",
		method: 'POST',
		headers: headers,
		form: {'title': title, 'body': body, 'kb' :bold_endpoint.kb, 'apiKey' : bold_endpoint.apiKey, 'status' : 'kb', 'account' : bold_endpoint.account}
	}

	// Start the request
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// Print out the response body			
			if (callback)
				callback(body);			
		}
		else
		{
			console.log("error");
			console.log(JSON.stringify(response));
		}
	});
}

var updateBoldArticle = function(bold_endpoint, target_article_id, title, body, callback)
{
	if (!bold_endpoint || !target_article_id || !title || !body)
		return false;
		
	// Set the headers
	var headers = {
		'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/json'
	}

	// Configure the request
	var options = {
		url: "https://" + bold_endpoint.server + "/api/kb/v1/updateArticle",
		method: 'POST',
		headers: headers,
		form: {'title': title, 'body': body, 'kb' :bold_endpoint.kb, 'apiKey' : bold_endpoint.apiKey, "articleId" : target_article_id, 'status' : 'kb', 'account' : bold_endpoint.account}
	}

	// Start the request
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// Print out the response body			
			if (callback)
				callback(body);			
		}
		else
		{
			console.log("error");
			console.log(JSON.stringify(response));
		}
	});		
}


/*
	Functions for Bold360ai KB Sync SDK
*/


/* USAGE: Retrieve the last Bold360ai KB fetch. */
var getLastBoldFetch = function()
{
	if (typeof last_fetch === 'undefined') 
	{		
		return [];
	}
	
	return last_fetch;
}

/* USAGE: Retrieve the last 3rd party KB fetch. */
var getLastThirdPartyKbFetch = function()
{
	if (typeof last_third_party_fetch === 'undefined') 
	{		
		return [];
	}
	
	return last_third_party_fetch;
}

/* USAGE: Retrieve all articles from Bold360ai endpoint. For better performance, make sure to call checkForBoldKbChanges() to check for KB changes. */
exports.fetch_bold_kb = function(bold_endpoint, options, callback)
{
	if (!bold_endpoint ||  !options)
	{
		console.log("Missing arguments");
		return null;
	}
	
	var template = "https://[[ENDPOINT]]/~[[ACCOUNT]]/api/kb/v1/export?apiKey=[[API_KEY]]&kb=[[KB]]&plainText=false&maxItems=3000&skip=0&format=json";
	
	template = template.replace("[[ENDPOINT]]", (bold_endpoint.server)).replace("[[ACCOUNT]]", bold_endpoint.account).replace("[[API_KEY]]", bold_endpoint.apiKey).replace("[[KB]]",bold_endpoint.kb);	
	
	request(template, { json: true }, (err, res, body) => {
	
	if (err) { return console.log("fetch_bold_kb error: " + err); }
	
	// save time of the this fetch
	last_time_checked = getCurrentDate();
	
	// save last fetch
	last_fetch = body.articles;
	
	console.log("Bold360ai KB fetched successfully");
	
	// call the callback
	if (callback)
		callback(body);
	
	});
}
/*
	Check if the KB was updated since the last fetch
	USAGE: Make sure to use this function to decide whether there is a need to perform a fetch or not (fetch_bold_kb)
	return true if change(s) were made since last fetch, otherwise return false
*/
var checkForBoldKbChanges = function(endpoint, account, kb, apiKey, options, callback)
{		
	if (typeof last_time_checked === 'undefined') 
	{
		console.log("first time fetch");
		return false;
	}
		
	if (!endpoint || !account || !kb || !apiKey || !options)
	{
		console.log("Missing arguments");
		return false;
	}
	
	var template = "https://[[ENDPOINT]]/~[[ACCOUNT]]/api/kb/v1/export?apiKey=[[API_KEY]]&kb=[[KB]]&plainText=false&maxItems=1&skip=0&format=json&modifiedSince=[[MODIFIED_SINCE]]";
	template = template.replace("[[ENDPOINT]]", endpoint).replace("[[ACCOUNT]]", account).replace("[[API_KEY]]", apiKey).replace("[[KB]]",kb).replace("[[MODIFIED_SINCE]]", last_time_checked);	
	
	request(template, { json: true }, (err, res, body) => {
	
	if (err) { return console.log(err); }
	
	last_time_checked = getCurrentDate();
	
	if (callback)
	{
		//console.log("BODY: " + JSON.stringify(body));
		if (body.articles.length > 0)
			callback(true);
		else callback(false);	
	}	
	});	
	
	return true;
}


// USAGE: fetch the 3rd-party KB content
// PREREQUISITE: implement fetchKB() function under 3rd_party_kb_provider.js
exports.fetch_third_party_kb = function(callback)
{	
	third_party_kb_provider.fetchKB(function(json) { last_third_party_fetch = json; if (callback) callback(json); } );
}

// Get the difference between the two KBs. 
// RETURN: json with two arrays. json[title].difference represents the difference
// json.difference index:
// 0 = identical
// 1 = missing in Bold
// 2 = missing in 3rd party
// 3 = article exists in two KBs, but the body is not identical

var getKbDelta = function(matching_algorithm, sync_options)
{
	var last_3rd_party_fetch = getLastThirdPartyKbFetch();
	var last_bold_fetch = getLastBoldFetch();
	
	if (last_3rd_party_fetch.length == 0 || last_bold_fetch == 0)
	{
		console.log("One or both of the KBs are not fetched yet.");
		return [];
	}
	
	if (!matching_algorithm)
		matching_algorithm = "Flexible"; // flexible matching algorithm set as default

	var delta = [];
	var found_body;
	
	for (var pos=0; pos<last_bold_fetch.length; pos++)
	{
		var found = false;		
		
		for (var p=0; p<last_3rd_party_fetch.length; p++)
		{
			var match = false;
			if (sync_options.matching_algorithm == "Flexible")
				match = (last_3rd_party_fetch[p].title.score(last_bold_fetch[pos].title,1) >= 0.8);
			else match = (last_3rd_party_fetch[p].title == last_bold_fetch[pos].title);
			
			if (match)
			{
				found = true;				
				found_body = last_3rd_party_fetch[p].body;
			}
		}
		
		if (!delta[last_bold_fetch[pos].title])
			delta[last_bold_fetch[pos].title] = [];
		
		if (found)
		{
			if (!delta[last_bold_fetch[pos].title])
				delta[last_bold_fetch[pos].title] = [];
			
			// save the article body for reference (both 3rd party and bold360ai versions)
			delta[last_bold_fetch[pos].title].bold_body = last_bold_fetch[pos].body;
			delta[last_bold_fetch[pos].title].bold_article_id = last_bold_fetch[pos].id;
			delta[last_bold_fetch[pos].title].third_party_body = found_body;
			
			if (found_body == last_bold_fetch[pos].body)
			{
				// Articles are identical
				delta[last_bold_fetch[pos].title].difference = 0;
			}
			else 
			{
				// Titles are the same, but article bodies are different
				delta[last_bold_fetch[pos].title].difference = 3;				
			}
		}
		else
		{
			// article is missing in the 3rd-party KB
			delta[last_bold_fetch[pos].title].bold_body = last_bold_fetch[pos].body;
			delta[last_bold_fetch[pos].title].bold_article_id = last_bold_fetch[pos].id;
			delta[last_bold_fetch[pos].title].difference = 2;
		}
	}
	
	var should_ignore = false;

	for (var pos=0; pos<last_3rd_party_fetch.length; pos++)
	{
		if ( !(last_3rd_party_fetch[pos].title in delta) )
		{
			if (sync_options.matching_algorithm == "Flexible")
			{
				for (title in delta)
				{
					if (last_3rd_party_fetch[pos].title.score(title, 1) >= 0.8)
					{
						should_ignore = true;
						break;
					}
				}
				
				if (should_ignore)
					continue;				
			}
			// found an article missing in Bold360ai KB
			delta[last_3rd_party_fetch[pos].title] = [];
			delta[last_3rd_party_fetch[pos].title].difference = 1; 
			delta[last_3rd_party_fetch[pos].title].third_party_body = last_3rd_party_fetch[pos].body;
		}
	}
	
	return delta;
}

exports.SyncKBs = function(bold_endpoint, sync_options)
{	
	if (!sync_options || !bold_endpoint)
		return false;
		
	var delta = getKbDelta(sync_options.matching_algorithm, sync_options);
	if (delta && delta.keys.length > 0)
	{
		console.log("getKbDelta() Failed");
		return false;
	}
	
	
	if (sync_options.directions == "ThirdPartyToBold")
	{
		if (sync_options.writeMode == "CreateOnly" || sync_options.writeMode == "CreateAndUpdate")
		{
			for (title in delta)
			{
				if (delta[title].difference == 1) // if case the article is missing in bold360ai KB
				{
					createBoldArticle(bold_endpoint, title, delta[title].third_party_body, function(body) { console.log("Article has been created successfully"); });									
				}

				else if (delta[title].difference == 3 && sync_options.writeMode == "CreateAndUpdate") // in case the articles are different
				{
					updateBoldArticle(bold_endpoint, delta[title].bold_article_id, title, delta[title].third_party_body, function() { console.log("Article has been updated successfully"); });
				}
			}
		}		
	}
}
