import fetch from "node-fetch";
import { getMinLatitude } from "../src/map.js";

test('getMinLatitude', async () => {
    const stations = await fetch('http://localhost:3000/data/stations.json').then(response => response.json());
    
    expect(getMinLatitude(stations)).toBe(136.872412);

});