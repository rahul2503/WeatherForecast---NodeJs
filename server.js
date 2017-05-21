var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var path = require("path");
var http = require('http');
var Mongo = require('./mongoConfig');
var sleep = require('system-sleep');
var changeCase = require('change-case')

app.use(bodyParser.json());

app.get('/', function(req, res) { 
	res.sendFile(path.join(__dirname+'/views/index.html'));
});

app.get('/refresh', function(req, res, next) {
	
	var callbackGetCityData = function(success, response) {
		if (success) {
			var resp = JSON.parse(response);
			console.log(resp);
			for (var i=0; i<resp.length; i+=1) {
				var city = resp[i].city;
				console.log(city);
				var f_body = "";
				var reqt = http.get('http://api.openweathermap.org/data/2.5/forecast/daily?q='+city+'&cnt=14&appid=15d4179b0339349fffc0bf1519a20e7b', function(resp) {
					resp.on('data', function(cb) {
						f_body += cb;
					});

					resp.on('end', function() {
						if (resp.statusCode === 200) {
							f_data = JSON.parse(f_body);
							Mongo.update('weather', {'city.name': changeCase.titleCase(city)}, f_data, {upsert: true}, function(s, r) {
								// console.log(r);
								console.log("");
							});
							// Mongo.insert('weather', f_data, function(s, r) {
							// 	console.log(r);
							// });
						}
					});
				});
				sleep(1000);
			}
			next();
		} else {
			console.log("city missing");
		}
	}
	Mongo.retrieve('city', {}, callbackGetCityData);
	res.sendStatus(200);
});

app.get('/search', function(req, res) {
	var city = req.query.key;

	var callbackGetWeatherData = function(success, response) {
		if (success) {
			var f_data = JSON.parse(response);
			res.send({'success': true, 'data': f_data[0]});
		} else {
			var f_data;
			var f_body = "";
			var reqt = http.get('http://api.openweathermap.org/data/2.5/forecast/daily?q='+city+'&cnt=14&appid=15d4179b0339349fffc0bf1519a20e7b', function(resp) {
				resp.on('data', function(cb) {
					f_body += cb;
				});

				resp.on('end', function() {
					if (resp.statusCode === 200) {
						f_data = JSON.parse(f_body);
						Mongo.retrieve('city', {'city': changeCase.titleCase(city)}, function(s, r) {
							if (s) {
								console.log("city already present");
							} else {
								Mongo.insert('city', {'city': changeCase.titleCase(city)}, function(s, r){ console.log("new city inserted")});
							}
						});
						res.send({'success': true, 'data': f_data});
					}
				});
			});
		}
	}

	Mongo.retrieve('weather', {'city.name': changeCase.titleCase(city)}, callbackGetWeatherData);
});


app.listen(3000);
console.log("server running on 3000");