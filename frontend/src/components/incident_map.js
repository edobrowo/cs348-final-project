import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import '../index.css';

const apiHost = process.env.REACT_APP_API_HOST;
mapboxgl.accessToken = 'pk.eyJ1IjoiZWRvYnJvd28iLCJhIjoiY2xqeWhhdHNrMDQyaTNkb2YyZTdheHJtYSJ9.n1sAsb2dGV9ABpQhHP8qxQ';

const initLng = -97;
const initLat = 39;
const initZoom = 3.5;

let lastLatLow = 0;
let lastLngLow = 0;
let firstLoad = true;

const markers = [];

const Map = () => {
  const [incidents, setIncidents] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lngLow, setLngLow] = useState(-130);
  const [lngHigh, setLngHigh] = useState(-60);
  const [latLow, setLatLow] = useState(15);
  const [latHigh, setLatHigh] = useState(60);

  const retrieveIncidents = async () => {
    try {
      const urlStr = apiHost.concat(
        '/incidentbrief?',
        `longlow=${encodeURIComponent(Math.round(Number(lngLow) * 1000) / 1000)}&`,
        `longhigh=${encodeURIComponent(Math.round(Number(lngHigh) * 1000) / 1000)}&`,
        `latlow=${encodeURIComponent(Math.round(Number(latLow) * 1000) / 1000)}&`,
        `lathigh=${encodeURIComponent(Math.round(Number(latHigh) * 1000) / 1000)}`
      );
      console.log(urlStr);
      const response = await axios.get(urlStr);
      setIncidents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    retrieveIncidents();

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [initLng, initLat],
      zoom: initZoom,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    if (firstLoad && (incidents.length === 0)) return;
    firstLoad = false;

    const width = Math.abs(lngHigh - lngLow);
    const height = Math.abs(latHigh - latLow);
    const widthOld = Math.abs(lngHigh - lastLngLow);
    const heightOld = Math.abs(latHigh - lastLatLow);
    const lngOffset = (width > widthOld) ? width / 10 : width / 5;
    const latOffset = (height > heightOld) ? height / 10 : height / 5;
    if (Math.abs(lngLow - lastLngLow) < lngOffset && Math.abs(latLow - lastLatLow) < latOffset) {
      return;
    }

    retrieveIncidents();

    lastLngLow = lngLow;
    lastLatLow = latLow;

    for (let i = 0; i < markers.length; ++i) {
      markers[i].remove();
    }

    for (let i = 0; i < incidents.length; ++i) {
      const el = document.createElement('div');
      el.className = 'marker';
      const popup = new mapboxgl.Popup({ offset: 10 }).setText(`${incidents[i].name}, ${incidents[i].date.substring(0, 10)}`);
      const marker = new mapboxgl
        .Marker(el)
        .setLngLat([incidents[i].longitude, incidents[i].latitude])
        .setPopup(popup)
        .addTo(map.current);
      markers.push(marker);
    }
  });

  useEffect(() => {
    if (!map.current) return;
    map.current.on('move', () => {
      const tLngLow = Number(map.current.getBounds()._sw.lng.toFixed(4));
      const tLngHigh = Number(map.current.getBounds()._ne.lng.toFixed(4));
      const tLatLow = Number(map.current.getBounds()._sw.lat.toFixed(4));
      const tLatHigh = Number(map.current.getBounds()._ne.lat.toFixed(4));
      setLngLow(tLngLow - 0.1);
      setLngHigh(tLngHigh + 0.1);
      setLatLow(tLatLow - 0.1);
      setLatHigh(tLatHigh + 0.1);
    });
  })

  return (
    <div>
      <div ref={mapContainer} className='map-container' />
    </div>
  );
};

export default Map;
