class IntroGame {
	constructor() {
		this.width = mangalaGame.width;
		this.height = mangalaGame.height;
		this.normalColor = mangalaGame.normalColor;
		this.actionColor = mangalaGame.actionColor;
		this.errorColor = 'red';
		this.lock = true;
		this.keyLock = true;
	}
	
	init() {
		this.canvas = document.getElementById('mangala');
		this.context = this.canvas.getContext('2d');
		this.canvas.addEventListener('click', event => this.click(event));
		document.addEventListener('keydown', event => this.keydown(event));
		
		this.canvas.setAttribute('width', this.width);
		this.canvas.setAttribute('height', this.height);
		this.mainScreen();
	}
	
	click(event) {
		if(!this.lock) {
			return;
		}
		
		var totalOffsetX = 0;
	    var totalOffsetY = 0;
	    var canvasX = 0;
	    var canvasY = 0;
	    var currentElement = this.canvas;

	    do{
	        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	    }
	    
	    while(currentElement = currentElement.offsetParent)

	    canvasX = event.pageX - totalOffsetX;
	    canvasY = event.pageY - totalOffsetY;
	    
		var x = Math.floor(canvasX / 7);
		var y = Math.floor(canvasY / 7);
		
		if(this.screen == 'main') {
			if(x >= this.createGame.width && x <= this.createGame.width + this.createGame.widthOffset && y >= this.createGame.height && y <= this.createGame.height + this.createGame.heightOffset) {
				this.lock = false;
				this.createGame.updateColor(this.actionColor);
				this.sleep(200).then(() => {
					this.createScreen();
					this.lock = true;
				});
			}
			
			else if(x >= this.joinGame.width && x <= this.joinGame.width + this.joinGame.widthOffset && y >= this.createGame.height && y <= this.joinGame.height + this.joinGame.heightOffset) {
				this.lock = false;
				this.joinGame.updateColor(this.actionColor);
				this.sleep(200).then(() => {
					this.joinScreen();
					this.lock = true;
				});
			}
		}
		
		else if(this.screen == 'create') {
			if(x >= this.back.width && x <= this.back.width + this.back.widthOffset && y >= this.back.height && y <= this.back.height + this.back.heightOffset) {
				this.lock = false;
				this.back.updateColor(this.actionColor);
				var request = {
					action: 'cancel'	
				};
				
				websocket.send(JSON.stringify(request));
				this.sleep(200).then(() => {
					this.mainScreen();
					this.lock = true;
				});
			}
		}
		
		else if(this.screen == 'join') {
			if(x >= this.join.width && x <= this.join.width + this.join.widthOffset && y >= this.join.height && y <= this.join.height + this.join.heightOffset) {
				this.lock = false;
				if(this.pin.n.length != 4) {
					this.join.updateColor(this.errorColor);
					this.sleep(200).then(() => {
						this.join.updateColor(this.normalColor);
						this.lock = true;
					});
				}
				
				else {
					this.join.updateColor(this.actionColor);
					var request = {
							action: 'join',
							room: this.pin.n
					}
					
					websocket.send(JSON.stringify(request));
					this.lock = true;
				}
			}
			
			else if(x >= this.back.width && x <= this.back.width + this.back.widthOffset && y >= this.back.height && y <= this.back.height + this.back.heightOffset) {
				this.lock = false;
				this.back.updateColor(this.actionColor);
				this.sleep(200).then(() => {
					this.mainScreen();
					this.lock = true;
				});
			}
		}
	}
	
	keydown(event) {
		if(!this.keyLock) {
			return;
		}
		
		if(this.screen == 'join') {
			if(event.key == 'Backspace') {
				this.keyLock = false;
				this.pin.draw(this.pin.n.slice(0, -1));
				this.keyLock = true;
			}
			
			else if(this.pin.n.length != 4 && !isNaN(parseInt(event.key))) {
				this.keyLock = false;
				this.pin.draw(this.pin.n + event.key);
				this.keyLock = true;
			}
		}
	}
	
	sleep(time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}
	
	clear() {
		for(var i = 0; i < this.width / 7; i++) {
			for(var j = 0; j < this.height / 7; j++) {
				new Point(this.context, i, j, 'black').draw();
			}
		}
	}
	
