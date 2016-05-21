'use strict';

var request = require('request');
var moment = require('moment');
var promise = require('bluebird');
var twix = require('twix');
var redis = require("redis"),
    client = redis.createClient();
var start , end;

function storeGameData (start, end, callback) {
	start = moment(start).format();
	end = moment(end).format();

	var prefix = 'http://data.nba.com/data/5s/json/cms/noseason/scoreboard/';
	var postfix = '/games.json';
	var days = getRange(start, end, 'day', 'YYYYMMDD');
	return promise.map(days, function(day) {
		var url = prefix + day + postfix;
		return getData(url)
		.then(function(data) {
			var key = 'nba-' + data.sports_meta.season_meta.calendar_date;
			return client.set(key, JSON.stringify(data));
		});
	})
	.then(function() {
		console.log('done');
		process.exit();
	})
	.catch(function(err) {
		console.log(err);
	});
}

function getData(url) {
	return new promise(function(resolve, reject) {
		request(url, function (error, response, body) {
			if (error) {
				return reject(error);
			}

			var nba = JSON.parse(body);
			var games = nba.sports_content;
			return resolve(games);
		});
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

start = process.argv[2] || moment().format();
end = process.argv[3] || moment().format();
storeGameData(start, end);

