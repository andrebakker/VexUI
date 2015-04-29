/*
 * Vex.UI.MouseListener: this class is responsible for handling all mouse events performed by the user within the canvas
 */

Vex.UI.MouseListener = function(handler, canvas, staveList) {
	this.handler = handler;
	this.canvas = canvas;
	this.staveList = staveList;
};


Vex.UI.MouseListener.prototype.handleEvent = function(evt){
	evt.preventDefault();
	switch(evt.type) {
		case "mouseup":
			this.handleMouseClick(evt);
			break;
		case "mousemove":
			this.handleMouseOver(evt);
			break;
		case "wheel":
			this.handleMouseWheel(evt);
			break;
		case "contextmenu":
			this.handleRightMouseClick(evt);
			break;
	}
};

Vex.UI.MouseListener.prototype.startListening = function(){
	this.canvas.addEventListener('mouseup', this, false);
	this.canvas.addEventListener('mousemove', this, false);
	this.canvas.addEventListener('wheel', this, false);
	this.canvas.addEventListener('contextmenu', this, false);
};

Vex.UI.MouseListener.prototype.stopListening = function(){
	this.canvas.removeEventListener('mouseup', this, false);
	this.canvas.removeEventListener('mousemove', this, false);
	this.canvas.removeEventListener('wheel', this, false);
	this.canvas.removeEventListener('contextmenu', this, false);
};

Vex.UI.MouseListener.prototype.handleMouseOver = function(evt){
	var mousePos = getMousePositionInCanvas(this.canvas, evt);
    this.handler.currentStave = findWhichStaveMouseOver(this.staveList, mousePos);
    this.handler.currentNote = findWhichNoteMouseOver(this.handler.currentStave, mousePos);
    this.handler.updateProvisoryKey(mousePos);
    //change color of currentNote
    if(this.handler.currentNote != null){
    	this.handler.currentNote.setHighlight(true);
    	this.handler.redraw();
    }
    
	//Private function
	function findWhichStaveMouseOver(staveList, mousePos){
		for(var i = 0; i < staveList.length; i++){
			var box = staveList[i].getBoundingBox();
			if(isCursorWithinRectangle(box.getX(), box.getY(), box.getW(), box.getH(), mousePos.x, mousePos.y))
				return staveList[i];
		}
		return null;
	}
	
	//Private function
	function findWhichNoteMouseOver(currentStave, mousePos){
		var noteList = [];
		if(currentStave != null)
			noteList = currentStave.getTickables();
		
		for(var i = 0; i < noteList.length; i++){
			//return to default color. Unnecessary if currentNote does not change color
			if(noteList[i].setHighlight !== undefined)
				noteList[i].setHighlight(false);
			var noteBox = noteList[i].getBoundingBox();
			var staveBox = currentStave.getBoundingBox();
			//Use the Notes X and the Stave's Y for the bounding box 
			if(isCursorWithinRectangle(noteBox.getX(), staveBox.getY(), noteBox.getW(), staveBox.getH(), mousePos.x, mousePos.y))
				return noteList[i];
		}
		return null;
	}
};


Vex.UI.MouseListener.prototype.handleMouseClick = function(evt){
	switch (evt.which) {
    case 1:
        this.handleLeftMouseClick(evt);
        break;
    case 2:
    	this.handleMiddleMouseClick(evt);
        break;
    case 3:
    	//Event being handled by contextMenu
    	//this.handleRightMouseClick(evt);
        break;
    default:
        alert('You have a strange Mouse!');
	}
	
	
};

