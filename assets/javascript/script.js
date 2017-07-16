// Init Firebase
var config = {
	apiKey: "AIzaSyDH1Y2ONAZwvL3PnCUN2WJ4xesdLq46jHY",
	authDomain: "fir-001-d196f.firebaseapp.com",
	databaseURL: "https://fir-001-d196f.firebaseio.com",
	projectId: "fir-001-d196f",
	storageBucket: "fir-001-d196f.appspot.com",
	messagingSenderId: "325387564453"
};
firebase.initializeApp(config);

// init global variables
var database = firebase.database();
var trainName = "";
var trainDest = "";
var trainStart = "";
var trainFreq = "";
var nextArrival = "";
var remains = "";
// css?
$("h1").attr("style", "text-align: center;");

// converts strings in "HH:mm" to minutes as an integer
var converToMins = function(HHmm) {
	var hh = HHmm.split(":")[0];
	var mm = HHmm.split(":")[1];
	return parseInt(hh) * 60 + parseInt(mm);
}
// converts minutes as an integer to "HH:mm" string
var convertToHHmm = function(mins) {
	var hh = parseInt(mins / 60);
	var mm = parseInt(mins % 60);
	// stringify the output
	var str = "";
 	if(hh > 23) {
 		hh = hh % 24;
 	}
 	if(hh < 10) {
 		str += "0" + hh;
 	} else {
 		str += hh;
 	}
 	if(mm < 10) {
 		str += ":0" + mm;
 	} else {
 		str += ":" + mm
 	}
	return str;
}
// calc converts trainStart and trainFreq into variables remains and nextArrival
var calc = function() {
	// minutes since midnight to firstArrival 
	var startMin = converToMins(trainStart);
	var nowTime = moment().format("HH:mm");
	// minutes since midnight to now
	var nowMin = converToMins(nowTime);
	// if the train already came
	if(startMin < nowMin) {
		var dif = nowMin - startMin;
		// the number of times the train has already come
		var intervals = parseInt(dif / parseInt(trainFreq));
		var lastTrain = intervals * parseInt(trainFreq) + startMin;
		var nextTrain = lastTrain + parseInt(trainFreq);
		nextArrival = convertToHHmm(nextTrain);
		remains = nextTrain - nowMin;
	} else {
		nextArrival = convertToHHmm(startMin);
		remains = startMin - nowMin;
	}
}
// Get values from form fields and push to database
var submit = function() {
	// sets local variables from form field values
	trainName = $("#trainName").val().trim();
	trainDest = $("#trainDest").val().trim();
	trainStart = $("#trainStart").val().trim();
	trainFreq = $("#trainFreq").val().trim();
	// creates a data object and pushes it to the database
	var data = {
		trainName: trainName,
		trainDest: trainDest,
		trainStart: trainStart,
		trainFreq: trainFreq,
	};
	database.ref().push(data);
}
// On refresh AND on submit, pulls values from database and updates html
var update = function(snapshot) {
	var sv = snapshot.val();
	// sets local variables to database values
	trainName = sv.trainName;
	trainDest = sv.trainDest;
	trainStart = sv.trainStart;
	trainFreq = sv.trainFreq;
	// converts trainStart and trainFreq into nextArrival and remains
    calc();
    // updates html with new current values
	$("#trainTable").append("<tr><td>" + trainName +
	"</td><td>" + trainDest +
	"</td><td>" + trainFreq +
	"</td><td>" + nextArrival +
	"</td><td>" + remains + "</td></tr>");
}
// runs once a minute on the minute
var clock = function() {
	var ref = database.ref();
	ref.on("value", function(snapshot) {
		var sv = snapshot.val();
	    var key = Object.keys(sv);
	    // empties the trainTable div
		$("#trainTable").empty();
		// forEach (replaced my wicked for loop)
	    key.forEach(function(itm, idx, arr){
	    	var k = key[idx];
	    	// pull database values down
	    	trainName = sv[k].trainName;
			trainDest = sv[k].trainDest;
			trainStart = sv[k].trainStart;
			trainFreq = sv[k].trainFreq;
			// convert trainStart and trainFreq into nextArrival and remains
			calc();
			// update html
			$("#trainTable").append("<tr><td>" + trainName +
			"</td><td>" + trainDest +
			"</td><td>" + trainFreq +
			"</td><td>" + nextArrival +
			"</td><td>" + remains + "</td></tr>");
	    });
	});
}
// updates the real time clock to within 1/10 of a second
function realTime() {
  	$("#clock").html(moment().format("HH:mm:ss"));
  	if(moment().format("ss") == 0) {
  		// updates the train times on every minute
  		clock();
  	}
}
// on click submit 
$("#submitBtn").on("click", submit);
// on child added calc() and display on html
database.ref().on("child_added", update);
// runs the clock to a precision of 1/10 of a second and updates html on the minute
var realClock = setInterval(realTime, 100);