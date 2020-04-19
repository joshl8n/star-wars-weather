
const express = require('express');
const WebSocket = require('ws');
const cron = require('node-cron');
const fetch = require('node-fetch');


const app = express();
app.set('port', (process.env.PORT || 8080));

/* middleware */
app.use(express.static('public'));


let kelvinToFahren = temp => {
    return Math.round(((temp - 273.15)*1.8) + 32);
};

let getWeather = (lat, long) => {
    let key = 'b4407a65940cfd2bf74b2ab35b8408a2';
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}`;
    return fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data;
        });
};

let getCityWeather = (city) => {
    let key = 'b4407a65940cfd2bf74b2ab35b8408a2';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    return fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        return data;
    });
};


var server = app.listen(app.get('port'), function () {
    console.log("Server listening...");
});


let sendWeathertoClient = async (lat, long, client) => {
    let w = await getWeather(lat, long);
    let broadcastData = {
        weather: w.weather[0].main,
        temp: kelvinToFahren(w.main.temp),
        humidity: w.main.humidity,
        city: w.name
    };

    console.log("gps", broadcastData.city, Date.now());

    wss.clients.forEach((client) => {
        client.send(JSON.stringify(broadcastData));
    });
};

let sendCityWeather = async (city, client) => {
    let w = await getCityWeather(city);
    let broadcastData = null;

    if (w.cod == '404') {
        broadcastData = { 'status': 'City not found' };
    } else {
        broadcastData = {
            weather: w.weather[0].main,
            temp: kelvinToFahren(w.main.temp),
            humidity: w.main.humidity,
            city: w.name
        };
    }
    console.log("search", broadcastData.city, Date.now());

    wss.clients.forEach(client => {
        client.send(JSON.stringify(broadcastData));
    });
};


/* websocket */
const wss = new WebSocket.Server({ server: server });


wss.on('connection', (wsclient) => {
    wsclient.on('message', async (message) => {
        var data = JSON.parse(message);

        if (data.lat && data.long) {
            sendWeathertoClient(data.lat, data.long, wsclient);

            cron.schedule("* * * * *", function() {
                sendWeathertoClient(data.lat, data.long, wsclient);
            });
        } else if (data.city) {
            sendCityWeather(data.city);

        }
    });
});
