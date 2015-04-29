/**
 * Class responsible for rendering tips in the canvas.
 */

Vex.UI.TipRenderer = function(canvas){
	this.canvas = canvas;
	this.color = null;
	this.fontSize = null;
	this.fontName = null;
	this.style = null;
	this.context = null;
	this.lineWidth = null;
	this.textAlign = null;
	this.textBaseline = null;
	this.boundingBox= null;
	this.showingTip = null;
	this.backgroundColor = null;
};

Vex.UI.TipRenderer.prototype.init = function(){
	this.textAlign='left';
	this.textBaseline = 'middle';
	this.color = 'black';
	this.fontName = 'Calibri';
	this.lineWidth = 1;
	this.style = 'normal';
	this.fontSize = 10;
	this.boundingBox = {x:0,y:0,width:200,height:20};
	this.context = this.canvas.getContext('2d');
	this.showingTip = false;
	this.backgroundColor = 'white';
};


Vex.UI.TipRenderer.prototype.showTip = function(tip){
	
	if(this.showingTip)
		this.hideTip();
	
	var font = this.style + ' ' + this.fontSize + 'pt ' + this.fontName;
	
	this.context.font = font;
	this.context.fillStyle = this.color;
	this.context.textAlign = this.textAlign;
	this.context.lineWidth = this.lineWidth;
	this.context.textBaseline = this.textBaseline;
	this.context.fillText(tip, this.boundingBox.x, this.boundingBox.y);
	this.showingTip=true;
};


//TOOD needed to add this absolute (-5 and +10) values to be able to fully erase the written tip. FIX!
Vex.UI.TipRenderer.prototype.hideTip = function(){
	
	this.context.beginPath();
	this.context.rect(this.boundingBox.x, this.boundingBox.y - 5, this.boundingBox.width, this.boundingBox.height + 10);
	this.context.fillStyle = this.backgroundColor;
	this.context.fill();
	
	this.showingTip = false;
};