/*
 * Util : definition of useful functions for the UI process to work properly.
 */

function getStyle(el,styleProp)
{
	var y = null;
	var x = document.getElementById(el);
	if (x.currentStyle)
		y = x.currentStyle[styleProp];
	else if (window.getComputedStyle)
		y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp);
	return y;
};

function getKeyPressedInCanvas(canvas, evt) {
	var unicode = evt.charCode? evt.charCode : evt.keyCode;
	return unicode;
};

function getMousePositionInCanvas(canvas, evt) {
	//pegando apenas os valores de border e padding (eliminando coisas como cor e caracteres de pixel 'px'
	var border = getStyle(canvas.id, 'border-left-width');
	var borderValue = border!=null?border.substring(0, border.indexOf(border.match(/\D/))):0;
	var padding = getStyle(canvas.id, 'padding-left');
	var paddingValue = padding!=null?padding.substring(0, padding.indexOf(padding.match(/\D/))):0;
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left - borderValue - paddingValue,
		y: evt.clientY - rect.top - borderValue - paddingValue,
	};
};


function isCursorWithinRectangle(x, y, width, height, mouseX, mouseY) {
    if(mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) {
        return true;
    }
    return false;
};

function getLastNoteUsed(stave){
	var note = null;
	
	for(var i = 0;  i<stave.getNotes().length; i++ ){
		if(x < stave.getTickables()[i].getBoundingBox().getX())
			note = stave.getTickables()[i];
		if(note!=null)
			break;
	}
	
	return note;
};

function getFirstTickableAfterXPosition(stave, x){
	var note = null;
	
	for(var i = 0;  i<stave.getTickables().length; i++ ){
		if(x < stave.getTickables()[i].getAbsoluteX())
			note = stave.getTickables()[i];
		if(note!=null)
			break;
	}
	
	return note;
};

function getLastTickableBeforeXPosition(stave, x){
	var note = null;
	
	for(var i = stave.getTickables().length - 1;  i>=0; i-- ){
		if(x > stave.getTickables()[i].getAbsoluteX())
			note = stave.getTickables()[i];
		if(note!=null)
			break;
	}
	
	return note;
};


function getStemDirection(stave, y){
	var reference = stave.getYForLine(2);
	
	if(y<reference)
		return Vex.Flow.StaveNote.STEM_DOWN;
	else
		return Vex.Flow.StaveNote.STEM_UP;
};

/**
 * 
 * @param obj1 The first object
 * @param obj2 The second object
 * @returns A new object representing the merged objects. If both objects passed as param have the same prop, then obj2 property is returned.
 */
function mergeProperties(obj1,obj2){
	var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}
