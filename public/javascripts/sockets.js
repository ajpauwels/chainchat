var socket = io();

$(document).ready(function() {
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
});