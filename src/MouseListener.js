/*
 * Vex.UI.MouseListener: this class is responsible for handling all mouse events performed by the user within the canvas
 */

Vex.UI.MouseListener = function(handler, canvas, staveList) {
	this.handler = handler;
	this.canvas = canvas;
	this.staveList = staveList;
};

Vex.UI.MouseListener.prototype.init = function(){
	//TODO Remove code below
	/*
	//Draw bounding boxes for the Staves
	var context = this.canvas.getContext("2d");
	for(var i = 0; i < this.staveList.length; i++){
		var box = this.staveList[i].getBoundingBox();

		context.beginPath();
	    context.rect(box.getX(), box.getY(), box.getW(), box.getH());
	    context.lineWidth = 7;
	    context.strokeStyle = 'black';
	    context.stroke();	
	}
	
	*/
	
	
	//Draw bounding boxes for the Notes
	/*for(var i = 0; i < this.staveList.length; i++){
		
		var noteList = this.staveList[i];
		
		for(var j = 0;  j < noteList.length; j ++){
			var box = this.noteList[i].getBoundingBox();

			context.beginPath();
			context.rect(box.getX(), box.getY(), box.getW(), box.getH());
			context.lineWidth = 7;
			context.strokeStyle = 'yellow';
			context.stroke();
	    
		}
	}*/
	
};

Vex.UI.MouseListener.prototype.handleEvent = function(evt){
	switch(evt.type) {
		case "click":
			this.handleMouseClick(evt);
			break;
		case "mousemove":
			this.handleMouseOver(evt);
			break;
		case "mousewheel":
			this.handleMouseWheel(evt);
			break;
	}
};

Vex.UI.MouseListener.prototype.startListening = function(){
	this.canvas.addEventListener('click', this, false);
	this.canvas.addEventListener('mousemove', this, false);
	this.canvas.addEventListener('mousewheel', this, false);
};

Vex.UI.MouseListener.prototype.stopListening = function(){
	this.canvas.removeEventListener('click', this, false);
	this.canvas.removeEventListener('mousemove', this, false);
	this.canvas.removeEventListener('mousewheel', this, false);
};

Vex.UI.MouseListener.prototype.handleMouseOver = function(evt){
	var mousePos = getMousePositionInCanvas(canvas, evt);
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
			noteList = currentStave.getNotes();
		
		for(var i = 0; i < noteList.length; i++){
			//return to default color. Unnecessary if currentNote does not change color
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
	switch (event.which) {
    case 1:
        this.handleLeftMouseClick(evt);
        break;
    case 2:
    	this.handleMiddleMouseClick(evt);
        break;
    case 3:
        alert('Right Mouse button pressed.');
        break;
    default:
        alert('You have a strange Mouse!');
	}
	
	
};

Vex.UI.MouseListener.prototype.handleMouseWheel = function(evt){
	var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
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
		
		this.handler.currentStave.replaceNote(this.handler.currentNote,newNote);
		this.handler.currentNote = newNote;
		this.handler.currentNote.setHighlight(true);
		this.handler.redraw();
	} else if(this.handler.provisoryNote!=null){
		var dur = this.handler.provisoryNote.duration;
		var isAlias = Vex.Flow.durationAliases[dur] !== undefined;
		if (isAlias){
			dur = Vex.Flow.durationAliases[dur];
		}
		if (delta>0)dur*=2;
		else dur/=2;
		
		if (dur<1) dur = 1;
		dur = "" + dur; //to string
		
		this.handler.updateProvisoryDuration(dur);
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
			
			//Find out the note immediately after the mouse X position
			var nextNote = getLastNoteBeforeXPosition(this.handler.currentStave, mousePos.x);
			
			//The provisory Note is now added in the stave list
			var newNote = this.handler.provisoryNote.clone({color: Vex.DefaultColor});
			//Add the note into the stave
			this.handler.currentStave.insertNoteBefore(newNote, nextNote);
			
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
				this.handler.currentStave.replaceNote(oldNote, newNote);
				this.handler.currentNote = newNote;
				//Redraw the stave
				this.handler.redraw();

			}else{
				//Case 2.2: Clicked a Key the current note already has
				//We should render a toolbox for modifying current key.
				this.handler.openMenuForKey(clickedKeyName, mousePos);
				
			}
		}
		
		
	}
};

Vex.UI.MouseListener.prototype.handleMiddleMouseClick = function(evt){
	alert("middle button pressed");
};