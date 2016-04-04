/*
 * New attibutes and methods to be used by the UI classes.
 */

/*
 * Vex.Flow.Stave extensions 
 */

Vex.Flow.Stave.prototype.tickables = [];

Vex.Flow.Stave.prototype.setTickables = function(tickables) {
	this.tickables = tickables;
};

Vex.Flow.Stave.prototype.getTickables = function() {
	return this.tickables;
};

Vex.Flow.Stave.prototype.getNotes = function() {
	var notes = [];
	
	for ( var i = 0; i < this.tickables.length; i++) {
		var tickable = this.tickables[i];
		if(tickable instanceof Vex.Flow.StaveNote)
			notes.push(tickable);
	}
	return notes;
};

Vex.Flow.Stave.prototype.insertTickableBetween = function(newTickable, previousTickable, nextTickable) {

	if(newTickable instanceof Vex.Flow.ClefNote){
		//If the stave has no clef modifiers, then add it. 
		if(this.getClefModifierIndex() < 0){
			this.addClef(newTickable.clefKey);
			return;
		}
		//If the stave already has a clef, but the user clicked before any other tickable, then replace the stave clef
		else if(previousTickable == null){
			this.replaceClef(newTickable.clefKey);
			return;
		}
		//Else add it as a normal ClefNote as long as the stave already has notes, so leave otherwise
		else if(this.getNotes().length == 0)
			return;
			
			
	} else if(newTickable instanceof Vex.Flow.BarNote){
		//If the BarNote is to be inserted after everything, then modify the end bar of the stave
		if(nextTickable == null){
			this.setEndBarType(newTickable.type);
			return;
		}
		//Else add it as a normal BarNote as long as the stave already has notes, so leave otherwise
		else if(this.getNotes().length == 0)
			return;
	}

	if(nextTickable==null){
			this.pushTickable(newTickable);
	}else{
		var referenceIndex = this.tickables.indexOf(nextTickable);
		this.tickables.splice(referenceIndex, 0, newTickable);	
	}
};

Vex.Flow.Stave.prototype.getClefModifierIndex = function(){
	//Remove all clefs currently in the stave
	for(var i = 0; i < this.modifiers.length; i++){
		var modifier = this.modifiers[i];

		if(modifier instanceof Vex.Flow.Clef)
			return i;

	}
	return -1;

}

Vex.Flow.Stave.prototype.replaceClef = function(clef){
	var start_X= this.start_x ;
	this.clef = clef;
	var modifier = new Vex.Flow.Clef(clef);
	this.modifiers.splice(this.getClefModifierIndex(), 1);
	this.glyphs = [];
	this.addClef(clef);

	this.start_x = start_X;
}

Vex.Flow.Stave.prototype.getPreviousTickable = function(referenceTickable){
	var referenceIndex = this.tickables.indexOf(referenceTickable);
	if (referenceIndex == 0) return null;
	return this.tickables[referenceIndex-1];
};

Vex.Flow.Stave.prototype.getNextTickable = function(referenceTickable){
	var referenceIndex = this.tickables.indexOf(referenceTickable);
	if (referenceIndex == this.tickables.length - 1) return null;
	return this.tickables[referenceIndex+1];
};

Vex.Flow.Stave.prototype.getNextNote = function(referenceNote){
	var referenceIndex = this.tickables.indexOf(referenceNote);
	while(referenceIndex < this.tickables.length){
		referenceIndex++;
		if(this.tickables[referenceIndex] instanceof Vex.Flow.StaveNote)
			return this.tickables[referenceIndex];
	}
		
	return null;
};

Vex.Flow.Stave.prototype.replaceTickable = function(oldTickable,newTickable){
	//Replacing note in beam.
	if(oldTickable.beam!=null){
		var beam = oldTickable.beam;
		var referenceIndex = beam.tickables.indexOf(oldTickable);
		beam.notes[referenceIndex]=newTickable;
	}
	
	var referenceIndex = this.tickables.indexOf(oldTickable);
	this.tickables[referenceIndex]=newTickable;
};

Vex.Flow.Stave.prototype.removeTickable = function(tickable){
	this.tickables.splice(this.tickables.indexOf(tickable), 1);
}

Vex.Flow.Stave.prototype.pushTickable = function(newTickable){
	this.tickables.push(newTickable);
};

Vex.Flow.Stave.prototype.beams = [];

Vex.Flow.Stave.prototype.setBeams = function(beamList) {
	this.beams = beamList;
};

Vex.Flow.Stave.prototype.getBeams = function() {
	return this.beams;
};


Vex.Flow.Stave.prototype.pushBeam = function(newBeam){
	this.beams.push(newBeam);
};


/*
 * Vex.Flow.StaveNote extensions
 */
/**
 * @param keyName The name of the Key
 * @returns the index of the key in the Note, or -1 if it doesn't contain the key
 */