Vex.UI.MouseListener.prototype.handleMouseWheel = function(evt){
	var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || evt.deltaY)));
	if(this.handler.currentNote!=null){
		var dur = this.handler.currentNote.duration;
		var isAlias = Vex.Flow.durationAliases[dur] !== undefined;
		if (isAlias){
			dur = Vex.Flow.durationAliases[dur];
		}
		if (delta>0)dur*=2;
		else dur/=2;
		
		if (dur<1) dur = 1;
		dur = "" + dur; //to string
		var newNote = this.handler.currentNote.clone({duration: dur});
		
		this.handler.currentStave.replaceTickable(this.handler.currentNote,newNote);
		this.handler.currentNote = newNote;
		this.handler.currentNote.setHighlight(true);
		this.handler.redraw();
	} else if(this.handler.provisoryTickable!=null){
		if(this.handler.provisoryTickable instanceof Vex.Flow.StaveNote){
			var dur = this.handler.provisoryTickable.duration;
			var isAlias = Vex.Flow.durationAliases[dur] !== undefined;
			if (isAlias){
				dur = Vex.Flow.durationAliases[dur];
			}
			if (delta>0)dur*=2;
			else dur/=2;
			
			if (dur<1) dur = 1;
			dur = "" + dur; //to string
			
			this.handler.updateProvisoryDuration(dur);
		}else if(this.handler.provisoryTickable instanceof Vex.Flow.BarNote){
			//See Vex.Flow.Barline.type. Types go from 1 to 6 (7 is Barline.type.NONE).
			var newType = ((this.handler.provisoryTickable.type + 5 + delta) % 6) + 1;
			this.handler.provisoryTickable.setType(newType);
			
			this.handler.drawProvisoryTickable();
		}else if(this.handler.provisoryTickable instanceof Vex.Flow.ClefNote){
			switch(this.handler.provisoryTickable.clefKey){
				case "treble":
					//Switch to bass
					this.handler.provisoryTickable.clefKey = "bass";
					this.handler.provisoryTickable.setClef("bass");
					break;
				case "bass":
					//For now, switch back to treble. later, we will use other types of clefs
					this.handler.provisoryTickable.clefKey = "treble";
					this.handler.provisoryTickable.setClef("treble");
			}


			this.handler.drawProvisoryTickable();
			
		}
	}
		
};

Vex.UI.MouseListener.prototype.handleLeftMouseClick = function(evt){
	if(this.handler.currentStave!=null){
		//Find out the note representing the place clicked by the user
		var mousePos = getMousePositionInCanvas(this.canvas, evt);
		
		//Clicking cases:
		//Case 1: clicked a stave, but not into a note bounding box
		if(this.handler.currentNote==null){
			//This case inserts a note into the current stave, based on which position the user clicked
			
			var previousNote = getLastTickableBeforeXPosition(this.handler.currentStave, mousePos.x);
			//Find out the note immediately after the mouse X position
			var nextNote = getFirstTickableAfterXPosition(this.handler.currentStave, mousePos.x);
			
			//The provisory Note is now added in the stave list
			var newNote = this.handler.provisoryTickable.clone();
			//Add the note into the stave
			this.handler.currentStave.insertTickableBetween(newNote, previousNote, nextNote);
			
			//Redraw the stave
			this.handler.redraw();
			
		} else{
			//Case 2: clicked direclty into a note
			var clickedKeyName = NoteMap.getNoteName(this.handler.currentStave, mousePos);
			
			var keyIndex = this.handler.currentNote.indexOfKey(clickedKeyName);
			
			if(keyIndex == -1){
				//Case 2.1: Clicked a Key the Current note doesn't have
				
				//We should modify the current note to add new Key
				var newKeys = this.handler.currentNote.keys;
				newKeys.push(clickedKeyName);
				var oldNote = this.handler.currentNote;
				var newNote = oldNote.clone({ keys: newKeys});
				this.handler.currentStave.replaceTickable(oldNote, newNote);
				this.handler.currentNote = newNote;
				//Redraw the stave
				this.handler.redraw();

			}/*else{
				//no actions to be done here, since we passed the menu to the right click 
				//Case 2.2: Clicked a Key the current note already has

			}*/
		}
		
		
	}
};

Vex.UI.MouseListener.prototype.handleMiddleMouseClick = function(evt){
	//Middle mouse button is responsible for changing the provisory Tickable type
	var tickable = this.handler.provisoryTickable;
	var newType = null;
	
	if(tickable instanceof Vex.Flow.StaveNote){
		if(tickable.noteType == "n")
			newType = Vex.UI.TickableType.REST;
		else
			newType = Vex.UI.TickableType.BAR;
	} else if (tickable instanceof Vex.Flow.BarNote)
		newType = Vex.UI.TickableType.CLEF;
	else if(tickable instanceof Vex.Flow.ClefNote)
		newType = Vex.UI.TickableType.NOTE;
	
	this.handler.updateProvisoryType(newType);
	
};


Vex.UI.MouseListener.prototype.handleRightMouseClick = function(evt){
	if(this.handler.currentStave!=null){
		//Find out the note representing the place clicked by the user
		if(this.handler.currentNote!=null){
			var mousePos = getMousePositionInCanvas(this.canvas, evt);
			var clickedKeyName = NoteMap.getNoteName(this.handler.currentStave, mousePos);
				
			//We should render a toolbox for modifying current key.
			this.handler.openMenuForKey(clickedKeyName, mousePos);
		}
	}
};