	mainScreen() {
		this.screen = 'main';
		this.clear();
		
		this.createGame = new Box(this.context, 20, 15, Math.floor(this.width / 7) - 40, 20, 'CREATE GAME', this.normalColor);
		this.createGame.draw();
		
		this.joinGame = new Box(this.context, 20, 47, Math.floor(this.width / 7) - 40, 20, 'JOIN GAME', this.normalColor);
		this.joinGame.draw();
	}
	
	createScreen() {
		this.screen = 'create';
		this.clear();
		
		this.pinBox = new Box(this.context, 20, 15, Math.floor(this.width / 7) - 40, 20, 'GETTING PIN', this.normalColor);
		this.pinBox.draw();
		
		this.back = new Box(this.context, 20, 47, Math.floor(this.width / 7) - 40, 20, 'BACK', this.normalColor);
		this.back.draw();
		
		var request = {
			action: 'create'	
		};
		
		websocket.send(JSON.stringify(request));
	}
	
	joinScreen() {
		this.screen = 'join';
		this.clear();
		
		this.pinTitle = new Digit(this.context, 20, 15, Math.floor(this.width / 7) - 40, this.normalColor);
		this.pinTitle.draw('ENTER PIN:');
		
		this.pin = new Digit(this.context, 20, 30, Math.floor(this.width / 7) - 40, this.normalColor);
		this.pin.draw('');
		
		this.join = new Box(this.context, 20, 47, 47, 20, 'JOIN', this.normalColor);
		this.join.draw();
		
		this.back = new Box(this.context, 78, 47, 47, 20, 'BACK', this.normalColor);
		this.back.draw();
	}
}

class MangalaGame {
	constructor() {
		this.wellWidth = 16;
		this.wellHeight = 16;
		this.chestWidth = this.wellWidth;
		this.chestHeight = this.chestWidth * 2;
		this.centerWidth = this.wellWidth * 4 + 14;
		this.centerHeight = this.chestHeight;
		this.width = (this.wellWidth * 6 + 31) * 8;
		this.height = (this.wellHeight + this.chestHeight + 35) * 7;
		this.normalColor = 'yellow';
		this.actionColor = '#2ECCFA';
		this.seperator = '-------------';
		this.player1Wells = [];
		this.player2Wells = [];
		this.lock = true;
	}
	
	init(turn) {
		this.canvas = document.getElementById('mangala');
		this.context = this.canvas.getContext('2d');
		this.canvas.addEventListener('click', event => this.click(event));
		this.canvas.setAttribute('width', this.width);
		this.canvas.setAttribute('height', this.height);
		this.turn = turn;
		this.draw();
	}
	
	click(event) {
		if(!this.lock) {
			return;
		}
		
		var totalOffsetX = 0;
	    var totalOffsetY = 0;
	    var canvasX = 0;
	    var canvasY = 0;
	    var currentElement = this.canvas;

	    do{
	        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	    }
	    
	    while(currentElement = currentElement.offsetParent)

	    canvasX = event.pageX - totalOffsetX;
	    canvasY = event.pageY - totalOffsetY;
	    
		var x = Math.floor(canvasX / 7);
		var y = Math.floor(canvasY / 7);
		
		var beans = 0, wellNumber;
		
		if(this.turn == 1) {
			for(var i = 0; i < this.player1Wells.length; i++) {
				var well = this.player1Wells[i];
				well.updateColor(this.normalColor);
				if(x >= well.width && x <= well.width + this.wellWidth && y >= well.height && y <= well.height + this.wellHeight) {
					beans = well.digit.n;
					wellNumber = i;
				}
			}
		}
		
		if(beans > 0) {
			this.lock = false;
			var request = {
				action: 'move',
				beans: beans,
				wellNumber: wellNumber
			};
			
			websocket.send(JSON.stringify(request));
			
			this.initDistribute(1, beans, wellNumber);
		}
		
	}
	
