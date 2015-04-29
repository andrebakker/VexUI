Vex.UI.Toolbar = function(handler){
	this.handler = handler;
	var opts = this.handler.options;


	if(opts.canPlay)
		this.handler.container.appendChild(this.createPlayButton());
};


Vex.UI.Toolbar.prototype.handleEvent = function(evt){
	evt.preventDefault();
	switch(evt.target.name){
		case "play":
			this.handler.play();
			break;
	}
};


Vex.UI.Toolbar.prototype.createPlayButton = function(){
	var playButton = document.createElement('input');
	playButton.type = "button";
	playButton.name = "play";
	playButton.value = "Play";
	playButton.addEventListener("click", this, false);
	return playButton;
}