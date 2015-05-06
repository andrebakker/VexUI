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
		this.buttons.quarterNote = noteValuesGroup.appendChild(this.createIcon("quarterNote", "musisync-quarterNote"));
		this.buttons.eightNote = noteValuesGroup.appendChild(this.createIcon("eightNote", "musisync-eightNote"));
		this.buttons.sixteenthNote = noteValuesGroup.appendChild(this.createIcon("sixteenthNote", "musisync-sixteenthNote"));

		this.handler.container.appendChild(noteValuesGroup);


		var restValuesGroup = this.createButtonGroup("restValues");
		this.buttonGroups.restValues = restValuesGroup;

		this.buttons.wholeRest = restValuesGroup.appendChild(this.createIcon("wholeRest", "musisync-wholeRest"));
		this.buttons.halfRest = restValuesGroup.appendChild(this.createIcon("halfRest", "musisync-halfRest"));
		this.buttons.quarterRest = restValuesGroup.appendChild(this.createIcon("quarterRest", "musisync-quarterRest"));
		this.buttons.eightRest = restValuesGroup.appendChild(this.createIcon("eightRest", "musisync-eightRest"));
		this.buttons.sixteenthRest = restValuesGroup.appendChild(this.createIcon("sixteenthRest", "musisync-sixteenthRest"));

		this.handler.container.appendChild(restValuesGroup);
	}
	if(opts.canPlay){
		this.buttons.play = this.handler.container.appendChild(this.createIcon("play", "icomoon-play"));
		this.buttons.stop = this.handler.container.appendChild(this.createIcon("stop", "icomoon-stop", true));
	}



	//Create a Controller that will manage which part of the toolbar will be shown
	this.createTickableController();
};


Vex.UI.Toolbar.prototype.handleEvent = function(evt){
	switch(evt.target.name){
		case "play":
			this.handler.play();
			break;
		case "stop":
			this.handler.stop();
			break;
		case "wholeNote":
			this.handler.updateProvisoryDuration(1);
			break;
		case "halfNote":
			this.handler.updateProvisoryDuration(2);
			break;
		case "quarterNote":
			this.handler.updateProvisoryDuration(4);
			break;
		case "eightNote":
			this.handler.updateProvisoryDuration(8);
			break;
		case "sixteenthNote":
			this.handler.updateProvisoryDuration(16);
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

Vex.UI.Toolbar.prototype.createTickableController = function(){
	var tickableController = this.createButtonGroup("tickableController");
	
	//Create a button for every button group added.
	var groups = Object.keys(this.buttonGroups);
	for(var i = 0; i<groups.length; i++){
		var group = this.buttonGroups[groups[i]];

		var icon = tickableController.appendChild(this.createIcon(group.name));
		icon.innerHTML = group.name;
	}

	this.buttonGroups.tickableController = tickableController;

	//prepend the controller before anything
	this.handler.container.insertBefore(tickableController, this.handler.container.children[0]);
};