	initDistribute(player, beans, wellNumber) {
		this.center.draw('PLAYING');
		if(player == 1) {
			if(beans > 1) {
				var well = this.player1Wells[wellNumber];
				well.updateColor('#2ECCFA');
				well.digit.draw(1);
				
				this.sleep(750).then(() => {
					well.updateColor(this.normalColor);
					this.distribute(1, beans - 1, wellNumber + 1);
				});
			}
			
			else if(beans == 1) {
				var well = this.player1Wells[wellNumber];
				well.updateColor(this.actionColor);
				well.digit.draw(0);
				
				this.sleep(750).then(() => {
					well.updateColor(this.normalColor);
					this.distribute(1, beans, wellNumber + 1);
				});
			}
		}
		
		else if(player == 2) {
			if(beans > 1) {
				var well = this.player2Wells[wellNumber];
				well.updateColor(this.actionColor);
				well.digit.draw(1);
				
				this.sleep(750).then(() => {
					well.updateColor(this.normalColor);
					this.distribute(2, beans - 1, wellNumber - 1);
				});
			}
			
			else if(beans == 1) {
				var well = this.player2Wells[wellNumber];
				well.updateColor(this.actionColor);
				well.digit.draw(0);
				
				this.sleep(750).then(() => {
					well.updateColor(this.normalColor);
					this.distribute(2, beans, wellNumber - 1);
				});
			}
		}
	}
	
	distribute(player, beans, wellNumber) {
		if(beans > 0) {
			if(player == 1) {
				if(wellNumber < 6) {
					var well = this.player1Wells[wellNumber];
					well.updateColor(this.actionColor);
					well.digit.draw(well.digit.n + 1);
					
					var opponentsWell = this.player2Wells[wellNumber];
					if(beans == 1 && well.digit.n == 1 && opponentsWell.digit.n != 0 && this.turn == 1) {
						this.sleep(750).then(() => {
							well.updateColor(this.normalColor);
							this.sleep(750).then(() => {
								var sum = well.digit.n + opponentsWell.digit.n;
								well.updateColor(this.actionColor);
								well.digit.draw(0);
								opponentsWell.updateColor(this.actionColor);
								opponentsWell.digit.draw(0);
								this.sleep(750).then(() => {
									well.updateColor(this.normalColor);
									opponentsWell.updateColor(this.normalColor);
									var chest = this.player1Chest;
									chest.updateColor(this.actionColor);
									chest.digit.draw(chest.digit.n + sum);
									this.sleep(750).then(() => {
										chest.updateColor(this.normalColor);
										this.turn = 2;
										this.checkFinish();
									})
								});
							});
						});
					}
					
					else if(beans == 1 && well.digit.n % 2 == 0 && this.turn == 2) {
						this.sleep(750).then(() => {
							well.updateColor(this.normalColor);
							this.sleep(750).then(() => {
								var sum = well.digit.n;
								well.updateColor(this.actionColor);
								well.digit.draw(0);
								this.sleep(750).then(() => {
									well.updateColor(this.normalColor);
									opponentsWell.updateColor(this.normalColor);
									var chest = this.player2Chest;
									chest.updateColor(this.actionColor);
									chest.digit.draw(chest.digit.n + sum);
									this.sleep(750).then(() => {
										chest.updateColor(this.normalColor);
										this.turn = 1;
										this.checkFinish();
									})
								});
							});
						});
					}
					
					else {
						this.sleep(750).then(() => {
							well.updateColor(this.normalColor);
							this.distribute(1, beans - 1, wellNumber + 1);
						});
					}
				}
				
				else if(this.turn == player) {
					var chest = this.player1Chest;
					chest.updateColor(this.actionColor);
					chest.digit.draw(chest.digit.n + 1);
					
					if(beans == 1) {
						this.sleep(750).then(() => {
							chest.updateColor(this.normalColor);
							this.checkFinish();
						});
					}
					
					else {
						this.sleep(750).then(() => {
							chest.updateColor(this.normalColor);
							this.distribute(2, beans - 1, 5);
						});
					}
				}
				
				else {
					this.distribute(2, beans, 5);
				}
			}
			
			else if(player == 2) {
				if(wellNumber >= 0) {
					var well = this.player2Wells[wellNumber];
					well.updateColor(this.actionColor);
					well.digit.draw(well.digit.n + 1);
					
					var opponentsWell = this.player1Wells[wellNumber];
					if(beans == 1 && well.digit.n == 1 && opponentsWell.digit.n != 0 && this.turn == 2) {
						this.sleep(750).then(() => {
							well.updateColor(this.normalColor);
							this.sleep(750).then(() => {
								var sum = well.digit.n + opponentsWell.digit.n;
								well.updateColor(this.actionColor);
								well.digit.draw(0);
								opponentsWell.updateColor(this.actionColor);
								opponentsWell.digit.draw(0);
								this.sleep(750).then(() => {
									well.updateColor(this.normalColor);
									opponentsWell.updateColor(this.normalColor);
									var chest = this.player2Chest;
									chest.updateColor(this.actionColor);
									chest.digit.draw(chest.digit.n + sum);
									this.sleep(750).then(() => {
										chest.updateColor(this.normalColor);
										this.turn = 1;
										this.checkFinish();
									})
								});
							});
						});
					}
					
					else if(beans == 1 && well.digit.n % 2 == 0 && this.turn == 1) {
						this.sleep(750).then(() => {
							well.updateColor(this.normalColor);
							this.sleep(750).then(() => {
								var sum = well.digit.n;
								well.updateColor(this.actionColor);
								well.digit.draw(0);
								this.sleep(750).then(() => {
									well.updateColor(this.normalColor);
									opponentsWell.updateColor(this.normalColor);
									var chest = this.player1Chest;
									chest.updateColor(this.actionColor);
									chest.digit.draw(chest.digit.n + sum);
									this.sleep(750).then(() => {
										chest.updateColor(this.normalColor);
										this.turn = 2;
										this.checkFinish();
									})
								});
							});
						});
					}
					
					else {
						this.sleep(750).then(() => {
							well.updateColor(this.normalColor);
							this.distribute(2, beans - 1, wellNumber - 1);
						});
					}
				}
				
				else if(player == this.turn) {
					var chest = this.player2Chest;
					chest.updateColor(this.actionColor);
					chest.digit.draw(chest.digit.n + 1);
					
					if(beans == 1) {
						this.sleep(750).then(() => {
							chest.updateColor(this.normalColor);
							this.checkFinish();
						});
					}
					
					else {
						this.sleep(750).then(() => {
							chest.updateColor(this.normalColor);
							this.distribute(1, beans - 1, 0);
						});
					}
				}
				
				else {
					this.distribute(1, beans, 0);
				}
			}
		}
		
		else {
			if(this.turn == 1) {
				this.turn = 2;
			}
			
			else if(this.turn == 2) {
				this.turn = 1;
			}
			
			this.checkFinish();
		}
	}
	
