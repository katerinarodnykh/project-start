var uluru = {lat: 59.938955, lng: 30.323115};
var desktopCenter = {lat: 59.939095, lng: 30.319328};
var variable;

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: variable
    });
    image = 'img/map-pin.png'
    var marker = new google.maps.Marker({
        position: uluru,
        map: map,
        icon: image
    });
}

if (window.screen.width>=1300) {
    variable = desktopCenter;
} else {
    variable = uluru;
}