Vex.UI.Toolbar = function(handler){
	this.handler = handler;
	this.buttons = {};
	var opts = this.handler.options;


	if(opts.canPlay){
		this.buttons.play = this.handler.container.appendChild(this.createPlayButton());
		this.buttons.stop = this.handler.container.appendChild(this.createStopButton());
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

Vex.UI.Toolbar.prototype.createIcon = function(buttonName){
	var button = document.createElement('button');
	button.type = "button";
	button.name = buttonName;
	button.className = "icon";
	button.addEventListener("click", this, false);
	return button;
};

Vex.UI.Toolbar.prototype.createPlayButton = function(){
	var button = this.createIcon("play");
	button.className += " icomoon-play";
	return button;
};

Vex.UI.Toolbar.prototype.createStopButton = function(){
	var button = this.createIcon("stop");
	button.className += " icomoon-stop";
	//Stop is initially disabled - it can only be clicked if it's playing
	button.disabled = true;
	return button;
};

