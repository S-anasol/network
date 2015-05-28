var Victor = require('victor');

var TICK_TIME = 1000/100;
var BULLET_LIFETIME = TICK_TIME*150;
var REQUESTS_MAX = 3;
var SCREEN_WIDTH = 100;
var SCREEN_HEIGHT = 100;

var chunks_length = 10;
var WORLD_WIDTH = SCREEN_WIDTH*chunks_length;
var WORLD_HEIGHT = SCREEN_HEIGHT*(chunks_length/2);

var chunks = []

for(i=1;i<=chunks_length/2;i++)
{
	var x1 = (i-1)*SCREEN_WIDTH;
	var x2 = i*SCREEN_WIDTH;
	
	for(z=1;z<=chunks_length;z++)
	{
		var y1 = (z-1)*SCREEN_HEIGHT;
		var y2 = z*SCREEN_HEIGHT;
		var chunk = {
			x1:x1,
			x2:x2,
			y1:y1,
			y2:y2
		};
		var chunk_id = ''+i+z;
		console.log('generating chunk',chunk_id,chunk);
		chunks[chunk_id] = chunk;
	}
}

for(id in chunks)
{
	console.log(id,chunks[id]);
}

var MAX_SPEED = 4;
var REQUEST_MIN_TIME = 1000;
var actorId = 1;
var bulletId = 1;

var Actor = function(id) {
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.chunk = 0;
	this.score = 0;
	this.speed = {x:0, y:0};
	this.direction = {left:false, right: false, up: false, down: false};
	this.active = false;
}

var Bullet = function(id) {
	this.id = id;
	this.bt = 0;
	this.x = 0;
	this.y = 0;
	this.chunk = 0;
	this.speed = {x:0, y:0};
	this.active = false;
}

Actor.prototype.die = function(killer) {
	console.log(this.id+'killed by '+killer); 
	this.x = Math.random() * WORLD_WIDTH; 
	this.y = Math.random() * WORLD_HEIGHT + 20;
}

Actor.prototype.kill = function(enemy) {
	console.log(this.id+' kills '+enemy);
	this.score++; 
	//console.log('score '.this.score);
	//console.log(this.score);
}

Actor.prototype.update = function(dt) {
	
	if(this.direction.left)
	{
		this.x = this.x-1;
	}
	
	if(this.direction.up)
	{
		this.y = this.y-1;
	}
	
	if(this.direction.right)
	{
		this.x = this.x+1;
	}
	
	if(this.direction.down)
	{
		this.y = this.y+1;
	}
	
	
	if(this.x < 0) {
		this.x = WORLD_WIDTH;
	}
	if(this.y < 0) {
		this.y = WORLD_HEIGHT;
	}
	
	if(this.x > WORLD_WIDTH) {
		this.x = 0;
	}
	if(this.y > WORLD_HEIGHT) {
		this.y = 0;
	}
	
	var i = Math.ceil(this.x/100);
	var z = Math.ceil(this.y/100);
	this.chunk = ''+i+z;
}

Bullet.prototype.update = function(dt) {
	
	//this.x = this.x + this.t_x * dt;
	//this.y = this.y + this.t_y * dt;
	
	var acceleration = new Victor(this.target.distanceX(this.position) / 50, this.target.distanceY(this.position) / 50);
	
	this.velocity
	.add(acceleration)
	.limit(3, 0.6);
	
	
	var correction = new Victor(0.8,0.8);
	
	this.velocity.multiply(correction);
	
	this.position.add(this.velocity);
	
	this.x = this.position.x;
	this.y = this.position.y;
	
	if(+new Date() > this.bt+BULLET_LIFETIME)
	{
		game.destroyBullet(this.id);
	}
}

var Game=function() {
	this.actors = {};
	this.bullets = {};
}

var regular_grid = {};

Game.prototype.update = function(dt) {
	if(!this.active) {
		return;
	}
	
	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.update(dt);
	}
	
	for(var id in this.bullets) {
		var bullet = this.bullets[id];
		bullet.update(dt);
	}
	
	for (i in this.bullets) 
	{
		//console.log('bullet '+i);
		for (j in this.actors) 
		{
			//console.log('actor '+j);
			//if(typeof this.actors[j] != "undefined" && typeof this.bullets[j] != "undefined")
			var actor = {radius: 10, x: this.actors[j].x, y: this.actors[j].y};
			var bullet = {radius: 2, x: this.bullets[i].x, y: this.bullets[i].y};
			
			var dx = actor.x - bullet.x;
			var dy = actor.y - bullet.y;
			var distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < actor.radius + bullet.radius) {
				if(this.bullets[i].actorId != j)
				{
					console.log('collision actor: '+j+' and bullet '+i);
					this.actors[j].die(this.bullets[i].actorId);
					this.actors[this.bullets[i].actorId].kill(j);
				}
			}
		}
	}
}

