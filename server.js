var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require("path");


var http = require('http');
var Weather = require('./node_modules/weather');
app.use(bodyParser.json());

app.use(express.static(__dirname + '/static'));


app.get('/', function(req, res){
	res.sendFile(path.join(__dirname+'/views/search.html'));
});

app.get('/search', function(req, res) {
	var city = req.query.key;
	var request = http.get('http://api.openweathermap.org/data/2.5/weather?q='+city+'&APPID=15d4179b0339349fffc0bf1519a20e7b', function(response) {
		var w_body = "";
		var json = {};
		response.on('data', function(cb) {
			w_body += cb;
		});

		response.on('end', function() {
			if (response.statusCode === 200) {
				var w_data = JSON.parse(w_body);

				var f_body = "";
				var reqt = http.get('http://api.openweathermap.org/data/2.5/forecast?q='+w_data.name+'&appid=15d4179b0339349fffc0bf1519a20e7b', function(resp) {
					resp.on('data', function(cb) {
						f_body += cb;
					});

					resp.on('end', function() {
						if (resp.statusCode === 200) {
							var f_data = JSON.parse(f_body);

							json = {
								'weather': {
									'weather': w_data.weather[0].description,
									'temp': ((w_data.main.temp) - 273).toFixed(2),
									'humidity': w_data.main.humidity,
									'lat': w_data.coord.lat,
									'lon': w_data.coord.lon,
									'city': w_data.name
								},
								'forecast': [
									{
									'weather': f_data.list[0].weather[0].description,
									'temp': ((f_data.list[0].main.temp) - 273).toFixed(2),
									'humidity': f_data.list[0].main.humidity
								}, {
									'weather': f_data.list[8].weather[0].description,
									'temp': ((f_data.list[8	].main.temp) - 273).toFixed(2),
									'humidity': f_data.list[8].main.humidity
								}, {
									'weather': f_data.list[16].weather[0].description,
									'temp': ((f_data.list[16].main.temp) - 273).toFixed(2),
									'humidity': f_data.list[16].main.humidity
								}, {
									'weather': f_data.list[24].weather[0].description,
									'temp': ((f_data.list[32].main.temp) - 273).toFixed(2),
									'humidity': f_data.list[24].main.humidity
								}, {
									'weather': f_data.list[32].weather[0].description,
									'temp': ((f_data.list[32].main.temp) - 273).toFixed(2),
									'humidity': f_data.list[32].main.humidity
								}]	
							}
						}
						res.send(json);
					});
				});
				
			}
		});
	});

	console.log('done');
});


app.listen(3000);
console.log("server running on 3000");