	checkFinish() {
		var is1Finished = this.player1Wells.filter(w => w.digit.n == 0).length == 6;
		var is2Finished = this.player2Wells.filter(w => w.digit.n == 0).length == 6;
		if(is1Finished) {
			this.sleep(750).then(() => {
				var sum = 0;
				for(var i = 0; i < this.player2Wells.length; i++) {
					var well = this.player2Wells[i];
					if(well.digit.n != 0) {
						sum += well.digit.n;
						well.digit.draw(0);
						well.updateColor(this.actionColor);
					}
				}
				
				this.sleep(750).then(() => {
					for(var i = 0; i < this.player2Wells.length; i++) {
						var well = this.player2Wells[i];
						well.updateColor(this.normalColor);
					}
					
					var chest = this.player1Chest;
					chest.updateColor(this.actionColor);
					chest.digit.draw(chest.digit.n + sum);
					this.sleep(750).then(() => {
						chest.updateColor(this.normalColor);
						if(this.player1Chest.digit.n == this.player2Chest.digit.n) {
							this.center.draw('DRAW');
						}
						
						else if(this.player1Chest.digit.n > this.player2Chest.digit.n) {
							this.center.draw('YOU HAVE WON');
						}
						
						else if(this.player1Chest.digit.n < this.player2Chest.digit.n) {
							this.center.draw('YOU HAVE LOST');
						}
					});
				});
			});
		}
		
		else if(is2Finished) {
			this.sleep(750).then(() => {
				var sum = 0;
				for(var i = 0; i < this.player1Wells.length; i++) {
					var well = this.player1Wells[i];
					if(well.digit.n != 0) {
						sum += well.digit.n;
						well.digit.draw(0);
						well.updateColor(this.actionColor);
					}
				}
				
				this.sleep(750).then(() => {
					for(var i = 0; i < this.player1Wells.length; i++) {
						var well = this.player1Wells[i];
						well.updateColor(this.normalColor);
					}
					
					var chest = this.player2Chest;
					chest.updateColor(this.actionColor);
					chest.digit.draw(chest.digit.n + sum);
					this.sleep(750).then(() => {
						chest.updateColor(this.normalColor);
						if(this.player1Chest.digit.n == this.player2Chest.digit.n) {
							this.center.draw('DRAW');
						}
						
						else if(this.player1Chest.digit.n > this.player2Chest.digit.n) {
							this.center.draw('YOU HAVE WON');
						}
						
						else if(this.player1Chest.digit.n < this.player2Chest.digit.n) {
							this.center.draw('YOU HAVE LOST');
						}
					});
				});
			});
		}
		
		else if(this.turn == 1) {
			this.center.draw('YOUR TURN');
			this.lock = true;
		}
		
		else if(this.turn == 2) {
			this.center.draw('WAIT');
		}
	}
	
