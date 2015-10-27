/*
 * Module Dependencies
 */
var express = require('express');
var app = express();
var routes = require('./routes');
var path = require('path');
var twitter = require('ntwitter');
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var _ = require('underscore');

var mysql = require("mysql");
var cd = mysql.createConnection( {
	host: '',
	user: '',
	password: '',
	port : '',
	database : 't'
});


var criteria1 = ['-74,40,-73,41'];
var keywordArray = ['game', 'sport', 'food', 'music', 'the'];
var criterial_keyword = 'game';
var current_keyword = keywordArray[0];
var currentTwitStream;


cd.connect();

// for(var i = 0; i < keywordArray.length; i++) {
// 	cd.query('CREATE TABLE ' + keywordArray[i] + ' (profileimg VARCHAR(150), username VARCHAR(100), user VARCHAR(100), ' +
// 		'text TEXT, latitude VARCHAR(150), longitude VARCHAR(150))', 
// 	function(err, result) {
// 		if(err){
// 			console.log(err);
// 		} else {
// 			console.log('Table ' + keywordArray[i] + ' created');
// 		}
// 	});
// }

// cd.query('CREATE TABLE twitterdata (keyword VARCHAR(30), profileimg VARCHAR(150), username VARCHAR(100), user VARCHAR(100), ' +
// 		'text TEXT, latitude VARCHAR(150), longitude VARCHAR(150), PRIMARY KEY(id))', 
// function(err, result) {
// 	if(err){
// 		console.log(err);
// 	} else {
// 		console.log("Table twitterdata created");
// 	}
// });


// for(var i = 0; i < keywordArray.length; i++) {
// 	cd.query('DROP TABLE ' + keywordArray[i], function(err, result) {
// 		if(err) {
// 			console.log(err);
// 		} else {
// 			console.log(keywordArray[i] + 'Table deleted.');
// 		}
// 	});
// }



// cd.query("SELECT * FROM music", function(err, result) {
//   	if(err) {
// 		throw err;
// 	}
//  	for(var i=0; i<result.length; i++) {
//  		console.log(result[i]);
//  	}
  
// });

// cd.end();

app.configure(function() {
	app.set('port', process.env.PORT || 6998);
	app.set('views', __dirname + "/views");
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function() {
	app.use(express.errorHandler());
});

http.listen(app.get('port'), function() {
	console.log("Express server listening on port #" + app.get('port'));
});

app.get('/', routes.index);

/*
 * Setup twitter keys here
 */
var twitInfo = new twitter({
	consumer_key: '',
	consumer_secret: '',
	access_token_key: '',
	access_token_secret: ''
});

/* */
var flag = false;
/* */
io.sockets.on('connection', function(socket) {
	socket.on('keyword', function(data) {
		/* */
		flag = true;
		/* */
		if(data.keyword == current_keyword) {
			console.log(data.keyword);
		}
		else {
			current_keyword = data.keyword;
			currentTwitStream.destroy();
			twitInfo.stream('statuses/filter', {track: keywordArray}, function(stream) {
				stream.on('data', function(tweet) {
					
					var geo = false;
					var latitude;
					var longitude;
					//console.log(tweet.user.screen_name + "  " + tweet.user.name);
					if(tweet.geo != null) {
						geo = true;
						latitude = tweet.geo.coordinates[0];
						longitude = tweet.geo.coordinates[1];
					}
					
					/* */
					if(flag == true) {
						//var dbDataArray = [];
						cd.query("SELECT * FROM " + current_keyword + " LIMIT 1000", function(err, rows, field) {
						  	if(err) {
								throw err;
							}
						 	for(var i in rows) {

						 		io.sockets.emit('dbdata', {
						 			latitude: rows[i].latitude,
						 			longitude: rows[i].longitude,
						 			user: rows[i].user,
						 			text: rows[i].text
						 		});
						 	}
						});
	
						flag = false;
					}
					/* */


					if(tweet.text.toLowerCase().indexOf(current_keyword.toLowerCase()) !== -1) {
						io.sockets.emit('tweets', {
							profileimg: tweet.user.profile_image_url,
							username: tweet.user.name,
							user: tweet.user.screen_name,
							text: tweet.text,
							geo: geo,
							latitude: latitude,
							longitude: longitude
						});
					}


					for(var i = 0; i < keywordArray.length; i++) {
						if(tweet.text.toLowerCase().indexOf(keywordArray[i]) !== -1) {
							if(geo == true) {
								var posts = { 
											  profileimg: tweet.user.profile_image_url, 
											  username: tweet.user.name, 
											  user: tweet.user.screen_name, 
											  text: tweet.text,
											  latitude: latitude, 
											  longitude: longitude };
								cd.query('INSERT INTO ' + keywordArray[i] + ' SET ?', posts, function(err, result) {
									if(err) {
										throw err;
									}
									console.log("**************** second"  + result);
								});
								
							}
						}
					}

					currentTwitStream = stream;

				});
			});
		}
		
	});

	

});

twitInfo.stream('statuses/filter', {track: keywordArray}, function(stream) {
	stream.on('data', function(tweet) {

		var geo = false;
		var latitude;
		var longitude;
		//console.log(tweet.user.screen_name + "  " + tweet.user.name);
		if(tweet.geo != null) {
			geo = true;
			latitude = tweet.geo.coordinates[0];
			longitude = tweet.geo.coordinates[1];

		}

		if(tweet.text.toLowerCase().indexOf(current_keyword.toLowerCase()) !== -1) {
			io.sockets.emit('tweets', {
				profileimg: tweet.user.profile_image_url,
				username: tweet.user.name,
				user: tweet.user.screen_name,
				text: tweet.text,
				geo: geo,
				latitude: latitude,
				longitude: longitude
			});

		}

		for(var i = 0; i < keywordArray.length; i++) {
			if(tweet.text.toLowerCase().indexOf(keywordArray[i]) !== -1) {
				if(geo == true) {
					var posts = { 
								  profileimg: tweet.user.profile_image_url, 
								  username: tweet.user.name, 
								  user: tweet.user.screen_name, 
								  text: tweet.text,
								  latitude: latitude, 
								  longitude: longitude };
					cd.query('INSERT INTO ' + keywordArray[i] + ' SET ?', posts, function(err, result) {
						if(err) {
							throw err;
						}
						console.log("**************** first"  + result);
					});
					
				}
			}
		}


		currentTwitStream = stream;
		
	});
});






