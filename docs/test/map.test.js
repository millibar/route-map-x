import fetch from "node-fetch";
import { getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude } from "../src/map.js";

const jsonUrl = 'http://localhost:3000/data/stations.json';

test('getMinLatitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMinLatitude(stations)).toBe(136.872412);
});

test('getMaxLatitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMaxLatitude(stations)).toBe(136.997305);
});

test('getMinLongitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMinLongitude(stations)).toBe(35.094986);
});

test('getMaxLongitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMaxLongitude(stations)).toBe(35.174577);
});