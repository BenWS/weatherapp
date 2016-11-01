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
    
    httpRequest(locationByZip, 
    (error, httpResponse, body) => {
        
        if(request.query.zipcode === "") {
            response.redirect("/index");
            return;
        }
        
        if (JSON.parse(body)["location"] === undefined) {
            response.redirect("/index");
            return;
        }
        
        var city = JSON.parse(body)["location"]["city"];
        var state = JSON.parse(body)["location"]["adminDistrictCode"];
        latitude = JSON.parse(body)["location"]["latitude"];
        longitude = JSON.parse(body)["location"]["longitude"];
        
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
    })
})


app.get("/*", function(req,res) {
  res.redirect("/index");
});

app.listen(8080);