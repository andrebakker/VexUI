/*
 * 	This class the MIDI.js in the project to work correctly.
 * 
 */

Vex.UI.Player = function (handler){
	this.events = [];
	this.handler = handler;
	this.currentTime = 0;
	this.currentEventIndex = 0;
	this.ready = false;
	this.loadInstrument("acoustic_grand_piano");
	this.playing = false;
};

Vex.UI.Player.prototype.loadInstrument = function(instrumentName, onReady){
	var player = this;
	//Initialize the player
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: instrumentName,
		callback: function(){
			player.ready = true;
			if(onReady)
				onReady();
		}
	});
}

Vex.UI.Player.prototype.onPlayFinished = function(callback){
	this.callback = callback;
}

/**
 * Add functionality to add events manually, instead of using loadFile
 * @param event -> must have these attributes:
 * channel -> integer
 * subtype -> 'noteOn' | 'noteOff' | 'chordOn' | 'chordOff'
 * noteNumber -> integer
 * velocity -> integer (only required when subtype == 'noteOn' | 'chordOn')
 * queuedTime -> float (when the event will be triggered)
 */
Vex.UI.Player.prototype.addEvent = function(event){
	this.events.push(event);
};


Vex.UI.Player.prototype.addEvents = function(eventList){
	this.events = this.events.concat(eventList);
};

Vex.UI.Player.prototype.play = function(self){
	if(self === undefined)
		self = this;
	self.playing = true;
	if(self.currentEventIndex >= self.events.length){
		self.playing = false;
		return self.callback();
	}
	
	var event = self.events[self.currentEventIndex];
	
	if(self.currentTime <= event.queuedTime){
		//Fire the event
		self.fireEvent(event);
		
		//Increment the current event and add current time
		if(self.currentEventIndex + 1 >= self.events.length){
			self.playing = false;
			return self.callback();
		}
		var timeUntilNextEvent = self.events[self.currentEventIndex + 1].queuedTime -
								self.events[self.currentEventIndex].queuedTime;
		
		self.currentEventIndex++;
		self.currentTime += timeUntilNextEvent;
		
		self.scheduledId = setTimeout(self.play, timeUntilNextEvent * 1000, self);
	}
	
};

Vex.UI.Player.prototype.stop = function(){
	if(this.scheduledId){
		clearTimeout(this.scheduledId);
		this.clear();
		this.playing = false;
		while(this.events.length){
			var event = this.events.pop();
			if(event.subtype == "noteOff" || event.subtype == "chordOff")
				this.fireEvent(event);
		}
	}
};


Vex.UI.Player.prototype.fireEvent = function(event){
	switch(event.subtype){
		case 'noteOn':
			MIDI.noteOn(event.channel, event.noteNumber, event.velocity, 0);
			event.note.setHighlight(true);
			self.handler.redraw();
			break;
		case 'noteOff':
			MIDI.noteOff(event.channel, event.noteNumber, 0);
			event.note.setHighlight(false);
			self.handler.redraw();
			break;
		case 'chordOn':
			MIDI.chordOn(event.channel, event.noteNumber, event.velocity, 0);
			event.note.setHighlight(true);
			self.handler.redraw();
			break;
		case 'chordOff':
			MIDI.chordOff(event.channel, event.noteNumber, 0);
			event.note.setHighlight(false);
			self.handler.redraw();
			break;
	}
};

Vex.UI.Player.prototype.clear = function(){
	this.scheduledId = null;
	this.currentTime = 0;
	this.currentEventIndex = 0;
};