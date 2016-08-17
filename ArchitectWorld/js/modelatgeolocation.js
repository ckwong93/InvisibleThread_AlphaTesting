var World = {
    
	PATH_INDICATOR : "assets/directionIndicator.png",
	PATH_MODEL_WT3 : "assets/arrow.wt3",
	MSG_MODEL_VISIBLE : "Thread Ahead!",
	MSG_MODEL_NOTVISIBLE : "Invisible Thread!",
    
   
    
	init: function initFn() {
        // Call server for last location
        $.ajax({
               url: "https://evening-plateau-54300.herokuapp.com/sushi.json",
               dataType: "json",
               type: "GET"
               }).done(function(response){
                    AR.context.onLocationChanged = function(latitude, longitude, altitude, accuracy){
                      World.myLocation = {"latitude": latitude, "longitude" : longitude, "altitude" : altitude };
                      if (!World.created) {
                         var serverLatitude = parseFloat(response["thread"][0]);
                         var serverLongitude = parseFloat(response["thread"][1]);
                         document.getElementById('loadingMessage').innerHTML = "Latitude:"+serverLatitude+ "Longitude:"+serverLongitude;
                         World.created = true;
                         World.createModelAtLocation(World.myLocation, serverLatitude, serverLongitude);
                      }
                    };
                })
		
	},

	createModelAtLocation: function createModelAtLocationFn(location, lat, long) {
        
        var myHouse = new AR.GeoLocation(lat, long)
        var distance = myHouse.distanceToUser();
        var distance_model = distance > 500 ? [World.model] : [World.indicatorDrawable2];

		// place object around the user, in this case just a few meters next to the user. Note that the object will stay where it is, so user can move around it.
		World.modelGeoLocation = new AR.GeoLocation(myHouse.latitude, myHouse.longitude, AR.CONST.UNKNOWN_ALTITUDE);
		
        
        
        
		// load model
		World.model = new AR.Model(World.PATH_MODEL_WT3, {

			// trigger animation once asset was loaded
			onLoaded: function() {

				// trigger loading of directin indicator
		        World.indicatorImage = new AR.ImageResource(World.PATH_INDICATOR);
                                   
		        // create indicator drawable using the image resource
		        World.indicatorDrawable = new AR.ImageDrawable(World.indicatorImage,0.5, {
		            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
		        });

                World.indicatorDrawable2 = new AR.ImageDrawable(World.indicatorImage,5, {
                    verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
                });

		        // define model as geoObject, including its direction indicator
				World.modelGeoObject = new AR.GeoObject(World.modelGeoLocation, {
                                        
		            drawables: {
                                                        
//		               cam: [World.model],
//                     cam is now blue arrow instead of 3d obj
                                                        
		               indicator: [World.indicatorDrawable],
                       cam : [World.indicatorDrawable2]
                       
		            },
		            onEnterFieldOfVision: function() {
		            	World.modelVisible = true;
		            	document.getElementById('loadingMessage').innerHTML = "Distance to thread: " + Math.round((distance/1609.34)*100)/100 + " mi";
		            },
		            onExitFieldOfVision: function() {
		            	World.modelVisible = false;
		            	document.getElementById('loadingMessage').innerHTML = World.MSG_MODEL_NOTVISIBLE;
                                                        

		            },
		            onClick: function() {
		            	console.log('clicked the model');
		            }
		        });

			    World.worldLoaded();

			},
			onError: function(err) {
				World.worldError('Could not load model file.');
			},
			scale: {
				x: 3.3,
				y: 3.3,
				z: 3.3
			},
			translate: {
				x: 0,
				y: 0,
				z: 0
			},
			rotate: { 
                roll:-25, //z
				heading: 90, //x
				tilt: 180 //y
			}
		});
	},

	worldLoaded: function worldLoadedFn() {
		World.loaded = true;
		document.getElementById('loadingMessage').innerHTML = World.modelVisible ? World.MSG_MODEL_VISIBLE : World.MSG_MODEL_NOTVISIBLE;
	},

	worldError: function worldErrorFn(msg) {
		document.getElementById('loadingMessage').innerHTML = msg ? msg : 'unexpected error';
	},
    
    // get request to the server to show the last location sent to the server
    showLocation: function showLocationFn() {
        
            $.ajax({
                   url: "https://evening-plateau-54300.herokuapp.com/sushi.json",
                   dataType: "json",
                   type: "GET"
                   }).done(function(response){
                        document.getElementById('loc').innerHTML = "Server response: " + response["thread"][0] + response["thread"][1];
                    })
        
    },

    // post request to the server to save the current location
    saveLocation: function saveLocationFn() {
        
        var latitude = World.myLocation.latitude;
        var longitude = World.myLocation.longitude;
        $.ajax({
               url: "https://evening-plateau-54300.herokuapp.com/latitude/" + latitude + "/longitude/" +longitude,
               type: "POST"
        }).done(function(response){
                
                })
    }
    
};

World.init();

//var current_location = new AR.Geolocation(World.myLocation.latitude,World.myLocation.longitude);
//var model_location = new AR.Geolocation(37.780694, -122.403704);
//var distance = model_location.distanceTo(current_location);
//console.log(distance);

