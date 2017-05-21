var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var path = require("path");
var http = require('http');
var Mongo = require('./mongoConfig');	

app.use(bodyParser.json());


app.get('/', function(req, res) { 
	res.sendFile(path.join(__dirname+'/views/index.html'));
});

app.get('/refresh', function(req, res) {

	var callbackGetCityData = function(success, response) {
		
	}
	Mongo.retrieve('city', {}, {'limit': 50}, callbackGetCityData);
});

app.get('/search', function(req, res) {
	var city = req.query.key;

	var callbackGetWeatherData = function(success, response) {
		if (success) {
			var f_data = JSON.parse(response);
			res.send({'success': true, 'data': f_data});
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
						console.log(f_data);
						Mongo.insert('city', {'city': city}, function(s, r) {
							if (s) {
								console.log(r);
							} else {
								console.log(r);
							}
						});
						res.send({'success': true, 'data': f_data});
					}
				});
			});

		}
	}

	Mongo.retrieve('weather', {'city.name': city}, {}, callbackGetWeatherData);
});


app.listen(3000);
console.log("server running on 3000");