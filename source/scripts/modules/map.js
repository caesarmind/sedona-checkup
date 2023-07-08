import L from "leaflet";

const ZOOM = 7;
const MIN_SIZE = 27;
const MAX_SIZE = 27;
const BASE_COORDS = {
  lat: 34.8697395,
  lng: -111.7609896
};

const map = L.map('map', { scrollWheelZoom: false }).setView(BASE_COORDS, ZOOM);

L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
	minZoom: ZOOM,
	subdomains: ["mt0", "mt1", "mt2", "mt3"]
}).addTo(map);


// Создаем главную метку
const pinIcon = L.marker(BASE_COORDS, {
	icon: L.icon({
		iconUrl: "img/map-marker.svg",
		iconSize: [MIN_SIZE, MAX_SIZE],
	})
});

// Adds marker to cart
pinIcon.addTo(map);

//Removes the image of map when leaflet do work.
const mapContainer = document.querySelector('.map');
mapContainer.classList.remove('map--nojs');
