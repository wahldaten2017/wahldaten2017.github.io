var map, featureList, wahllokalSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(wahllokals.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through wahllokals layer and add only features which are in the map bounds */
  wahllokals.eachLayer(function (layer) {
    if (map.hasLayer(wahllokalLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
    	var body = '<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.WLK_NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>';
        $("#feature-list tbody").append(body);
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Offene Daten Köln */
var attr = '<h4>Attribution</h4><a href=\'https://github.com/bmcbride/bootleaf\' target=\'_blank\'>Bootleaf</a> by <a href=\'http://bryanmcbride.com\'>bryanmcbride.com</a>, '
		+ '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>, '
		+ '<a href=\'http://www.offenedaten-koeln.de/\' target=\'_blank\'>Offene Daten K&ouml;ln</a>, '
		+ '<a href=\'http://getbootstrap.com/\' target=\'_blank\'>Bootstrap 3</a>, <a href=\'http://leafletjs.com/\' target=\'_blank\'>Leaflet</a>, '
		+ '<a href=\'https://www.datatables.net\' target=\'_blank\'>DataTables</a>, '
		+ '<a href="https://github.com/Leaflet/Leaflet.markercluster" target="_blank">leaflet marker cluster plugin</a>, '
		+ '<a href="http://twitter.github.io/typeahead.js/" target="_blank">typeahead.js</a>, ';

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: attr
});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});


/* Empty layer placeholder to add to layer control for listening when to add/remove Wahllokale to markerClusters layer */
var wahllokalLayer = L.geoJson(null);
var wahllokals = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" 
      	+ "<tr><th>Stimmbezirk</th><td>" + feature.id + "</td></tr>" 
    	+ "<tr><th>Name</th><td>" + feature.properties.WLK_NAME + "</td></tr>" 
        + "<tr><th>Strasse</th><td>" + feature.properties.WLK_ADRESSE + "</td></tr>" 
        + "<tr><th>Ort</th><td>" + feature.properties.POSTZUSTELLBEZIRK + " K&ouml;ln</td></tr>" 
        + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"></td><td class="feature-name">' + layer.feature.properties.WLK_NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      wahllokalSearch.push({
        name: layer.feature.properties.WLK_NAME,
        address: layer.feature.properties.WLK_ADRESSE,
        source: "Wahllokale",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("https://tom.cologne.codefor.de/wahlgebiet/service/wahllokale?geojson", function (data) {
  wahllokals.addData(data);
  map.addLayer(wahllokalLayer);
});

map = L.map("map", {
  zoom: 10,
  center: [50.94135, 6.95819],
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === wahllokalLayer) {
    markerClusters.addLayer(wahllokals);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === wahllokalLayer) {
    markerClusters.removeLayer(wahllokals);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function(map) {
	var div = L.DomUtil.create("div", "leaflet-control-attribution");
	div.innerHTML = "<span class='hidden-xs'>Developed by <a href='https://github.com/weberius' target='_blank'>Wolfram Eberius</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
	return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: true,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);


/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight
};

var groupedOverlays = {
  "Points of Interest": {
    "Wahllokale": wahllokalLayer
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var wahllokalsBH = new Bloodhound({
    name: "Wahllokale",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.WLK_NAME);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: wahllokalSearch,
    limit: 10
  });

  wahllokalsBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Wahllokale",
    displayKey: "name",
    source: wahllokalsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Wahllokale</h4>",
      suggestion: Handlebars.compile(["{{WLK_NAME}}<br>&nbsp;<small>{{WLK_ADRESSE}}</small>"].join(""))
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Wahllokale") {
      if (!map.hasLayer(wahllokalLayer)) {
        map.addLayer(wahllokalLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}

function onMapClick(e) {
	var stimmbezirk = 0;
	var content = '';
  var ergebnis = '';
	var featureTitle = '';
	$.getJSON("https://tom.cologne.codefor.de/wahlgebiet/service/stimmbezirk/" + e.latlng.lng + "/" + e.latlng.lat, function (data) {
		stimmbezirk = data[0].nummer;
		featureTitle = data[0].stt;
		//content = JSON.stringify(data);
	}).success(function(data) {
		console.log( "success: " + JSON.stringify(data) );

		$.getJSON("https://tom.cologne.codefor.de/wahlergebnis/service/landtagswahl/05/05315000/2012-05-13/erststimmen/" + stimmbezirk + "", function (wahlergebnis) {
			console.log( "success: " + JSON.stringify(wahlergebnis) );
			//content = JSON.stringify(wahlergebnis);
			featureTitle += "&nbsp;-&nbsp;Stimmbezirk&nbsp;" + wahlergebnis.stimmbezirke[0].nr;
      
      for (var i = 0; i < wahlergebnis.stimmbezirke[0].ergebnisse.length; i++) {
          ergebnis += "<tr><td>" + wahlergebnis.stimmbezirke[0].ergebnisse[i].partei 
            + "</td><td>" + wahlergebnis.stimmbezirke[0].ergebnisse[i].stimmen + "</td>"
            + "</td><td>" + Math.round10((wahlergebnis.stimmbezirke[0].ergebnisse[i].stimmen / wahlergebnis.stimmbezirke[0].abgegeben * 100), -2) + "</td>"
            + "</td><td>" + Math.round10((wahlergebnis.stimmbezirke[0].ergebnisse[i].stimmen /wahlergebnis.stimmbezirke[0].wahlberechtigt * 100), -2) + "</td></tr>";
			}

			content = "<div class='table-responsive'>"
        + "<table class='table'>"
				+ "<tr><th>Wahlbeteiligung</th><th>absolut</th><th>%</th><th>&nbsp;</th></tr>"
				+ "<tr><td>wahlberechtigt</td><td colspan='3'>" + wahlergebnis.stimmbezirke[0].wahlberechtigt + "</td></tr>"
				+ "<tr><td>abgegeben</td><td colspan='3'>" + wahlergebnis.stimmbezirke[0].abgegeben + "</td></tr>"
				+ "<tr><td>gueltig</td><td colspan='3'>" + wahlergebnis.stimmbezirke[0].gueltig + "</td></tr>"
				+ "<tr><td>ungueltig</td><td colspan='3'>" + wahlergebnis.stimmbezirke[0].ungueltig + "</td></tr>"
        + "<tr><td>Nichtw&auml;hler" 
          + "</td><td>" + (wahlergebnis.stimmbezirke[0].wahlberechtigt - wahlergebnis.stimmbezirke[0].abgegeben) + "</td>"
          + "</td><td>" + Math.round10(((wahlergebnis.stimmbezirke[0].wahlberechtigt - wahlergebnis.stimmbezirke[0].abgegeben) /wahlergebnis.stimmbezirke[0].wahlberechtigt * 100), -2 ) + "</td>"
          + "</td><td>&nbsp;</td></tr>"
				+ "<tr><th>Wahlergebnis</th><th>absolut</th><th>% abgegeben</th><th>% wahlberechtigt</th></tr>"
				+ ergebnis
				+ "</table>"
        + "</div>";
			$("#feature-title").html(featureTitle);
		    $("#feature-info").html(content);
		    $("#featureModal").modal("show");
		});

	});
}

map.on('click', onMapClick);