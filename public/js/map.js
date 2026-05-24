document.addEventListener("DOMContentLoaded", () => {

    console.log("coords:", coords);

var map = L.map('map').setView([coords[1], coords[0]], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);


// Custom red marker icon
const customIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

var marker = L.marker([coords[1], coords[0]] ,  { icon: customIcon })
.addTo(map);
marker.bindPopup(`<b>${pgTitle}</b> <br>Exact location will be provided after booking`)
.bindTooltip(pgTitle, {
        permanent: false,
        direction: "top"
})
.openPopup();



var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
map.on('click', onMapClick);

});