Vex.Flow.StaveNote.prototype.indexOfKey = function(keyName){
	return this.keys.indexOf(keyName);
};


Vex.Flow.StaveNote.prototype.getPlayEvents = function(playInfo){
	//Prepare the notes to be sent
	var notes = [];
	
	for(var i = 0; i < this.keys.length; i++){
		notes.push(MIDI.keyToNote[this.keys[i].replace('/','')]);
	}

	//Set clef offset for notes
	for (var i = 0; i < notes.length; i++) {
		notes[i] += Vex.UI.ClefOffsets[playInfo.clef];
	};

	var keyPressTime = playInfo.defaultTime / this.duration;

	//Set the modifiers for this note (update note value)
	for (var i = 0; i < this.modifiers.length; i++) {
		var modifier = this.modifiers[i];
		if(modifier instanceof Vex.Flow.Accidental){
			var modValue;

			switch(modifier.type){
				case "bb":
				modValue = -2;
				break;
				case "b":
				modValue = -1;
				break;
				case "n":
				modValue = 0;
				break;
				case "#":
				modValue = 1;
				break;
				case "##":
				modValue = 2;
				break;
			}

			notes[modifier.index] += modValue;
		}else if(modifier instanceof Vex.Flow.Dot){
			keyPressTime *= 1.5;
		}
		

	};

	//	velocity is set as 127
	
	
	
	var events = [];
	

	events.push({
		type: 'channel',
		channel: 0,
		subtype: notes.length==1?'noteOn':'chordOn',
		noteNumber: notes.length==1?notes[0]:notes,
		velocity: 127,
		queuedTime: playInfo.delay,
		note: this
	});
	events.push({
		type: 'channel',
		channel: 0,
		subtype: notes.length==1?'noteOff':'chordOff',
		noteNumber: notes.length==1?notes[0]:notes,
		queuedTime: playInfo.delay + keyPressTime,
		note: this
	});

	
	//increment the delay 
	playInfo.delay = playInfo.delay + keyPressTime;
	
	return events;
};


//TODO Clone Ties
Vex.Flow.StaveNote.prototype.clone = function(newProps){
	var currentProps = {
			keys: this.keys,
			stem_direction: this.getStemDirection(),
			duration: this.duration,
			noteType: this.noteType
	} ;
	
	
	var mergedProps = mergeProperties(currentProps, newProps);
	mergedProps.duration = mergedProps.duration + mergedProps.noteType;
	
	var newNote = new Vex.Flow.StaveNote(mergedProps);
	
	//Setting the style as the same style as the note head
	newNote.setStyle(this.note_heads[0].style);
	 
	
	
	if(this.modifierContext!=null && this.getDots()!=null)
		newNote.addDotToAll();
	
	newNote.beam = this.beam;
	
	//Clone modifiers
	for (var i = 0; i < this.modifiers.length; i++) {
		if(this.modifiers[0] instanceof Vex.Flow.Accidental){
			newNote.addAccidental(this.modifiers[i].index, new Vex.Flow.Accidental(this.modifiers[i].type));
		}
		
	};

	return newNote;
};

Vex.Flow.StaveNote.prototype.setHighlight = function(highlight){
	if(highlight)
		this.setStyle(Vex.UI.highlightNoteStyle);
	else
		this.setStyle(Vex.UI.defaultNoteStyle);
};

/**
 * Return new note, from actions:
 * "UP"		=> up on stave
 * "DOWN"	=> down on stave
 * "SHARP"	=> add sharp
 * @param action
 * @returns
 */
Vex.Flow.StaveNote.prototype.change = function(action){
	var newKeys = new Array();
	//for each key
	for (var k in this.keys){
		var splitted = this.keys[k].split("/");
		splitted[0] = splitted[0].toUpperCase();
		//first char is the note
		var note = splitted[0].substring(0,1);
		var accidentals = splitted[0].substring(1);
		var octave = parseInt(splitted[1]);
		
		//search index of key in NoteMap.noteMap
		var index = 0;
		for (var x in NoteMap.noteMap){
			if (NoteMap.noteMap[x] == note){
				index = x;
				break;
			}
		}
		
		//do the ACTION
		if (action == "UP") //increment key
			index++; 
		else if (action == "DOWN") //descrease key
			index--;
		else if (action == "SHARP"){
		//TODO add other cases
			switch (accidentals){
				case "":
				case null:
				case undefined:
					accidentals = "#";
					break;
				case "#":
					accidentals = "##";
					break;
			}
			alert(accidentals);
		}
		//octave changes
		if (index == NoteMap.noteMap.length){
			index = 0;
			octave++;
		}else if (index < 0){
			index = NoteMap.noteMap.length-1;
			octave--;
		}
		//push new key
		note = NoteMap.noteMap[index];
		newKeys.push(note + accidentals+"/"+octave);
	}
	var dur = this.duration;
	var type = this.noteType;
	if (action == "PAUSE"){
		if (type == "n") type = "r";
		else if (type == "r") type = "n";
		dur = Vex.Flow.parseNoteDurationString(this.duration);
		var dots = "";
		for (var i=0;i<dur.dots;i++) dots+="d";
		dur = dur.duration+dots+type;
	}
	//create new note with new parameters
	return this.clone({keys: newKeys, duration:dur });
};

