var socket = io.connect()
    , map
    , heatmap
    , markersArray = []
    , aTweet
    , newTweet
    , focusLocation
    , totalNogeoTweets = 0
    , totalgeoTweets = 0
    , limitTweetsTable = 100
    , limitMarkers = 1000
    , totalTweets = 0
    , mapType = 1
    , pointArray = new google.maps.MVCArray()
    , markers = []
    , selectedWord = "game";

jQuery(function ($) {

    handleResetUiButton();

    changeKeyword();


    initialize();
    // //Map setup
    // focusLocation = new google.maps.LatLng(40.800, -73.833); // focus on New York
    // var mapOptions = {
    //     zoom: 3,
    //     mapTypeId: google.maps.MapTypeId.ROADMAP,
    //     center: focusLocation,
    //     scrollwheel: false
    // };
    // map = new google.maps.Map(document.getElementById('map'),mapOptions);

    // Socket.io setup
    var tweetsWithoutGeoTable = $("#nogeotweetstable").find('tbody');
    var tweetsWithGeoTable = $("#geotweetstable").find('tbody');



    socket.on('tweets', function (data) {
        updateTotalTweets();
        aTweet = '<tr><td width="30%"><img src="'+data.profileimg+'" class="img-rounded"><br><span>' +data.username+ '</span><br><a style="font-size: 80%" href="https://twitter.com/' +data.user+'" target="_blank" >@' + data.user + '</a>' + '</td><td width="70%">' + data.text + '</td></tr>';
        if(data.geo){

            newTweet = new google.maps.LatLng(data.latitude, data.geo.longitude);

            updateTotalTweetsWithGeo();
            // Add a marker to the map
            if(mapType == 1) {
                addMarker(data.latitude,data.longitude,data.user,data.text);
            }
            
            // Check table limit
            if(totalgeoTweets >= limitTweetsTable){ // table limit
                removeTableRow($("#geotweetstable"));
            }
            // add it to the table
            tweetsWithGeoTable.prepend(aTweet);
        } else {
            updateTotalTweetsWithoutGeo();
            // Check Limit
            if(totalNogeoTweets >= limitTweetsTable){
                removeTableRow($("#nogeotweetstable"));
            }
            // add it to the table
            tweetsWithoutGeoTable.prepend(aTweet);
        }
    });

    /* */
    socket.on('dbdata', function (dbData) {

        
        if(mapType == 1){
            addMarker(dbData.latitude, dbData.longitude, dbData.user, dbData.text);
            var latLng = new google.maps.LatLng(dbData.latitude,
                  dbData.longitude);
            var temp = new google.maps.Marker({
                position: latLng
              });
            markers.push(temp);
        }

        
        pointArray.push(latLng);
        // var markerCluster = new MarkerClusterer(map markersArray);
    });
    /* */

});

function initialize() {
    /* 
     * Map setup
     */
    // focusLocation = new google.maps.LatLng(40.800, -73.833); // focus on New York
    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(46, 0),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    };
    map = new google.maps.Map(document.getElementById('map'),mapOptions);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointArray,
    });
}

/**
 * Updating the global tweet counter
 *
 */
function updateTotalTweets() {
    totalTweets = totalTweets + 1;
    $("span#totaltweet").html(totalTweets);
}

/**
 * Updating geatagged tweets counter
 *
 */
function updateTotalTweetsWithGeo() {
    totalgeoTweets = totalgeoTweets + 1;
    $("span#totaltweetWithGeo").html(totalgeoTweets);
}

/**
 * Updating  tweets counter without geotag
 *
 */
function updateTotalTweetsWithoutGeo() {
    totalNogeoTweets = totalNogeoTweets + 1;
    $("span#totaltweetWithoutGeo").html(totalNogeoTweets);
}


/**
 * Adding a new marker to the map
 *
 * @param latitude
 * @param longitude
 * @param user
 * @param text
 */
function addMarker(latitude,longitude,user,text) {
    var infowindow = new google.maps.InfoWindow();
    infowindow.setContent('<a href="https://twitter.com/' +user+'" target="_blank">' + user + '</a> says: '+ '<p>'+ text+'</p>');
    var marker = new google.maps.Marker({
        map:map,
        draggable:false,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(latitude,longitude)
    });

    if(markersArray.length >= limitMarkers){
        markersArray[0].setMap(null);
        markersArray.shift();
    }
    markersArray.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
    });
}


/**
 * Remove last table row
 *
 * @param a Table
 */
function removeTableRow(jQtable) {
    jQtable.each(function(){
        if($('tbody', this).length > 0){
            $('tbody tr:last', this).remove();
        }else {
            $('tr:last', this).remove();
        }
    });
}

/**
 * Reseting the UI:
 * - Clear map.
 * - Clear tables
 * - Reset tweet counters.
 */
function handleResetUiButton() {
    $("#clearMapButton").click(function (e) {
        e.preventDefault();
        // Clear the map
        if (markersArray) {
            for (i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
            totalNogeoTweets = 0;
            totalgeoTweets = 0;
            totalTweets = 0;
            $("span#totaltweet").html('0');
            $("span#totaltweetWithGeo").html('0');
            $("span#totaltweetWithoutGeo").html('0');
        }
        // Clear the tables
        $('#geotweetstable tbody').empty();
        $('#nogeotweetstable tbody').empty();
    });
}


function changeKeyword() {
    $("#sel-keywords").change(function (e) {
        e.preventDefault();
        selectedWord = $("#sel-keywords").val();
        $("span#keycriteria").html(selectedWord);

        pointArray = [];

        if (markersArray) {
            for (i in markersArray) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
            totalNogeoTweets = 0;
            totalgeoTweets = 0;
            totalTweets = 0;
            $("span#totaltweet").html('0');
            $("span#totaltweetWithGeo").html('0');
            $("span#totaltweetWithoutGeo").html('0');
        }
        // Clear the tables
        $('#geotweetstable tbody').empty();
        $('#nogeotweetstable tbody').empty();
        
        socket.emit('keyword', {
            keyword: selectedWord
        });
        // var markerCluster = new MarkerClusterer(map, markers);
    });
}

// function changeToHeatmap() {
    $("#btn-heatmap").click(function (e) {
        clearMarker();
        mapType = 2;
        heatmap.setMap(heatmap.getMap() ? null : map);
        
    });
    
// }

// function changeToScatter() {
    $("#btn-scatter").click(function (e) {
        //clearMarker();
        mapType = 1;
        initialize();
        socket.emit('keyword', {
            keyword: selectedWord
        });
    });
// }




function clearMarker() {
    if(heatmap != null) {
        heatmap.setMap(null);
    }
    for(i in markersArray) {
        markersArray[i].setMap(null);
    }
    
}

function showMarker() {
    for(i in markersArray) {
        markersArray[i].setMap(map);
    }
}
