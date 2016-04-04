
//TODO FIX Issue for CHORDS -> The index is not being set correctly
Vex.UI.NoteMenu = function (handler, canvas, ctx){
	this.handler = handler;
	this.canvas = canvas;
	this.ctx = ctx;
	this.note=null;
	this.keyIndex = null;
	this.panelProps = null;
	this.buttons = [];
	this.accidentals = ['doubleFlat', 'flat', 'natural', 'sharp', 'doubleSharp'];
	this.canRender = false;
	this.currentButton = null;
	this.buttonRenderer = new Vex.UI.NoteMenuButtonRenderer();
};

Vex.UI.NoteMenu.prototype.init = function(){
	//Nothing to do at this moment
	
};

Vex.UI.NoteMenu.prototype.setTipArea = function() {
	var leftPadding = 5;
	var rightPadding = 5;
	var bottomPadding = 5;
	var fontSize = 10;//in pixels
	
	
	//Getting the dimensions of the bounding box
	var _x = this.panelProps.x + leftPadding; //5 pixels right of the beginning of the panel
	var _y = this.panelProps.bottomY - bottomPadding - fontSize; //15 pixels before the end of the panel (vertically)
	var _width = this.panelProps.width - leftPadding - rightPadding;
	var _height = fontSize - bottomPadding;
	
	this.handler.tipRenderer.boundingBox = {x: _x, y: _y, width: _width, height: _height};
	this.handler.tipRenderer.backgroundColor = this.panelProps.backgroundColor;
};

Vex.UI.NoteMenu.prototype.open = function(mousePos){
	
	this.panelProps = this.drawMenuPanel(mousePos);
	this.buttonRenderer.panel = this.panelProps;
	this.buttonRenderer.context = this.ctx;

	if(this.buttonRenderer.ready){
		this.drawButtons();
		this.canvas.addEventListener('mouseup', this, false);
		this.canvas.addEventListener('mousemove', this, false);
		this.canvas.addEventListener('contextmenu', this, false);
		this.setTipArea();	
	}
	
	
};

Vex.UI.NoteMenu.prototype.close = function(){
	this.buttons = [];
	this.currentButton = null;
	this.canvas.removeEventListener('mouseup', this, false);
	this.canvas.removeEventListener('mousemove', this, false);
	this.canvas.removeEventListener('contextmenu', this, false);
	//Notify the handler that the panel was closed, so that the usual behavior can resume
	this.handler.noteMenuClosed();
};


Vex.UI.NoteMenu.prototype.handleEvent = function(evt){
	evt.preventDefault();
	switch(evt.type) {
		case "mouseup":
			this.handleMouseClick(evt);
			break;
		case "mousemove":
			this.handleMouseMove(evt);
			break;
	}
};

Vex.UI.NoteMenu.prototype.setNote = function(note){
	this.note=note;
};

Vex.UI.NoteMenu.prototype.setKeyIndex = function(index){
	this.keyIndex=index;
};


/**
 * Draws the panel that will hold the buttons for modifying the note key.
 * @param mousePos
 * @returns a properties object of the panel.
 */
Vex.UI.NoteMenu.prototype.drawMenuPanel = function(mousePos) {
	var canvas = this.canvas;
	var panelWidth = 200;
	var panelHeight = 100;
	var panelX = mousePos.x + 30; // 30 - chosen offset
	var panelY = mousePos.y;
	var panelPosition = 'right'; //relative to the key
	
	//Check if the panel fits in X Axis
	if(panelX + panelWidth > canvas.width){
		//Reposition panel X to fit canvas - repositioning it to be 30 pixels left from key
		panelX = mousePos.x - panelWidth - 30; //30 - chosen offset
		
		panelPosition = 'left';
	}
	
	//Check if the panel fits in Y Axis
	if(panelY + panelHeight > canvas.height){
		//Reposition panel Y to fit canvas
		panelY = canvas.height - panelHeight - 10; //10 - chosen offset
	}
	
	//Draw the Panel.
	var context = this.ctx;

    context.beginPath();
    context.rect(panelX, panelY, panelWidth, panelHeight);
    context.fillStyle = '#ddc';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'black';
    context.stroke();
    
    
    //Draw a line to link the panel to the key
    context.beginPath();
    context.moveTo(mousePos.x, mousePos.y);
    if(panelPosition == 'right')
    	context.lineTo(panelX, panelY);
    else
    	context.lineTo(panelX + panelWidth, panelY);
    context.stroke();
    
    return {
    	width: panelWidth,
    	height: panelHeight,
    	x: panelX,
    	y: panelY,
    	rightX: panelX + panelWidth,
    	bottomY: panelY + panelHeight,
    	backgroundColor: '#ddc',
    	position: panelPosition
    };
};


