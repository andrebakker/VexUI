//Vex UI -> User Interface for VexFlow
/*
 * Vex.UI.Handler: this class is responsible for starting all the events needed for the VexFlow User Interface to work.
 */
Vex.UI.provisoryTickableStyle = {shadowBlur:0, shadowColor:'gray', fillStyle:'gray', strokeStyle:'gray'}; 
Vex.UI.highlightNoteStyle = {shadowBlur:15, shadowColor:'red', fillStyle:'black', strokeStyle:'black'};
Vex.UI.defaultNoteStyle = {shadowBlur:0, shadowColor:'black', fillStyle:'black', strokeStyle:'black'};

Vex.UI.Handler = function (containerId, options){
	this.container = document.getElementById(containerId);

	//Merge options with default options
	var defaultOptions = {
		canEdit: true,
		canPlay: true,
		canAddStaves: true,
		canChangeNoteValue: true,
		showToolbar: true,
		numberOfStaves: 1,
		canvasProperties: {
			id: containerId + "_canvas",
			width: 625,
			height: 160,
			tabindex: 1
		}
	};

	this.options = mergeProperties(defaultOptions, options || {});
	this.canvas = this.createCanvas();
	this.renderer = new Vex.Flow.Renderer(this.canvas, Vex.Flow.Renderer.Backends.CANVAS);
	this.ctx = this.renderer.getContext();
	this.staveList = this.createStaves();

	if(this.options.showToolbar)
		this.toolbar = new Vex.UI.Toolbar(this);

	this.currentNote = null;
	this.currentStave = null;
	//Tickable that will follow the mouse position
	this.provisoryTickable = null;
	
	this.mouseListener = new Vex.UI.MouseListener(this, this.canvas, this.staveList);
	
	this.keyboardListener = new Vex.UI.KeyboardListener(this, this.canvas, this.staveList);
	
	this.noteMenu = new Vex.UI.NoteMenu(this, this.canvas, this.ctx);
	this.noteMenu.init();
	
	this.tipRenderer = new Vex.UI.TipRenderer(this.canvas);
	this.tipRenderer.init();
	
	this.player = new Vex.UI.Player(this, this.staveList);
};

Vex.UI.Handler.prototype.createCanvas = function() {
	var canvas = document.createElement('canvas');
	//Attach all properties to element
	var props = Object.keys(this.options.canvasProperties);
	for(var i = 0; i<props.length; i++){
		canvas[props[i]] = this.options.canvasProperties[props[i]];
	}
	this.container.appendChild(canvas);

	return canvas;
};

Vex.UI.Handler.prototype.createStaves = function() {
	var staveList = [];
	var yPosition = 0;
	for(var i = 0; i < this.options.numberOfStaves; i++){
		//TODO make stave position more dinamic
		var stave = new Vex.Flow.Stave(10, yPosition , 600);
		staveList.push(stave);
		stave.setContext(this.ctx);
		//Initially empty -> No Notes
		//TODO make it able to load notes
		stave.setTickables([]);
		yPosition += stave.height;
	}

	return staveList;
};


Vex.UI.Handler.prototype.init = function() {
	//Draw everything
	this.redraw();

	if(this.options.canEdit){
		//Start the Listeners
		this.mouseListener.startListening();
		this.keyboardListener.startListening();
	}
	

	return this;
};

Vex.UI.Handler.prototype.redraw = function(){
	this.ctx.clear();
	this.drawStaves();
	this.drawNotes();
};

Vex.UI.Handler.prototype.redrawStave = function(stave){
	//get stave bounding box
	var box = stave.getBoundingBox();
	//TODO The +12 and +5 values are to erase part of a note that could be out of the bounding box. This values shouldn't be absolut. FIX!	
	this.ctx.clearRect(box.getX(), box.getY(), box.getW() + 12, box.getH() + 5);
	stave.draw();
	this.drawNotes(stave);
};

Vex.UI.Handler.prototype.drawStaves = function(){
	for(var i = 0; i < this.staveList.length; i++){
		this.staveList[i].draw();
	}
};

Vex.UI.Handler.prototype.drawNotes = function(stave){
	if(stave === undefined){
		//Draw Notes on all staves
		for(var i = 0; i < this.staveList.length; i++){
			this.drawNotes(this.staveList[i]);
		}
	} else {
		//Draw notes on Stave passed as Arg
		var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);
		// disable strict timing, or else we won't be able to render BarNotes
		voice.setStrict(false);
		voice.addTickables(stave.getTickables());
		
		var formatter = new Vex.Flow.Formatter();
		formatter.joinVoices([voice]);
		formatter.formatToStave([voice], stave);
		voice.draw(this.ctx, stave);
		this.drawBeams(stave);
	}
};

