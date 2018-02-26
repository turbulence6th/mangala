var websocket = new WebSocket(":protocol:/:ip::port/websocket"
		.replace(":protocol", window.location.protocol=="http:"?"ws":"wss")
		.replace(":ip", window.location.hostname)
		.replace(":port", window.location.port));

websocket.addEventListener("message", message => {
	var data = JSON.parse(message.data);
	if(data.action == 'create' && data.status == true) {
		introGame.pinBox.digit.draw("PIN:" + data.room);
	}
	
	else if(data.action == 'join') {
		if(data.status == true) {
			introGame.lock = false;
			mangalaGame.init(data.turn);
		}
		
		else {
			introGame.sleep(200).then(() => {
				introGame.join.updateColor(introGame.normalColor);
			});
		}
	}
	
	else if(data.action == 'move') {
		mangalaGame.initDistribute(2, data.beans, 5 - data.wellNumber);
	}
	
	else if(data.action == 'leave') {
		mangalaGame.center.draw('OPPONENT LEFT');
		mangalaGame.lock = false;
	}
});

