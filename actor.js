var Actor = function(id) {
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.myActor = false;
	this.chunk = 0;
	this.score = 0;
}

Actor.prototype.update = function(dt) {
	/*this.x = this.x + this.speed.x * dt;
	this.y = this.y + this.speed.y * dt;

	if(this.x > SCREEN_WIDTH && this.speed.x > 0) {
		this.speed.x = -this.speed.x;
	} else if(this.x < 0 && this.speed.x < 0) {
		this.speed.x = -this.speed.x;
	}

	if(this.y > SCREEN_HEIGHT && this.speed.y > 0) {
		this.speed.y = -this.speed.y;
	} else if(this.y < 0 && this.speed.y < 0) {
		this.speed.y = -this.speed.y;
	}*/
}

Actor.prototype.render = function(ctx) {
	
	if(this.myActor) {
		ctx.beginPath();
		ctx.arc(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 50, 0, 2 * Math.PI);
		ctx.strokeStyle = "#fff";
		ctx.fillStyle = "#fff";
		ctx.stroke();
		ctx.fill();
		
		gctx.font = "50px Arial";
		gctx.fillStyle = "rgb(0, 0, 0)";
		gctx.fillText(""+this.score, SCREEN_WIDTH/2-15, SCREEN_HEIGHT/2+15);
		
		ctx.closePath();
	}
	ctx.beginPath();
	
	ctx.strokeStyle = "#000";
	ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
	ctx.stroke();
	gctx.font = "10px Arial";
	if(this.myActor) {
		gctx.fillStyle = "rgb(0, 255, 0)";
	} else {
		gctx.fillStyle = "rgb(255, 0, 0)";
	}
	gctx.fillText(""+this.id, this.x-7, this.y+2);
	
	gctx.fillText(""+Math.round(this.x), this.x-40, this.y+20);
	gctx.fillText(":"+Math.round(this.y), this.x-20, this.y+20);
	
	
}