Vex.UI.Handler.prototype.drawBeams = function(stave){
	for(var i = 0; i < stave.getBeams().length; i++){
		stave.getBeams()[i].setContext(this.ctx).draw();
	}
};


Vex.UI.Handler.prototype.updateProvisoryKey = function(mousePos){
	
	if(this.provisoryTickable==null){
		this.provisoryTickable = new Vex.Flow.StaveNote({keys: ["d/4"], duration: "4"});		
	}

	
	
	if(this.currentStave!=null){
		if(!(this.provisoryTickable instanceof Vex.Flow.StaveNote) || this.provisoryTickable.noteType == "r"){
			//No need to update key if its not a note or if its a rest, just draw the tickable in the new mouse position
			
		}
		else{
			var noteName = NoteMap.getNoteName(this.currentStave, mousePos);
			if(noteName != this.provisoryTickable.keys[0]){
				
				this.provisoryTickable = this.provisoryTickable.clone({keys: [noteName]});
				if(this.provisoryTickable !== undefined){
					this.provisoryTickable.setStyle(Vex.UI.provisoryTickableStyle);
				}
				//Since we have a new note key, update the stem direction
				this.provisoryTickable.setStemDirection(getStemDirection(this.currentStave, mousePos.y));
				this.provisoryTickable.setStave(this.currentStave);
				this.provisoryTickable.setTickContext(new Vex.Flow.TickContext());
				
			}
		}
		this.drawProvisoryTickable(mousePos);
		
	}
	
};

Vex.UI.Handler.prototype.updateProvisoryDuration = function(newDur){
	var x_shift = null;
	if(this.provisoryTickable)
		x_shift = this.provisoryTickable.x_shift;
	this.provisoryTickable = this.provisoryTickable.clone({duration: newDur});
	if(x_shift)
		this.provisoryTickable.x_shift = x_shift;
	this.provisoryTickable.setStave(this.currentStave || this.staveList[0]);
	this.provisoryTickable.setTickContext(new Vex.Flow.TickContext());
	this.drawProvisoryTickable();
	
};

Vex.UI.Handler.prototype.updateProvisoryType = function(newType){
	var x_shift = null;
	if(this.provisoryTickable)
		x_shift = this.provisoryTickable.x_shift;
	
	switch(newType){
	case Vex.UI.TickableType.NOTE:
		this.provisoryTickable = new Vex.Flow.StaveNote({keys: ["d/4"], duration: "4" });
		break;
	case Vex.UI.TickableType.REST:
		var duration = "4";//TODO make it more configurable, or at least dinamic
		if(this.provisoryTickable)
			duration = this.provisoryTickable.duration;
		this.provisoryTickable = new Vex.Flow.StaveNote({ keys: ["b/4"], duration: duration + "r" });
		break;
	case Vex.UI.TickableType.BAR:
		this.provisoryTickable = new Vex.Flow.BarNote();
		break;
	case Vex.UI.TickableType.CLEF:
		this.provisoryTickable = new Vex.Flow.ClefNote("treble");
		this.provisoryTickable.clefKey = "treble";
		break;
	}
	
	//TODO Maybe this code below shouldn't be here... should we really draw in this method?
	this.provisoryTickable.setStave(this.currentStave || this.staveList[0]);
	this.provisoryTickable.setTickContext(new Vex.Flow.TickContext());
	if(this.provisoryTickable.setStyle !== undefined)
		this.provisoryTickable.setStyle(Vex.UI.provisoryTickableStyle);
	if(x_shift)
		this.provisoryTickable.x_shift = x_shift;
	
	this.drawProvisoryTickable();
};

Vex.UI.Handler.prototype.drawProvisoryTickable = function(mousePos){
	
	if(this.provisoryTickable && this.currentStave!=null){
		this.redrawStave(this.currentStave);
		if(mousePos!==undefined){
			if(this.provisoryTickable instanceof Vex.Flow.StaveNote){
				//Fix X position to set exactly where the mouse is
				//TODO the -5 value shouldnt be absolute! it should reflect half the note's Width
				this.provisoryTickable.x_shift= mousePos.x - this.provisoryTickable.getAbsoluteX() - 5;


			}else{// if(this.provisoryTickable instanceof Vex.Flow.BarNote){
				this.provisoryTickable.getTickContext().setX(
						mousePos.x 
						- this.currentStave.getNoteStartX() 
						- this.provisoryTickable.render_options.stave_padding
						);
			}
		}
		//Only draw Provisory note if not on a definitive note
		if(this.currentNote==null){
			var tempFillStyle = this.ctx.fillStyle;
			var tempStrokeStyle = this.ctx.strokeStyle;
			this.ctx.fillStyle = 'gray';
			this.ctx.strokeStyle = 'gray';

			this.provisoryTickable.draw();

			this.ctx.fillStyle = tempFillStyle;
			this.ctx.strokeStyle = tempStrokeStyle;

		}	
	}
	
	
};