	sleep(time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}
	
	draw() {
		for(var i = 0; i < this.width / 7; i++) {
			for(var j = 0; j < this.height / 7; j++) {
				new Point(this.context, i, j, 'black').draw();
			}
		}
		
		for(var i = 0; i < 6; i++) {
			var well = new Box(this.context, 14 + (this.wellWidth + 4) * i, 5, this.wellWidth, this.wellHeight, 4, this.normalColor);
			well.draw();
			this.player2Wells.push(well);
		}
		
		for(var i = 0; i < 6; i++) {
			var well = new Box(this.context, 14 + (this.wellWidth + 4) * i, 5 +  (this.wellHeight + this.chestHeight + 8), this.wellWidth, this.wellHeight, 4, this.normalColor);
			well.draw();
			this.player1Wells.push(well);
		}
		
		this.player2Chest = new Box(this.context, 14, 5 + (this.wellHeight + 4), this.chestWidth, this.chestHeight, 0, this.normalColor);
		this.player2Chest.draw();
		
		this.player1Chest = new Box(this.context, 14 + (this.wellWidth + 4) * 5, 5 + (this.wellHeight + 4), this.chestWidth, this.chestHeight, 0, this.normalColor);
		this.player1Chest.draw();
		
		this.center = new Center(this.context, 14 + this.chestWidth + 4, this.wellWidth + 9, this.centerWidth, this.centerHeight, this.normalColor);
		if(this.turn == 1) {
			this.center.draw('YOUR TURN');
		}
		
		else if(this.turn == 2) {
			this.center.draw('WAIT');
		}
	}
}

class Center {
	constructor(context, width, height, widthOffset, heightOffset, color) {
		this.context = context;
		this.width = width;
		this.height = height;
		this.widthOffset = widthOffset;
		this.heightOffset = heightOffset;
		this.color = color;
	}
	
	clear() {
		if(this.digit) {
			this.digit.clear();
		}
	}
	
	draw(o) {
		this.clear();
		this.digit = new Digit(this.context, this.width - 1, this.height + Math.floor(this.heightOffset / 2), this.widthOffset, this.color);
		this.digit.draw(o);
	}
	
}

class Box {
	constructor(context, width, height, widthOffset, heightOffset, n, color) {
		this.context = context;
		this.width = width;
		this.height = height;
		this.widthOffset = widthOffset;
		this.heightOffset = heightOffset;
		this.round = 3;
		this.color = color;
		this.digit = new Digit(this.context, this.width, this.height + Math.floor((this.heightOffset - 4) / 2), this.widthOffset, this.color);
		this.digit.draw(n);
		this.points = [];
	}
	
