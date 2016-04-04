

Vex.UI.NoteMap = function(){
	this.noteMap = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
};

Vex.UI.NoteMap.prototype.getNoteName = function(stave, mousePos){
	//Step 1: get mouse position relative to the stave
	var relativeMouseY = mousePos.y - stave.getBoundingBox().getY();
	
	//Step 2: get in which space within the staves the user clicked
	//using half the space between lines because we can click between a line (each line can hold 2 notes)
	var noteArea = Math.round(relativeMouseY / (stave.options.spacing_between_lines_px/2));
	
	//Step 3: use the map to get the note Name
	return this.toNoteName(noteArea, stave);
};

Vex.UI.NoteMap.prototype.toNoteName = function(noteArea, stave){
	var baseNote = this.getBaseNote(stave);
	var baseNoteValue = this.noteMap.indexOf(baseNote.note);
	
	var desiredNoteValue = (baseNoteValue - noteArea) % 7;
	//make it a positive value
	while (desiredNoteValue < 0) desiredNoteValue+=7;
	
	var desiredNoteOctave = baseNote.octave - (Math.floor(noteArea / 7));
	
	if( (desiredNoteValue == 5 || desiredNoteValue == 6))
		desiredNoteOctave--;
	
	return this.noteMap[desiredNoteValue] + '/' + desiredNoteOctave;
};

/**
  * For now, it seems the easiest way to map notes is to consider them as always in the treble clef.
  * For playing purposes, we are using Vex.UI.ClefOffsets to find out the correct note.
  */
Vex.UI.NoteMap.prototype.getBaseNote = function(stave){
	
	return {note:'G', octave: 6}; // represents 4 lines above the treble clef
	
};


//Init the variable, so that it can be used globally
var NoteMap = new Vex.UI.NoteMap();