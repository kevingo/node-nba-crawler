'use strict';

var request = require('request');
var moment = require('moment');
var twix = require('twix');
var redis = require("redis"),
    client = redis.createClient();


function storeGameData (start, end, callback) {
	start = moment(start).format();
	end = moment(end).format();

	var prefix = 'http://data.nba.com/data/5s/json/cms/noseason/scoreboard/';
	var postfix = '/games.json';
	var days = getRange(start, end, 'day', 'YYYYMMDD');

	for (var i = 0 ; i<days.length ; i++) {
		var url = prefix + days[i] + postfix;
		getData(url, function(err, data) {
			var key = 'nba-' + data.sports_meta.season_meta.calendar_date;
			client.set(key, JSON.stringify(data), function(err, reply) {
				if (err) {
					console.log(err);
				}
				console.log('set ' + key + ' done.');
			});
		});
	}
}

function getData(url, callback) {
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var nba = JSON.parse(body);
			var games = nba.sports_content;
			return callback(null, games);
		}
	});
}


function getRange(start, end, frequency, format) {
  var itr = moment.twix(new Date(start), new Date(end)).iterate(frequency);
  var range = [];

  while (itr.hasNext()) {
    range.push(moment(itr.next().toDate()).format(format));
  }

  return range;
}

storeGameData('20160401', '20160630');