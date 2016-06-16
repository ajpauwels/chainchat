var socket = io();

$(document).ready(function() {
	var user = {};
	//start prompting for username/password
	user.username = prompt("Who are you?", "Username");
	user.username = user.username.trim();
	while( user.username == "Username" || user.username.trim() == "") {
		user.username = prompt("Please make a new username", "Username");
	}
	//user.username = user.username.trim();
	user.password = prompt("Password for " + user.username + ":");
	//

	
	var juser = JSON.stringify(user);
	console.log(juser);
	socket.emit('username', juser);
	$('#send').click(function() {
		socket.emit('message', $('#chatinput').val());
		$('#chatinput').val('');
		return false;
	});

	$('#chatinput').keypress(function(e) {
		if (e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			$('#send').trigger("click");
		}
	});
});



socket.on('password', function(juser){
	var user = JSON.parse(juser);
	user.password = prompt("Wrong password, try again", 'Password');
	var rejson = JSON.stringify(user);
	socket.emit('username', rejson);
});
socket.on('usermsg', function(msg) {
	$('#chatview').append($('<p>', {class: "welcome"}).text(msg));
	updateScroll();
});

socket.on('message', function(msg) {
	var usr = JSON.parse(msg);
	var newpelem = $('<p>', {class: "para"});
	var newspan = $('<span>', {class: "initial"}).css('background-color', usr.color);
	newspan.text(usr.name[0].toLowerCase());
	newpelem.text(usr.msg);
	newpelem.prepend(newspan);
	var d = new Date().toLocaleTimeString();
	var timelem = $('<span>', {class: "time"});
	timelem.text(d.toString());
	newpelem.append(timelem);
	$('#chatview').append(newpelem);
	updateScroll();
});

function updateScroll() {
	var elem = $('#chatview');
	elem.scrollTop(elem.prop("scrollHeight"));
}