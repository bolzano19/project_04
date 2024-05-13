import { Request, Response, NextFunction } from 'express';
import { Express } from 'express';

const express = require('express');
const app: Express = express();
const cors = require('cors');
const corsMiddleware: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = cors();
const host: string = 'localhost';
const port: number = 3000;

let lastTemperatureValue: number = 36;
let lastDoseRateValue: number = 5;
let lastHumidityValue: number = 75;


interface Station {
    id: number;
    address: string;
    status: boolean;
}

let stations: Station[] = require('./stations.json');

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/stations', (req: Request, res: Response) => {
    res.send(stations);
});

app.get('/stations/:id', (req: Request, res: Response) => {
    const stationId: number = parseInt(req.params.id);
    const station: Station | undefined = stations.find(st => st.id == stationId);
if (station) {
    // В этом блоке station гарантированно имеет тип Station
    res.send(station);
} else {
    res.status(404).send('Station not found');
}
});

app.post('/stations', (req: Request, res: Response) => {
    const station: Station = req.body;
    const stationId: number = stations.length > 0 ? stations[stations.length - 1].id + 1 : 1;
    const newStation: Station = { ...station, id: stationId };
    stations.push(newStation);
    res.send(newStation);
});

app.delete('/stations/:id', (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    stations = stations.filter(st => st.id !== id);
    res.send(`Station ${id} has been deleted`);
});

app.put('/stations/:id', (req: Request, res: Response) => {
    const index: number = stations.findIndex(st => st.id == parseInt(req.params.id));
    stations[index] = {
        ...stations[index],
        ...req.body
    };
    res.send(stations[index]);
});

app.get('/stations/:id/metrics', (req: Request, res: Response) => {
    const stationId: number = parseInt(req.params.id);
    const station: Station | undefined = stations.find(
        st => st.id === stationId);

    if (station) {
        if (!station.status) {
            res.send({
                temperature: 0,
                dose_rate: 0,
                humidity: 0
            });
        } else {
            lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
            lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
            lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);

            res.send({
                temperature: lastTemperatureValue,
                dose_rate: lastDoseRateValue,
                humidity: lastHumidityValue
            });
        }
    } else {
        res.status(404).send('Station not found');
    }
});

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

function generateRandomNumbers(min: number, max: number, lastValue: number | null): number {
    if (lastValue === null) {
        // Generate a random number across the full range if no last value is provided
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        // Calculate possible lower and upper bounds considering the last known value
        const low: number = Math.max(min, lastValue - 1);
        const high: number = Math.min(max, lastValue + 1);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }
}

