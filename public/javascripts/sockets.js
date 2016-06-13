var socket = io();

$(document).ready(function() {
	var username = prompt("Who are you?", "Username");
	while( username == "Username") {
		username = prompt("Who are you?", "Username");
	}
	socket.emit('username', username);
	$('#send').click(function() {
		socket.emit('message', $('#chatinput').val());
		$('#chatinput').val('');
		return false;
	});

	$('#chatinput').keypress(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			$('#send').trigger("click");
		}
	});
});

socket.on('message', function(msg) {
	$('#chatview').append($('<p>').text(msg));
	updateScroll();
});

function updateScroll() {
	var elem = $('#chatview');
	elem.scrollTop(elem.prop("scrollHeight"));
}