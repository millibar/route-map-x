/**
 * @jest-environment jsdom
 */
import { createStation, createLine } from '../src/html-map.js';

test('createStation', () => {
    const station = {
        ID: 'S01',
        stationName: '中村区役所',
        lineName: '桜通線',
        color: 'rgb(202, 37, 43)',
        x: 500,
        y: 250
    };
    const div = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = '中村区役所';
    div.id = '中村区役所';
    div.style.top = '250px';
    div.style.left = '500px';
    div.style.color = 'rgb(202, 37, 43)';
    div.classList.add('station');
    div.classList.add('桜通線');
    div.appendChild(span);

    expect(createStation(station)).toStrictEqual(div);
});

test('createLine', () => {
    const A = {
        ID: 'S01',
        stationName: '中村区役所',
        lineName: '桜通線',
        color: 'rgb(202, 37, 43)',
        x: 500,
        y: 250
    };

    const B = {
        ID: 'S02',
        stationName: '名古屋',
        lineName: '桜通線',
        color: '#ca252b',
        x: 750,
        y: 500
    };

    const span = document.createElement('span');
    span.classList.add('line');
    span.style.top = '250px';
    span.style.left = '500px';
    span.style.width = '353.5533905932738px';
    span.style.transform = 'rotate(45deg) translate(0, -3px)';
    span.style.background = 'rgb(202, 37, 43)';

    expect(createLine(A, B)).toStrictEqual(span);
});