	draw() {
		for(var i = this.round; i < this.widthOffset - this.round + 1; i++) {
			var point = new Point(this.context, this.width + i, this.height, this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = this.round; i < this.heightOffset - this.round + 1; i++) {
			var point = new Point(this.context, this.width, this.height + i, this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = this.round; i < this.widthOffset - this.round + 1; i++) {
			var point = new Point(this.context, this.width + i, this.height + this.heightOffset, this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = this.round; i < this.heightOffset - this.round + 1; i++) {
			var point = new Point(this.context, this.width + this.widthOffset, this.height + i, this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = 0; i < this.round; i++){
			var point = new Point(this.context, this.width + this.round - i - 1, this.height + i + 1 , this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = 0; i < this.round; i++){
			var point = new Point(this.context, this.width + this.widthOffset - this.round + i + 1, this.height + i + 1, this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = 0; i < this.round; i++){
			var point = new Point(this.context, this.width + i + 1, this.height + this.heightOffset - this.round + i + 1, this.color);
			point.draw();
			this.points.push(point);
		}
		
		for(var i = 0; i < this.round; i++){
			var point = new Point(this.context, this.width + this.widthOffset - i - 1, this.height + this.heightOffset - this.round + i + 1, this.color);
			point.draw();
			this.points.push(point);
		}
	}
	
	updateColor(color) {
		this.color = color;
		this.points.forEach(p => {
			p.color = color;
			p.draw();
		});
		
		this.digit.update(color);
	}

}

class Digit {
	constructor(context, width, height, widthOffset, color) {
		this.context = context;
		this.width = width;
		this.height = height;
		this.widthOffset = widthOffset;
		this.color = color;
		this.points = [];
	}
	
	update(color) {
		this.color = color;
		this.points.forEach(p => {
			p.color = color;
			p.draw();
		});
	}
	
	clear() {
		this.points.forEach(p => {
			p.clear();
		});
		this.points = [];
	}
	
	drawHelper(n, offset) {
		if(n == ' ') {
			
		}
		
		else if(n == '-') {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == '\'') {
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == ':') {
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == '_') {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
	    else if(n == 0) {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + offset, this.height + i, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + 4 + offset, this.height + i, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 1) {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + 2 + offset, this.height + i, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 2) {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 3) {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 4) {
			for(var i = 2; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 5) {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 6) {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 7) {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 8) {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 9) {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'A') {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'B') {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'C') {
			for(var i = 1; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'D') {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'E') {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 3; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'F') {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 3; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'G') {
			for(var i = 1; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 2; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'H') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'I') {
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'J') {
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'K') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 3; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'L') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'M') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 2; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 3; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'N') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 2; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 3; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'O') {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'P') {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'Q') {
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 3; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'R') {
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'S') {
			for(var i = 1; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'T') {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'U') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 1; i < 4; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'V') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'W') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 2; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 3; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'X') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'Y') {
			{
				var point = new Point(this.context, this.width + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 4 + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
		
		else if(n == 'Z') {
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 3 + offset, this.height + 1, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 2 + offset, this.height + 2, this.color);
				point.draw();
				this.points.push(point);
			}
			
			{
				var point = new Point(this.context, this.width + 1 + offset, this.height + 3, this.color);
				point.draw();
				this.points.push(point);
			}
			
			for(var i = 0; i < 5; i++) {
				var point = new Point(this.context, this.width + i + offset, this.height + 4, this.color);
				point.draw();
				this.points.push(point);
			}
		}
	}
	
	draw(n) {
		this.clear();
		this.n = n;
		var m = n.toString();
		var offset = Math.ceil((this.widthOffset - (m.length * 5) - (m.length - 1)) / 2);
		for(var i = 0; i < m.length; i++) {
			this.drawHelper(m[i], offset + i * 6);
		}
	}
}

class Point {
	constructor(context, width, height, color) {
		this.context = context;
		this.width = width;
		this.height = height;
		this.color = color;
	}
	
	clear() {
		this.context.clearRect(7 * this.width, 7 * this.height, 6.9, 6.9);
		this.context.fillStyle = 'black';
		this.context.fillRect(7 * this.width, 7 * this.height, 6.9, 6.9);
	}
	
	draw() {
		this.context.clearRect(7 * this.width, 7 * this.height, 6.9, 6.9);
		this.context.fillStyle = this.color;
		this.context.fillRect(7 * this.width, 7 * this.height, 6.9, 6.9);
	}
}

var mangalaGame = new MangalaGame();
var introGame = new IntroGame();
window.onload = () => introGame.init();