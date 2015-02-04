/*
 * New attibutes and methods to be used by the UI classes.
 */

/*
 * Vex.Flow.Stave extensions 
 */

Vex.Flow.Stave.prototype.notes = [];

Vex.Flow.Stave.prototype.setNotes = function(noteList) {
	this.notes = noteList;
};

Vex.Flow.Stave.prototype.getNotes = function() {
	return this.notes;
};

Vex.Flow.Stave.prototype.insertNoteBefore = function(newNote, referenceNote) {
	if(referenceNote==null){
		this.pushNote(newNote);
	}else{
		var referenceIndex = this.notes.indexOf(referenceNote);
		this.notes.splice(referenceIndex, 0, newNote);	
	}
	
};

Vex.Flow.Stave.prototype.getPreviousNote = function(referenceNote){
	var referenceIndex = this.notes.indexOf(referenceNote);
	if (referenceIndex == 0) return null;
	return this.notes[referenceIndex-1];
};

Vex.Flow.Stave.prototype.getNextNote = function(referenceNote){
	var referenceIndex = this.notes.indexOf(referenceNote);
	if (referenceIndex == this.notes.length - 1) return null;
	return this.notes[referenceIndex+1];
};

Vex.Flow.Stave.prototype.replaceNote = function(oldNote,newNote){
	//Replacing note in beam.
	if(oldNote.beam!=null){
		var beam = oldNote.beam;
		var referenceIndex = beam.notes.indexOf(oldNote);
		beam.notes[referenceIndex]=newNote;
	}
	
	var referenceIndex = this.notes.indexOf(oldNote);
	this.notes[referenceIndex]=newNote;
};

Vex.Flow.Stave.prototype.pushNote = function(newNote){
	this.notes.push(newNote);
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


//TODO Clone Ties
Vex.Flow.StaveNote.prototype.clone = function(newProps){
	var currentProps = {
			keys: this.keys,
			stem_direction: this.getStemDirection(),
			duration: this.duration
	} ;
	
	
	var mergedProps = mergeProperties(currentProps, newProps);
	
	var newNote = new Vex.Flow.StaveNote(mergedProps);
	
	//Setting the style as the same style as the note head
	newNote.setStyle(this.note_heads[0].style);
	 
	if(this.modifierContext!=null && this.getDots()!=null)
		newNote.addDotToAll();
	
	newNote.beam = this.beam;
	
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

