var TICK_TIME = 1000/60;

var Game=function() {
	this.actors = {};
	this.bullets = {};
	this.active = false;
}

Game.prototype.rand = function(min, max){return Math.floor(Math.random() * (max - min + 1)) + min;}
var audio_queue = {};
Game.prototype.play = function(sound, queue){
	console.log(typeof queue);
	console.log('playing '+sound);
	var audio = new Audio(sound+'.mp3');
	audio.play();
};

Game.prototype.update = function(dt) {
	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.myActor = (network.actorId == id);
		actor.update(dt);
	}
	for(var id in this.bullets) {
		var bullet = this.bullets[id];
		bullet.myBullet = (network.actorId == bullet.actorId);
		bullet.update(dt);
	}
}

Game.prototype.render = function(ctx) {
	gctx.fillStyle = "rgb(100, 120, 100)";
	gctx.fillRect(0, 0, 1000, 500);
	gctx.font = "20px Arial";
	gctx.fillStyle = "rgb(0, 0, 0)";
	gctx.fillText(network.pingTime+"ms", 10, 30);

	for(var id in this.actors) {
		var actor = this.actors[id];
		actor.render(gctx);
	}
	
	for(var id in this.bullets) {
		var bullet = this.bullets[id];
		bullet.render(gctx);
	}
}

Game.prototype.spawnActor = function(actor) {
	actor.game = this;
	this.actors[actor.id] = actor;
}


Game.prototype.spawnBullet = function(bullet) {
	bullet.game = this;
	this.bullets[bullet.id] = bullet;
}

Game.prototype.destroyActor = function(id) {
	delete this.actors[id];
}

Game.prototype.destroyBullet = function(id) {
	delete this.bullets[id];
}

Game.prototype.input = function(pos) {
	network.sendInput(pos);
}

Game.prototype.move = function(side, enabled) {
	network.sendMove(side,enabled);
}

Game.prototype.networkUpdate = function(data) {
	var actorData = data.actors;
	for(var id in actorData) {
		var actor = this.actors[id];
		if(actor === undefined) {
			actor = new Actor(id);
			this.spawnActor(actor);
		}
		var val = actorData[id];
		actor.x = val.x;
		actor.y = val.y;
		actor.score = val.score;
	}

	var destroyedActors = {};
	for(var id in this.actors) {
		if(actorData[id] == null) {
			destroyedActors[id] = id;
		}
	}

	for(var id in destroyedActors) {
		this.destroyActor(id);
	}
	
	var bulletData = data.bullets;
	for(var id in bulletData) {
		var bullet = this.bullets[id];
		if(bullet === undefined) {
			bullet = new Bullet(id);
			this.spawnBullet(bullet);
			game.play('pew');
		}
		var val = bulletData[id];
		bullet.x = val.x;
		bullet.y = val.y;
		bullet.target = val.target;
		bullet.actorId = val.actorId;
	}
	
	var destroyedBullets = {};
	for(var id in this.bullets) {
		if(bulletData[id] == null) {
			destroyedBullets[id] = id;
		}
	}

	for(var id in destroyedBullets) {
		this.destroyBullet(id);
		game.play('211977_71257-lq');
	}
}

var game = new Game();

setInterval(function() {
	if(!game.active) {
		return;
	}
	game.update(TICK_TIME);
	game.render();
	network.update();	
}, TICK_TIME);