var promise = require('bluebird');
var redis = require('redis'),
    client = redis.createClient();

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

return client.getAsync('nba-20160511')
.then(function(data) {

	var Games = JSON.parse(data);
	var games = Games.games;

	for (var i = 0 ; i <games.game.length ; i++) {
		console.log(games.game[i].home.nickname + ' V.S. ' + games.game[i].visitor.nickname + '\n' 
			+ games.game[i].home.score + ':' + games.game[i].visitor.score + '\n');
	}


	process.exit(0);
})
.catch(function(err) {
	console.log(err);
});
