/**
 * Class representing a button.
 */

Vex.UI.Button = function(props){
	this.props = props;
};


Vex.UI.Button.prototype.highlight = function (canvas, color){
		//If color == null remove highlight
		if(color==null)
			color = button.props.backgroundColor;
		var lineWidth = 4;
		var context = canvas.getContext('2d');
		context.beginPath();
		context.lineWidth = lineWidth;
		context.rect(button.props.x, button.props.y, button.props.width, button.props.height);
		context.strokeStyle = color;
		context.stroke();
};

//TODO Implement showTip
Vex.UI.Button.prototype.showTip = function () {
	
};

Vex.UI.Button.prototype.callAction = function (object) {
	object[this.props.action]();
};