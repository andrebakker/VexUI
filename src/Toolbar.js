Vex.UI.Toolbar = function(handler){
	this.handler = handler;
	this.buttons = {};
	this.buttonGroups = {};
	var opts = this.handler.options;

	if(opts.canChangeNoteValue){
		var noteValuesGroup = this.createButtonGroup("noteValues");
		this.buttonGroups.noteValues = noteValuesGroup;

		this.buttons.wholeNote = noteValuesGroup.appendChild(this.createIcon("wholeNote", "musisync-wholeNote"));
		this.buttons.halfNote = noteValuesGroup.appendChild(this.createIcon("halfNote", "musisync-halfNote"));
		this.buttons.eightNote = noteValuesGroup.appendChild(this.createIcon("eightNote", "musisync-eightNote"));
		this.buttons.sixteenthNote = noteValuesGroup.appendChild(this.createIcon("sixteenthNote", "musisync-sixteenthNote"));

		this.handler.container.appendChild(noteValuesGroup);
	}
	if(opts.canPlay){
		this.buttons.play = this.handler.container.appendChild(this.createIcon("play", "icomoon-play"));
		this.buttons.stop = this.handler.container.appendChild(this.createIcon("stop", "icomoon-stop", true));
	}
};


Vex.UI.Toolbar.prototype.handleEvent = function(evt){

	evt.preventDefault();
	switch(evt.target.name){
		case "play":
			this.handler.play();
			break;
		case "stop":
			this.handler.stop();
			break;
	}
};

Vex.UI.Toolbar.prototype.createIcon = function(buttonName, aditionalClasses, disabled){
	var button = document.createElement('button');
	button.type = "button";
	button.name = buttonName;
	button.className = "icon";
	if(aditionalClasses)
		button.className += " " + aditionalClasses;

	if(disabled)
		button.disabled = true;

	button.addEventListener("click", this, false);
	return button;
};



Vex.UI.Toolbar.prototype.createButtonGroup = function(groupName){
	var span = document.createElement('span');
	span.name = groupName;

	span.addEventListener("click", function(evt){
		//when a button within this group is clicked, all other buttons must be enabled
		if(!evt.target.disabled){
			for (var i = 0; i < this.children.length; i++) {
				this.children[i].disabled = false;
			}
		}

		//then disable the current selected button
		evt.target.disabled=true;

	});

	return span;
};

