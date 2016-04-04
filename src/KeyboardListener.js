/*
 * Vex.UI.KeyboardListener: this class is responsible for handling all keyboard events performed by the user within the canvas
 */

Vex.UI.KeyboardListener = function(handler, canvas, staveList) {
	this.handler = handler;
	this.canvas = canvas;
	this.staveList = staveList;
};

Vex.UI.KeyboardListener.prototype.handleEvent = function(evt){
	switch(evt.type) {
		case "keydown":
			this.handleKeyDown(evt);
			break;
	}
};

Vex.UI.KeyboardListener.prototype.startListening = function(){
	this.canvas.addEventListener('keydown', this, false);
};

Vex.UI.KeyboardListener.prototype.handleKeyDown = function(evt){
	var key = getKeyPressedInCanvas(canvas, evt);
	if (key == Vex.UI.KeyboardKey.NEW_NOTE){
		if(this.handler.currentNote == null){
			//Insert at end of Stave
			var newNote = new Vex.Flow.StaveNote({ keys: ['G/4','E/4','C/4','A/3'],color:['red','green'], duration: "4", noteType:"r" });
			//Add the note into the stave
			this.handler.currentStave.pushNote(newNote);
			//Redraw the stave
			this.handler.redraw();
		}
	}else if (key == Vex.UI.KeyboardKey.FLAT){
		this.handler.addAccidentalToNote("b", this.handler.currentNote);
		this.handler.redraw();
	}else if (key == Vex.UI.KeyboardKey.SHARP){
		this.handler.addAccidentalToNote("#", this.handler.currentNote);
		this.handler.redraw();
	}else if (key == Vex.UI.KeyboardKey.UP_KEY){
		var newNote = this.handler.currentNote.change("UP");
		this.handler.currentStave.replaceNote(this.handler.currentNote, newNote);
		this.handler.currentNote = newNote;
		this.handler.redraw();
	}else if (key == Vex.UI.KeyboardKey.DOWN_KEY){
		var newNote = this.handler.currentNote.change("DOWN");
		this.handler.currentStave.replaceNote(this.handler.currentNote, newNote);
		this.handler.currentNote = newNote;
		this.handler.redraw();
	}else if (key == Vex.UI.KeyboardKey.PAUSE){
		var newNote = this.handler.currentNote.change("PAUSE");
		this.handler.currentStave.replaceNote(this.handler.currentNote, newNote);
		this.handler.currentNote = newNote;
		this.handler.redraw();
	}
};