Vex.UI.Handler.prototype.openMenuForKey = function(keyName, mousePos){
	//We will open a new Menu: stop listening to the StaveMouseListener
	this.mouseListener.stopListening();
	this.noteMenu.setNote(this.currentNote);
	this.noteMenu.setKeyIndex(this.currentNote.indexOfKey(keyName));
	this.noteMenu.open(mousePos);
};
/**
 * This method is called by NoteMenu on close()
 */
Vex.UI.Handler.prototype.noteMenuClosed = function(){
	//Redraw the whole canvas
	this.redraw();
	//Resume listening the the mouse
	this.mouseListener.startListening();
};

Vex.UI.Handler.prototype.addAccidentalToNote = function(name, note, index){
	if(index === undefined || index == -1)
		index = 0;
	
	var accidental = new Vex.Flow.Accidental(name);
	note.addAccidental(index, accidental);
};

//Dots were moving up when the key is over a line. between lines works fine.
//Error provoked by modifiercontext.js on line 356 (or vexflow-min.js line 4007)
//Changed the line on min.js to stop shifting the dot when over a line to avoid the problem.
Vex.UI.Handler.prototype.addDotToNote = function(note){
	note.addDotToAll();
};

//TODO Only create a new beam with next note if there isnt a beam already. Otherwise, merge beam or add note to beam.
Vex.UI.Handler.prototype.beamWithNextNote = function(note){
	var nextNote = this.currentStave.getNextNote(note);
	
	if(nextNote != null) {
		//Set the note array
		
		notes = [note, nextNote];
		
		nextNote.setStemDirection(note.getStemDirection());
		//Create beam
		var beam = new Vex.Flow.Beam(notes);
		
		this.currentStave.pushBeam(beam);
	}
};

Vex.UI.Handler.prototype.deleteNote = function(note){
	for(var i = 0; i < this.staveList.length; i++){
		var notes = this.staveList[i].getNotes();
		var referenceIndex = notes.indexOf(note);

		if(referenceIndex > -1){
			this.staveList[i].removeTickable(note);
		}
	}
	
};


Vex.UI.Handler.prototype.play = function(){

	var playButton, stopButton;

	if(this.toolbar){
		playButton = this.toolbar.buttons.play;
		stopButton = this.toolbar.buttons.stop;

		//enable stop, disable play
		stopButton.disabled = false;
		playButton.disabled = true;
	}

	//TODO RPM should be set outside...
	var rpm = 120;
	var playInfo = { 
			delay: 0,
			rpm: rpm,
			defaultTime : (rpm / 60) // to seconds
			};
	//var script = "MIDI.setVolume(0, 127);";
	var playEvents = [];
	for(var i = 0; i < this.staveList.length; i++){
		var stave = this.staveList[i];
		//set clef to playinfo
		playInfo.clef = stave.clef;

		//Call initial barline play events
		var barNote = new Vex.Flow.BarNote();
		barNote.setType(stave.modifiers[0].barline);
		playEvents = playEvents.concat(barNote.getPlayEvents(playInfo, playEvents));

		for(var j = 0; j < stave.getTickables().length; j++){
			var tickable = stave.getTickables()[j];
			playEvents = playEvents.concat(tickable.getPlayEvents(playInfo, playEvents));
		}		

		//Call final barline play events
		barNote.setType(stave.modifiers[1].barline);
		playEvents = playEvents.concat(barNote.getPlayEvents(playInfo, playEvents));
	}
	
	this.player.addEvents(playEvents);
	this.player.onPlayFinished(function(){
		//Reenable play and disable stop
		if(playButton)
			playButton.disabled = false;
		if(stopButton)
			stopButton.disabled = true;
	});
	this.player.play();
};

Vex.UI.Handler.prototype.stop = function(){
	this.player.stop();
		
	if(this.toolbar){
		playButton = this.toolbar.buttons.play;
		stopButton = this.toolbar.buttons.stop;

		//enable stop, disable play
		playButton.disabled = false;
		stopButton.disabled = true;
	}

};