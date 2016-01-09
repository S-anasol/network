var TICK_TIME = 1000/60;

var Game=function() {
	this.monsters = {};
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
	for(var id in this.monsters) {
		var monster = this.monsters[id];
		//actor.myActor = (network.actorId == id);
		monster.update(dt);
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
	
	for(var id in this.monsters) {
		var monster = this.monsters[id];
		monster.render(gctx);
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

Game.prototype.spawnMonster = function(monster) {
	monster.game = this;
	this.monsters[monster.id] = monster;
}


Game.prototype.spawnBullet = function(bullet) {
	bullet.game = this;
	this.bullets[bullet.id] = bullet;
}

Game.prototype.destroyActor = function(id) {
	delete this.actors[id];
}

Game.prototype.destroyMonster = function(id) {
	delete this.monsters[id];
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

function score_compare(a,b) {
  if (a.score < b.score)
    return 1;
  if (a.score > b.score)
    return -1;
  return 0;
}

Game.prototype.networkUpdate = function(data) {
	var actorData = data.actors;
	
	var top = [];
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
		actor.exp = val.exp;
		actor.lvl = val.lvl;
		
		top.push({id: id, score: val.score, exp: val.exp, lvl: val.lvl});
	}
	
	top.sort(score_compare).slice(0,10);
	
	var rating = '';
	for(i in top)
	{
		rating = rating+'<p>'+top[i].id+': '+top[i].score+'(E'+top[i].exp+'/L'+top[i].lvl+')</p>'
	}
	
	document.getElementById('rating').innerHTML = rating;
	
	var destroyedActors = {};
	for(var id in this.actors) {
		if(actorData[id] == null) {
			destroyedActors[id] = id;
		}
	}

	for(var id in destroyedActors) {
		this.destroyActor(id);
	}
	
	/*monsters*/
	
	var monsterData = data.monsters;
	for(var id in monsterData) {
		var monster = this.monsters[id];
		if(monster === undefined) {
			monster = new Monster(id);
			this.spawnMonster(monster);
		}
		var val = monsterData[id];
		monster.x = val.x;
		monster.y = val.y;
		monster.health = val.health;
	}
	
	var destroyedMonsters = {};
	for(var id in this.monsters) {
		if(monsterData[id] == null) {
			destroyedMonsters[id] = id;
		}
	}

	for(var id in destroyedMonsters) {
		this.destroyMonster(id);
	}
	
	
	
	/*bullets*/
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