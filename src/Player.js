/*
 * 	This class the MIDI.js in the project to work correctly.
 * 
 */

Vex.UI.Player = function (handler){
	this.events = [];
	this.handler = handler;
	this.currentTime = 0;
	this.currentEventIndex = 0;
	//this.ready = false;
	//Initialize the player
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		callback: function() {
			//this.ready = true;
		}
	});
};


/**
 * Add functionality to add events manually, instead of using loadFile
 * @param event -> must have these attributes:
 * channel -> integer
 * subtype -> 'noteOn' | 'noteOff'
 * noteNumber -> integer
 * velocity -> integer (only required when subtype == 'noteOn')
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
	if(self.currentEventIndex >= self.events.length)
		return;//TODO Correctly stop
	
	var event = self.events[self.currentEventIndex];
	
	if(self.currentTime <= event.queuedTime){
		//Fire the event
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
		}
		
		//Increment the current event and add current time
		if(self.currentEventIndex + 1 >= self.events.length)
			return;
		var timeUntilNextEvent = self.events[self.currentEventIndex + 1].queuedTime -
								self.events[self.currentEventIndex].queuedTime;
		
		self.currentEventIndex++;
		self.currentTime += timeUntilNextEvent;
		
		setTimeout(self.play, timeUntilNextEvent * 1000, self);
	}
	
};


