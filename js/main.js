import { createApp } from 'vue';

createApp({
    data() {
        return {
            cities: [],
            currentCity: {},
            weatherInfo: [],
            loading: false,
            success: false
        }
    },

    methods: {
        async getCities() {
            const res = await fetch("city_coordinates.csv")
                .then(res => res.text())
                .then(text => {
                    const data = text.split("\n");
                    const keys = data[0].split(',');
                    return data.slice(1, data.length)
                        .map(d => d.split(",")).map(c => {
                            let i = 0;
                            let obj = [];
                            while (i < 4) {
                                obj[keys[i]] = c[i];
                                i++;
                            }
                            return obj;
                        });
                }).catch(() => {
                    throw new Error('Error fetching the data');
                });
            this.cities = res;
        },

        getWeatherInfo(event) {
            if (event.target.value) {
                this.loading = true;
                this.success = false;
                this.currentCity = this.cities.at(event.target.value - 1);
                this.apiCall(this.currentCity.latitude, this.currentCity.longitude);
            }
        },

        parseWeather(weather) {
            switch (weather) {
                case "ishower":
                    return "Isolated showers";
                case "fog":
                    return "Foggy";
                case "lightrain":
                    return "Light Rain";
                case "lightsnow":
                    return "Light Snow";
                case "mcloudy":
                    return "Mostly Cloudy";
                case "oshower":
                    return "Occasional Showers";
                case "pcloudy":
                    return "Partly Cloudy"
                case "rainsnow":
                    return "Rain and Snow";
                case "tsrain":
                    return "Thunderstorm Possible";
                case "tstorm":
                    return "Thunderstorm";
                default:
                    return weather;
            }
        },

        parseDate(date) {
            return dayjs(date + " " + "00:00:00").format("ddd MMM DD");
        },

        async apiCall(lat, long) {
            this.loading = true;
            try {
                const res = await fetch("http://www.7timer.info/bin/api.pl?lon=" + long + "&lat=" + lat + "&product=civillight&output=json");
                this.weatherInfo = (await res.json()).dataseries;
            } catch (error) {
                throw new Error('Error fetching the data');
            } finally {
                this.loading = false;
                this.success = true;
            }
            // await fetch("http://www.7timer.info/bin/api.pl?lon=" + long + "&lat=" + lat + "&product=civillight&output=json")
            //     .then(res => {
            //         if (!res.ok) {
            //             this.loading = false;
            //             throw new Error('Network response was not ok');
            //         }
            //         this.loading = false;
            //         this.success = true;
            //         return res.json();
            //     })
            //     .then(data => {
            //         this.weatherInfo = data.dataseries;
            //     })
            //     .catch(() => {
            //         this.loading = false;
            //         this.success = false;
            //         throw new Error('Error fetching the data');
            //     }).finally(() =>
            //         this.loading = false
            //     )
        }
    },

    mounted() {
        this.success = false;
        this.loading = false;
        this.currentCity = {};
        this.weatherInfo = [];
        this.cities = [];
        this.getCities();
    }
}).mount('#app');