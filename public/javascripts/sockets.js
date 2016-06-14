var socket = io();

$(document).ready(function() {
	var username = prompt("Who are you?", "Username");
	while( username == "Username" || username.trim() == "") {
		username = prompt("Please make a new username", "Username");
	}
	username = username.trim();
	socket.emit('username', username);
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

socket.on('usermsg', function(msg) {
	$('#chatview').append($('<p>').text(msg));
	updateScroll();
});

socket.on('message', function(msg) {
	var usr = JSON.parse(msg);
	var newpelem = $('<p>', {class: "para"});
	var newspan = $('<span>', {class: "initial"}).css('background-color', usr.color);
	newspan.text(usr.name[0]);
	newpelem.text(usr.msg);
	newpelem.prepend(newspan);
	$('#chatview').append(newpelem);
	updateScroll();
});

function updateScroll() {
	var elem = $('#chatview');
	elem.scrollTop(elem.prop("scrollHeight"));
}