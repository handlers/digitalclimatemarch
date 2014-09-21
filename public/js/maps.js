var marker = null; //not proud of this, but it's necessary for scope
var browser_coords = null;

$(document).ready(function() {
  function get_location() {
    if (Modernizr.geolocation) {
      navigator.geolocation.getCurrentPosition(set_browser_coords);
    } else {
      console.log("Can't geolocate...")
    }
  }

  function set_browser_coords(geopos) {
    browser_coords = geopos.coords;
    event = $.Event("centerMap");
    event.lat = geopos.coords.latitude
    event.lng = geopos.coords.longitude
    $('body').trigger(event);
  }

  get_location()
});

$(document).ready(function() {
  L.mapbox.accessToken = 'pk.eyJ1IjoiaGFuZGxlcnMiLCJhIjoiOVphaWwyVSJ9.MnXan-RqPGPGeAEsMVQwuw'; 
  var map = L.mapbox.map('map', 'handlers.ji8c6h44')
      .setView([40, -74.50], 4)
  map.on('dblclick', function(e) {
    var lat = e.latlng.lat
    var lng = e.latlng.lng
    marker = L.marker(new L.LatLng(lat, lng), {
      icon: L.mapbox.marker.icon({
        'marker-color': 'ff8888'
      }),
      draggable: true
    });
    var markup = "<div id='submit'> \
      <form class='pure-form pure-form-stacked'> \
        <label for='name'>Your name (optional)</label>\
        <input id='name' type='text' placeholder='Or nom de guerre, whatever'>\
        <label for='motivation'>Why do you care about climate change? (optional, <span class='length-warning'>140 chars</span>)</label>\
        <textarea id='motivation' rows='4' placeholder='e.g. I want human civilization to continue beyond this century.'></textarea>\
        <input type='hidden' id='lat' value ='" + lat +"'>\
        <input type='hidden' id='lng' value='" + lng + "'>\
        <input type='submit' value='Add me to the map!'>\
      </form>\
    </div>"
    marker.bindPopup(markup);
    marker.addTo(map);
    popup = marker.openPopup();
  });
  var marker_layer = map.featureLayer.setGeoJSON(geojson);
  $.ajax({
    url: "marker",
    data: {
      start: 0,
      fin: -1
    }
  }).done(function(data) {
    var geojson = $.parseJSON(data);
    marker_layer.setGeoJSON(geojson);
  });

  /* Marker submission */
  $('body').on('centerMap', function(e) {
    map.setView([e.lat, e.lng], 15)
  });

  /* Marker submission */
  $('#map').on('submit', '#submit', function(e) {
    var data = {};
    e.preventDefault();
    $('#submit form :input:not([type=submit])').each(function() {
      data[this.id] = $(this).val();
    });
    $("#spinner").show();
    $.ajax({
      url: "marker",
      method: "post",
      data: data
    }).done(function(data) {
      $("#spinner").hide()
      $("#submit").hide()
      data = $.parseJSON(data);
      if (data[0].type == "Feature") {
        marker_layer.setGeoJSON(geojson.concat(data))
        marker.closePopup();
      } else {
        alert('something went wrong...')
      }
    })
  });

  /* Message length validation */
  $('#map').on('keyup', '#motivation', function(e) {
    if ($(this).val().length > 140) {
      $(this).addClass("red");
      $(".length-warning").addClass("red");
      $("#submit input[type=submit]").hide()
    } else {
      $(this).removeClass("red");
      $("#submit input[type=submit]").show()
      $(".length-warning").removeClass("red");
    }
  });  

})