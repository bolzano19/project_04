"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var cors = require('cors');
var corsMiddleware = cors();
var host = 'localhost';
var port = 3000;
var lastTemperatureValue = 36;
var lastDoseRateValue = 5;
var lastHumidityValue = 75;
var stations = require('./stations.json');
// Middleware
app.use(express.json());
app.use(cors());
// Routes
app.get('/stations', function (req, res) {
    res.send(stations);
});
app.get('/stations/:id', function (req, res) {
    var stationId = parseInt(req.params.id);
    var station = stations.find(function (st) { return st.id == stationId; });
    if (station) {
        // В этом блоке station гарантированно имеет тип Station
        res.send(station);
    }
    else {
        res.status(404).send('Station not found');
    }
});
app.post('/stations', function (req, res) {
    var station = req.body;
    var stationId = stations.length > 0 ? stations[stations.length - 1].id + 1 : 1;
    var newStation = __assign(__assign({}, station), { id: stationId });
    stations.push(newStation);
    res.send(newStation);
});
app.delete('/stations/:id', function (req, res) {
    var id = parseInt(req.params.id);
    stations = stations.filter(function (st) { return st.id !== id; });
    res.send("Station ".concat(id, " has been deleted"));
});
app.put('/stations/:id', function (req, res) {
    var index = stations.findIndex(function (st) { return st.id == parseInt(req.params.id); });
    stations[index] = __assign(__assign({}, stations[index]), req.body);
    res.send(stations[index]);
});
app.get('/stations/:id/metrics', function (req, res) {
    var stationId = parseInt(req.params.id);
    var station = stations.find(function (st) { return st.id === stationId; });
    if (station) {
        if (!station.status) {
            res.send({
                temperature: 0,
                dose_rate: 0,
                humidity: 0
            });
        }
        else {
            lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
            lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
            lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);
            res.send({
                temperature: lastTemperatureValue,
                dose_rate: lastDoseRateValue,
                humidity: lastHumidityValue
            });
        }
    }
    else {
        res.status(404).send('Station not found');
    }
});
// Start the server
app.listen(port, host, function () {
    console.log("Server is running on http://".concat(host, ":").concat(port));
});
function generateRandomNumbers(min, max, lastValue) {
    if (lastValue === null) {
        // Generate a random number across the full range if no last value is provided
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    else {
        // Calculate possible lower and upper bounds considering the last known value
        var low = Math.max(min, lastValue - 1);
        var high = Math.min(max, lastValue + 1);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }
}
