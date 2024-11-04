
let map;

function initMap() {
    // Center the map on New York City
    const nycCoords = { lat: 40.7128, lng: -74.0060 }; // New York City coordinates

    map = new google.maps.Map(document.getElementById("map"), {
        center: nycCoords,
        zoom: 8, 
        mapTypeControl: false,// Adjust zoom level as needed
    });

    // Add marker at the center (New York City)
    addMarker(nycCoords);
}

// Function to add marker at a given position
function addMarker(location) {
    new google.maps.Marker({
        position: location, // Set marker at the passed location
        map: map, // The map to add the marker to
        title: "New York City", // Optional title for the marker
    });
}


        

  

  

 