Game.prototype.spawnActor = function(actor) {
	actor.game = this;
	this.actors[actor.id] = actor;
	
	console.log('spawn score', actor.score);
}

Game.prototype.spawnBullet = function(bullet) {
	bullet.game = this;
	this.bullets[bullet.id] = bullet;
}

Game.prototype.destroyActor = function(id) {
	console.log("DestroyActor: "+id);
	delete this.actors[id];
}

Game.prototype.destroyBullet = function(id) {
	console.log("destroyBullet: "+id);
	delete this.bullets[id];
}

Game.prototype.gameInfo = function() {
	var result = {};
	for(var id in this.actors) {
		var actor = this.actors[id];
		result[id] = {x:actor.x, y:actor.y, score:actor.score};
	}
	
	var bullets = {};
	for(var id in this.bullets) {
		var bullet = this.bullets[id];
		bullets[id] = {x:bullet.x, y:bullet.y, target:bullet.target, actorId:bullet.actorId};
	}
	
	result = {actors:result,bullets:bullets,map:chunks,world:[WORLD_WIDTH, WORLD_HEIGHT]};
	return result;
}

var Client = function(socket) {
	this.date = new Date();
	this.counter = 0;
	this.socket = socket;
	var a = new Actor(actorId++);
	a.x = Math.random() * WORLD_WIDTH;
	a.y = Math.random() * WORLD_HEIGHT + 20;
	a.speed.x = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	a.speed.y = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	a.direction = {left:false, right: false, up: false, down: false};
	a.score = 0;
	console.log('start score', a.score);
	game.spawnActor(a);
	this.actor = a;
	//console.log(this.actor);
	socket.emit('actorId', a.id);
}

Client.prototype.onDisconnect = function() {
	game.destroyActor(this.actor.id);
}

Client.prototype.onShoot = function(pos) {
	var a = new Bullet(bulletId++);
	a.bt = +new Date();
	a.x = this.actor.x;
	a.y = this.actor.y;
	
	a.position = new Victor(a.x,a.y);
	a.velocity = new Victor(0, 0);
	//a.target = new Victor(400, 200);
	
	//x_diff = (pos.x - a.x)*0.01;
	//y_diff = (pos.y - a.y)*0.01;
	
	a.target = new Victor(pos.x, pos.y);
	
	//a.t_x = x_diff;
	//a.t_y = y_diff;
	a.actorId = this.actor.id;
	a.speed.x = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	a.speed.y = (MAX_SPEED - Math.random() * MAX_SPEED * 2)*0.1;
	
	game.spawnBullet(a);
	
	//console.log(a);
	//this.actor = a;
}

Client.prototype.onMove = function(side,enabled) {
	switch(side)
	{
		case 37: //left
		case 65: //left
		this.actor.direction.left = enabled;
		break;
		
		case 38: // up
		case 87: // up
		this.actor.direction.up = enabled;
		break;
		
		case 39: // right
		case 68: // right
		this.actor.direction.right = enabled;
		break;
		
		case 40: // down
		case 83: // down
		this.actor.direction.down = enabled;
		break;
	}
}

Client.prototype.onMessage = function(msg) {
	this.counter = 0;
	this.socket.send("hi");
}

Client.prototype.update = function(gameInfo) {
	var now = new Date();
	if(this.counter < REQUESTS_MAX || (now.getTime() - this.date.getTime()) > REQUEST_MIN_TIME) {
		this.counter ++;
		this.date = now;
		this.socket.emit('gameInfo', gameInfo);
	}
}

var game = new Game();

var io = require('socket.io').listen(9090);
var clients = [];

io.sockets.on('connection', function (socket) {
	var client = new Client(socket);
	clients.push(client);
	game.active = clients.length != 0;
	
	socket.on('message', function (msg) { 
		client.onMessage(msg);
	});
	
	socket.on('input', function (pos) { 
		client.onShoot(pos);
	});
	
	socket.on('move', function (side, enabled) { 
		client.onMove(side, enabled);
	});
	
	socket.on('disconnect', function () {		
		var index = clients.indexOf(client);
		if(index != -1) {
			clients.splice(index);
		}
		game.active = clients.length != 0;
		client.onDisconnect();
	});
});

console.log("Server started..");

setInterval(function() {
	if(!game.active) {
		return;
	}
	game.update(TICK_TIME);
	var gameInfo = game.gameInfo();
	for(var i=0;i<clients.length;i++) {
		var client = clients[i];
		client.update(gameInfo);
	}
}, TICK_TIME);
