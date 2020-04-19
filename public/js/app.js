let getWeather = (lat, lon) => {
  let key = 'b4407a65940cfd2bf74b2ab35b8408a2';
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  return fetch(url);
};


let weatherToIcon = (weather) => {
  let icon = '';
  switch(weather) {
    case 'Clear':
      icon = 'sunny.svg';
      break;
    case 'Clouds':
      icon = 'cloudy.svg';
      break;
    case 'Rain':
    case 'Drizzle':
      icon = 'raining.svg';
      break;
    case 'Snow':
      icon = 'snowing.svg';
      break;
    case 'Fog':
    case 'Haze':
      icon = 'fog.svg';
      break;
  }

  return 'img/weather-icons/' + icon;
};


var app = new Vue({
  el: '#grid',
  data: {
    noLocation: true,
    /* websockets */
    socket: null,
    senderName: '',
    messageToSend: '',
    incomingMessages: [],
    lastUpdate: 0,

    planets: [
      { name: 'Tatooine',
        url: 'img/tatooine.jpg'
      },  
      { name: 'Hoth',
        url: 'img/hoth.jpg'
      },
      { name: 'Naboo',
        url: 'img/naboo.jpg'  
      },
      { name: 'Kamino',
        description: 'Wet',
        url: 'img/kamino.jpg'
      },
      { name: 'Endor',
        url: 'img/endor.jpg'
      },
      { name: 'Yavin 4',
        url: 'img/yavin4.jpg'
      },
      { name: 'Alderaan',
        url: 'img/alderaan.jpg'
      }
    ],
    currentPlanet: null,
    currentDescr: null,
    weather: {
      icon: null,
      city: null,
      temp: null,
      humidity: null,
      weather: null
    },
    city: null,
    icons: {
      sunny: "img/weather-icons/sunny.svg",
      cloudy: "img/weather-icons/cloust.svg",
      raining: 'img/weather-icons/raining.svg',
      snowing: 'img/weather-icons/snowing.svg',
      partialCloudy: 'img/weather-icons/partial-cloudy.svg',
      windy: 'img/weather-icons/windy.svg',
      night: 'img/weather-icons/moon.svg',
      rainingNight: 'img/weather-icons/raining-night.svg'
    },
    bgStyle: {
      backgroundColor: '#000000',
      backgroundImage: null,
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover'
    }
  },
  methods: {
    preloadImages: function() {
      this.planets.forEach(element => {
        let img = new Image();
        img.src = element.url;
      });
    },

    getLocation: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.sendLocation);
      } else { 
        alert("Geolocation is not supported by your browser. Please update your browser. Visit Help Center.");
      }
    },

    sendLocation: function(position) {
      const data = {
        lat: position.coords.latitude,
        long: position.coords.longitude
      };

      this.socket.send(JSON.stringify(data));
    },

    sendCity: function() {
      let data = { city: this.city}
      this.socket.send(JSON.stringify(data));
    },

    connectSocket: function () {
      this.socket = new WebSocket("ws://joshl8n.com");
      this.socket.onmessage = (event) => {
        var data = JSON.parse(event.data);
        console.log(data);

        if (data.status == 'City not found') {
          this.manualChange('Alderaan');
        } else {
          this.weather = {
            icon: weatherToIcon(data.weather),
            city: data.city,
            temp: data.temp + "\xB0F",
            humidity: data.humidity + "%",
            weather: data.weather 
          };

          let planet = this.planetFromWeather(data.temp, data.humidity, data.weather);
          this.manualChange(planet);
        }
        
        this.lastUpdate = 0;

        if (data.action && data.action == "new-message") {
          // record the incoming new message
          this.incomingMessages.push(data);
        }
      };

      this.socket.onopen = () => {  // on on
        let message = JSON.stringify({
          'message': "Client connected"
        });
        this.socket.send(message);
      };
    },

    manualChange: function(planet) {
      this.noLocation = false;
      switch(planet) {
        case 'Alderaan':
          this.bgStyle.backgroundImage = "url('img/alderaan.jpg')";
          this.currentPlanet = 'Alderaan';
          this.currentDescr = 'Nothing was found here';
          break;
        case 'Hoth':
          this.bgStyle.backgroundImage = "linear-gradient(rgb(177, 216, 236, 0.66), rgb(96, 125, 139, 0.45)), url('img/hoth.jpg')";
          this.currentPlanet = 'Hoth';
          this.currentDescr = 'Freezing, icy desolation';
          break;
        case 'Tatooine':
          this.bgStyle.backgroundImage = "linear-gradient(rgb(189, 171, 142, 0.54), rgb(156, 99, 8, 0.33)), url('img/tatooine.jpg')";
          this.currentPlanet = 'Tatooine';
          this.currentDescr = 'Hot, dry, occasional sarlacc';
          break;
        case 'Naboo':
          this.bgStyle.backgroundImage = "linear-gradient(rgb(78, 149, 176, 0.23), rgb(24, 47, 41, 0.61)), url('img/naboo.jpg')";
          this.currentPlanet = 'Naboo';
          this.currentDescr = 'Temperate, low chance of sand';
          break;
        case 'Kamino':
          this.bgStyle.backgroundImage = "linear-gradient(rgb(141, 204, 210, 0.50), rgb(44, 32, 53, 0.50)), url('img/kamino.jpg')";
          this.currentPlanet = 'Kamino';
          this.currentDescr = 'Wet';
          break;
        case 'Endor':
          this.bgStyle.backgroundImage = "linear-gradient(rgba(54, 50, 30, 0.5), rgba(24, 44, 18, 0.5)), url('img/endor.jpg')";
          this.currentPlanet = 'Endor';
          this.currentDescr = 'Temperate, gray, cloudy, ';
          break;
        case 'Yavin 4':
          this.bgStyle.backgroundImage = "linear-gradient(rgba(124, 206, 235, 0.4), rgba(116, 35, 31, 0.23)), url('img/yavin4.jpg')";
          this.currentPlanet = 'Yavin 4';
          this.currentDescr = 'Hot, humid, chance of Death Star';
          break;
        case 'Get location':
          this.getLocation();
      }
    },
    planetFromWeather: function (temp, humidity, weather) {
      let planet = '';
      
      if (weather == 'Rain') {
        planet = 'Kamino';
      } else if (weather == 'Snow' || temp <= 35) {
        planet = 'Hoth';
      } else if (weather == 'Clouds' && 45 <= temp && temp <= 70) {
        planet = 'Endor';
      } else if (75 <= temp && humidity <= 40) {
        planet = 'Tatooine';
      } else if (70 <= temp && 40 <= humidity) {
        planet = 'Yavin 4';
      } else if (45 <= temp && temp <= 75) {
        planet = 'Naboo';
      }
    
      return planet;
    }
  },
  mounted: function () {
    this.$nextTick(function () {
        window.setInterval(() => {
            this.lastUpdate += 1;
        }, 1000);
    });
  },
  created: function () {
    this.preloadImages();
    this.connectSocket();
  }
});