Vex.UI.NoteMenu.prototype.drawButtons = function(){
	
	//Close button
	this.buttons.push(this.buttonRenderer.closeButton());
	
	//Accidentals buttons
	for(var i = 0; i < this.accidentals.length; i++){
		this.buttons.push(this.buttonRenderer.accidentalButton(i));
	}
	
	//Dot button
	this.buttons.push(this.buttonRenderer.dotButton());
	
	//Beam button
	this.buttons.push(this.buttonRenderer.beamButton());

	//Tie button
	this.buttons.push(this.buttonRenderer.tieButton());
	
	//Delete button
	this.buttons.push(this.buttonRenderer.deleteButton());
	
	
	
};


Vex.UI.NoteMenu.prototype.handleMouseClick = function(evt){
	if(evt.which == 1){//Left Button
		//get mouse position
		var mousePos = getMousePositionInCanvas(this.canvas, evt);
		
		//if clicked in one of the buttons, then call the action for that button
		for(var i = 0; i<this.buttons.length; i++){
			var button = this.buttons[i];
			if(isCursorWithinRectangle(button.props.x, button.props.y, button.props.width, button.props.height, mousePos.x, mousePos.y)){
				//call button action.

				button.callAction(this);

				
				break;
			}
		}		
	}
};

Vex.UI.NoteMenu.prototype.handleMouseMove = function(evt){
	//get mouse position
	var mousePos = getMousePositionInCanvas(this.canvas, evt);
	
	
	for(var i = 0; i<this.buttons.length; i++){
		button =  this.buttons[i];
		
		if(isCursorWithinRectangle(button.props.x, button.props.y, button.props.width, button.props.height, mousePos.x, mousePos.y)){
			//cursor is in this button
			//check if already current button
			if(this.currentButton == null || this.currentButton != button){
				
				//It isnt! change the current button to normal, and highlight the new button
				
				if(this.currentButton !=null)
					this.currentButton.highlight(this.canvas, null);
				
				//Highlight new button
				
				this.currentButton = button;
				//highlight the button
				this.currentButton.highlight(this.canvas, 'yellow');
				this.handler.tipRenderer.showTip(this.currentButton.props.tip);
				
			}
			
			
			break;
				
		} else {
			//it isnt in this button, make sure it isnt highlighted
			button.highlight(this.canvas, null);
		}
		
	}

};

Vex.UI.NoteMenu.prototype.addDoubleFlat = function(){
	this.handler.addAccidentalToNote("bb", this.note, this.keyIndex);
	this.close();
};

Vex.UI.NoteMenu.prototype.addFlat = function(){
	this.handler.addAccidentalToNote("b", this.note, this.keyIndex);
	this.close();
};

Vex.UI.NoteMenu.prototype.addNatural = function(){
	this.handler.addAccidentalToNote("n", this.note, this.keyIndex);
	this.close();
};

Vex.UI.NoteMenu.prototype.addSharp = function(){
	this.handler.addAccidentalToNote("#", this.note, this.keyIndex);
	this.close();
};

Vex.UI.NoteMenu.prototype.addDoubleSharp = function(){
	this.handler.addAccidentalToNote("##", this.note, this.keyIndex);
	this.close();
};

Vex.UI.NoteMenu.prototype.addDot = function(){
	this.handler.addDotToNote(this.note);
	this.close();
};


Vex.UI.NoteMenu.prototype.addBeam = function(){
	this.handler.beamWithNextNote(this.note);
	this.close();
};


Vex.UI.NoteMenu.prototype.deleteNote = function(){
	this.handler.deleteNote(this.note);
	this.close();
}