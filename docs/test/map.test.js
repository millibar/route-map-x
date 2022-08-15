import fetch from "node-fetch";
import { getMinLatitude, getMaxLatitude } from "../src/map.js";

const relative = 'localhost:3000';

test('getMinLatitude', async () => {
    const stations = await fetch(`http://${relative}/data/stations.json`).then(response => response.json());
    expect(getMinLatitude(stations)).toBe(136.872412);
});

test('getMaxLatitude', async () => {
    const stations = await fetch(`http://${relative}/data/stations.json`).then(response => response.json());
    expect(getMaxLatitude(stations)).toBe(136.997305);
});