/*
 * Override the original draw flag to fix the color being drawed
 */
Vex.Flow.StaveNote.prototype.drawFlag = function(){
	if (!this.context) throw new Vex.RERR("NoCanvasContext",
	"Can't draw without a canvas context.");
	var ctx = this.context;
	var glyph = this.getGlyph();
	var render_flag = this.beam === null;
	var bounds = this.getNoteHeadBounds();

	var x_begin = this.getNoteHeadBeginX();
	var x_end = this.getNoteHeadEndX();

	if (glyph.flag && render_flag) {
		var note_stem_height = this.stem.getHeight();
		var flag_x, flag_y, flag_code;

		if (this.getStemDirection() === Vex.Flow.Stem.DOWN) {
			// Down stems have flags on the left.
			flag_x = x_begin + 1;
			flag_y = bounds.y_top - note_stem_height + 2;
			flag_code = glyph.code_flag_downstem;

		} else {
			// Up stems have flags on the left.
			flag_x = x_end + 1;
			flag_y = bounds.y_bottom - note_stem_height - 2;
			flag_code = glyph.code_flag_upstem;
		}

		//NOTE: The 2 lines below were added to the original code
		var ctxFillStyle = ctx.fillStyle; 
		ctx.fillStyle = this.note_heads[0].style.fillStyle;
		
		// Draw the Flag
		Vex.Flow.renderGlyph(ctx, flag_x, flag_y,
				this.render_options.glyph_font_scale, flag_code);

		//NOTE: The 2 lines below were added to the original code
		//Reverting style
		ctx.fillStyle = ctxFillStyle;
	}
};


/*
 * Vex.Flow.Dot extensions
 */

/*
 * Overriding the Draw method so that the dot stops going up at every draw call
 */
Vex.Flow.Dot.prototype.draw= function() {
    if (!this.context) throw new Vex.RERR("NoContext",
      "Can't draw dot without a context.");
    if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
      "Can't draw dot without a note and index.");

    var line_space = this.note.stave.options.spacing_between_lines_px;

    var start = this.note.getModifierStartXY(this.position, this.index);

    // Set the starting y coordinate to the base of the stem for TabNotes
    if (this.note.getCategory() === 'tabnotes') {
      start.y = this.note.getStemExtents().baseY;
    }

    var dot_x = (start.x + this.x_shift) + this.width - this.radius;
    //This next commented line is the original Draw
    //var dot_y = start.y + this.y_shift + (this.dot_shiftY * line_space);
    //This next line is the modified Draw
    var dot_y = start.y + this.y_shift;
    var ctx = this.context;

    ctx.beginPath();
    ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
};

/*
 * Barnote Extensions
 */
Vex.Flow.BarNote.prototype.clone = function(){
	var newBarNote = new Vex.Flow.BarNote();
	newBarNote.setType(this.getType());
	newBarNote.setStave(this.getStave());
	newBarNote.setTickContext(this.getTickContext());
	return newBarNote;
};

Vex.Flow.BarNote.prototype.getPlayEvents = function(playInfo, currentEvents){
	var newEvents = [];

	function markBeginRepeatIndex(){
		//mark current index as repeating point
		playInfo.beginRepeatIndex = currentEvents.length + newEvents.length;
	}

	function addRepeatEvents(){
		//Add all events since repeat index
		for(var i = playInfo.beginRepeatIndex || 0; i < currentEvents.length; i++){
			newEvents.push(currentEvents[i]);
		}
	}

	switch(this.type){
		case Vex.Flow.Barline.type.REPEAT_BEGIN:		
			markBeginRepeatIndex();
		break;
		case Vex.Flow.Barline.type.REPEAT_END:
			addRepeatEvents();
		break;
		case Vex.Flow.Barline.type.REPEAT_BOTH:
			addRepeatEvents();
			markBeginRepeatIndex();
		break;
	}

	return newEvents;
}

/*
 * ClefNote Extensions
 */

Vex.Flow.ClefNote.prototype.clone = function (){
	var newClef = new Vex.Flow.ClefNote(this.clefKey);
	newClef.clefKey = this.clefKey;
	newClef.setTickContext(new Vex.Flow.TickContext());
	newClef.getTickContext().setX(this.getTickContext().getX());
	return newClef;
};


Vex.Flow.ClefNote.prototype.getPlayEvents = function (playInfo){
	//update current clef
	playInfo.clef = this.clefKey;
	return [];
};