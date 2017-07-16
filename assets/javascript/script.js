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
$("h1").attr("style", "text-align: center;");

var formatHHmm = function(minString) {
	var hh = minString.split(":")[0];
	var mm = minString.split(":")[1];
	return parseInt(hh) * 60 + parseInt(mm);
}
// calc converts trainStart and trainFreq into variables remains and nextArrival
var calc = function() {
	var startMin = formatHHmm(trainStart);
	var nowTime = moment().format("HH:mm");
	var nowMin = formatHHmm(nowTime);

  	var dif = Math.abs(nowMin - startMin);
  	remains = dif % parseInt(trainFreq);
  	alert(remains);
  	nextArrival = formatHHmm(remains.toString());

 	// nowMins += remains;
 	// if(nowMins >= 60) {
 	// 	do {
 	// 		nowMins -= 60;
 	// 		nowHrs ++;
 	// 	} while(nowMins >= 60);
 	// 	if(nowHrs > 23) {
 	// 		nowHrs = nowHrs % 24;
 	// 	}
 	// }
 	// if(nowMins < 10) {
 	// 	nowMins = "0" + nowMins;
 	// }
 	// if(nowHrs < 10) {
 	// 	nowHrs = "0" + nowHrs;
 	// }
 	
}
// Get values from form fields and push to database
var submit = function() {
	// sets local variables to form field values
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
	trainStart = sv.trainStart.toString();
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
var clock = function() {

	var ref = database.ref();
	ref.on("value", function(snapshot) {
		var sv = snapshot.val();
	    var key = Object.keys(sv);

		$("#trainTable").empty();
	    key.forEach(function(itm, idx, arr){
	    	var k = key[idx];
	    	trainName = sv[k].trainName;
			trainDest = sv[k].trainDest;
			trainStart = sv[k].trainStart.toString();
			trainFreq = sv[k].trainFreq;
			calc();
			$("#trainTable").append("<tr><td>" + trainName +
			"</td><td>" + trainDest +
			"</td><td>" + trainFreq +
			"</td><td>" + nextArrival +
			"</td><td>" + remains + "</td></tr>");
	    });
	});
}
function realTime() {
  	$("#clock").html(moment().format("HH:mm:ss"));
  	if(moment().format("ss") == 0) {
  		clock();
  	}
}
$("#submitBtn").on("click", submit);
database.ref().on("child_added", update);
var realClock = setInterval(realTime, 100);