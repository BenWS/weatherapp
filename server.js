var express = require('express');
var app = express();
var httpRequest = require('request');
var dateFormat = require('dateformat');

//set view directory
app.set("views", "./views");
app.set("view engine", "pug");

app.get("/index", function(req,res) {
    res.render("index");
});

app.get('/weather', function(request, response) {
        
     var locationByZip = "https://6f6a2062-8b6e-4999-85a6-58561fc2c2ae:HtVPKi1rQS@twcservice.mybluemix.net"
                    + ":443/api/weather/v3/location/point?postalKey=" + request.query.zipcode + "%3AUS&language=en-US"
    
        var latitude;
        var longitude;
        var city;
        var state;
        
        httpRequest(locationByZip, 
        (error, httpResponse, body) => {
            
            if(request.query.zipcode === "") {
                response.redirect("/index");
                return;
            } else if (JSON.parse(body)["location"] === undefined) {
                response.redirect("/index");
                return;
            }
        
        city = JSON.parse(body)["location"]["city"];
        state = JSON.parse(body)["location"]["adminDistrictCode"];
        latitude = JSON.parse(body)["location"]["latitude"];
        longitude = JSON.parse(body)["location"]["longitude"];
        
        if (request.query.forecast === '48 Hour') {
        
            var forecastCoord = "https://6f6a2062-8b6e-4999-85a6-58561fc2c2ae:HtVPKi1rQS@twcservice.mybluemix.net"
                            + ":443/api/weather/v1/geocode/" + latitude + "/" + longitude + "/forecast/hourly/48hour.json"
    
            httpRequest(forecastCoord, 
            (error, httpResponse, body) => {
                
                var forecasts = JSON.parse(body)["forecasts"];
                var forecastDisplay = new Array(forecasts.length);
                
                var date;
                var dayOfWeek;
                var hour;
                var pop;
                var precip_type;
                var clds;
                var temp;
                
                for (var i = 0; i < forecasts.length; i++) {
    
                    date = new Date(forecasts[i]["fcst_valid_local"]);
                    dayOfWeek = dateFormat(date, "ddd");
                    hour = dateFormat(date, "hTT")
                    pop = forecasts[i]["pop"];
                    precip_type = forecasts[i]["precip_type"];
                    clds = forecasts[i]["clds"];
                    temp = forecasts[i]["temp"];
                    
                    forecastDisplay[i] = 
                        [dayOfWeek + " " + hour, 
                        pop + "% chance of " + precip_type, 
                        temp + "F", clds + "% Coverage", 
                        city + ", " + state,
                        request.query.zipcode];
                    
                }
                response.render("results", {test2:forecastDisplay});
            })
            
        } else if (request.query.forecast === 'Current') {
            httpRequest(locationByZip, (error, httpResponse, body) => {
    
                city = JSON.parse(body)["location"]["city"];
                state = JSON.parse(body)["location"]["adminDistrictCode"];
                latitude = JSON.parse(body)["location"]["latitude"];
                longitude = JSON.parse(body)["location"]["longitude"];
                
                //now make HTTP request to get the 5 day forecast
                var currentForecast = "https://6f6a2062-8b6e-4999-85a6-58561fc2c2ae:HtVPKi1rQS@twcservice.mybluemix.net"
                            + ":443/api/weather/v1/geocode/" + latitude + "/" + longitude + "/observations.json"
                            
                var clds;
                var temp;
                var wx_phrase;
                var currentObservation;
                
                httpRequest(currentForecast, (error, httpResponse, body) => {
            
                    clds = JSON.parse(body)["observation"]["clds"];
                    temp = JSON.parse(body)["observation"]["temp"];
                    wx_phrase = JSON.parse(body)["observation"]["wx_phrase"];
                    
                    currentObservation = 
                        [temp + 'F', 
                        wx_phrase, 
                        city + ', ' + state,
                        request.query.zipcode];
                        
                    response.render("current", {test2:currentObservation});
                })
            })
        } else if (request.query.forecast === '5 Day') {
            httpRequest(locationByZip, (error, httpResponse, body) => {
                city = JSON.parse(body)["location"]["city"];
                state = JSON.parse(body)["location"]["adminDistrictCode"];
                latitude = JSON.parse(body)["location"]["latitude"];
                longitude = JSON.parse(body)["location"]["longitude"];
                
                console.log(latitude);
                console.log(longitude);
                
                //now make HTTP request to get the 5 day forecast
                var fiveDayForecast = "https://6f6a2062-8b6e-4999-85a6-58561fc2c2ae:HtVPKi1rQS@twcservice.mybluemix.net"
                            + ":443/api/weather/v1/geocode/" + latitude + "/" + longitude + "/forecast/daily/5day.json"
                
                httpRequest(fiveDayForecast, (error, httpResponse, body) => {

                    var day_temp;
                    var day_pop;
                    var day_precip_type;
                    var day_clds;
                    var long_daypart_name; 
                    
                    var night_temp;
                    var night_pop;
                    var night_precip_type;
                    var night_clds;
                    
                    // var forecasts = JSON.parse(body)["forecasts"];
                    var forecasts = JSON.parse(body)["forecasts"];
                    
                    var weatherArray = new Array(forecasts.length);
                    
                    for(var i=0; i < forecasts.length; i ++) {
                        
                        weatherArray[i] = new Array(12);
                        
                        if (forecasts[i]["day"] === undefined) {
                            console.log("No Day Forecast for this day");
                        } else {
                            day_temp = JSON.parse(body)["forecasts"][i]["day"]["temp"];
                            day_pop = JSON.parse(body)["forecasts"][i]["day"]["pop"];
                            day_precip_type= JSON.parse(body)["forecasts"][i]["day"]["precip_type"];
                            day_clds = JSON.parse(body)["forecasts"][i]["day"]["clds"];
                            long_daypart_name = JSON.parse(body)["forecasts"][i]["day"]["long_daypart_name"];
                            
                            
                            //adding to array
                            weatherArray[i][0] = day_temp + 'F';
                            weatherArray[i][1] = day_pop + '%';
                            weatherArray[i][2] = day_precip_type;
                            weatherArray[i][3] = day_clds + '%';
                            weatherArray[i][4] = long_daypart_name;
                            
                        }
                        
                        if (forecasts[i]["night"] === undefined) {
                            console.log("No Night Forecast for this day");
                        } else {
                            night_temp = JSON.parse(body)["forecasts"][i]["night"]["temp"];
                            night_pop = JSON.parse(body)["forecasts"][i]["night"]["pop"];
                            night_precip_type = JSON.parse(body)["forecasts"][i]["night"]["precip_type"];
                            night_clds = JSON.parse(body)["forecasts"][i]["night"]["clds"];
                            long_daypart_name = JSON.parse(body)["forecasts"][i]["night"]["long_daypart_name"]; 
                            
                            //adding to array
                            weatherArray[i][5] = night_temp + 'F';
                            weatherArray[i][6] = night_pop + '%';
                            weatherArray[i][7] = night_precip_type;
                            weatherArray[i][8] = night_clds + '%';
                            weatherArray[i][9] = long_daypart_name;
                        }
                        weatherArray[i][10] = city + ', ' + state;
                        weatherArray[i][11] = request.query.zipcode;
                    }
                    response.render("longTerm", {test2:weatherArray});
                })
            })
        }
    })
})


app.get("/*", function(req,res) {
  res.redirect("/index");
});

app.listen(8080);