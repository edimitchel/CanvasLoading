function merge(object_1, object_2) {
	if( isNull(object_1) ^ isNull(object_2))
		return isNull(object_1) ? object_2 : object_1;
	var arr = {};
	var o1 = object_1;
	var o2 = object_2;

	for(i in o1){
		if(typeof o2[i] != 'undefined'){
			if(typeof o1[i] == 'object' && typeof o2[i] == 'object'){
				delete arr[i];
				var t = i;
				var m = merge(o1[i],o2[i]);
				i = t;
				arr[i] = m;
			}
			else{
				arr[i] = o2[i];
			}
			delete o2[i];
		}
		else
			arr[i] = o1[i];
	}

	for(i in o2)
		arr[i] = o2[i];

	return arr;
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function isNull(obj){
	return obj === false || typeof obj == 'undefined';
}

// FOR DEBUGGING
var DEBUG = false;

window.onkeydown = function(evt){
	if(evt.keyCode == 68){
		DEBUG = !DEBUG;
		console.log('MODE DEBUG IS '+ ((DEBUG) ? 'ON' : 'OFF'));		
	}
}

function LOG (args) {
	if(DEBUG == true){
		console.log(arguments);
	}
}


/*
	TODO :
	- gérer le loading indéterminé
	- 

*/
function CanvasLoading(selector, options) {
	if(! ( options && typeof options == "object" ))
		options = false;

	this.element = document.querySelector(selector);
	this.options = merge(this.default,options);
	this.type = this.getType();
	this.loop = false;

	this.effect = this.getLoadingEffect();
	this.begin = this.getBegin();
	this.end = this.getEnd();

	this.progress = 0;

	this.init();
}

CanvasLoading.config = {
	'prefix' 			: 'cnvldg',
	'delimiterPrefix'	: '-',
	'rate'				: 15,	
	'animationrate'		: 5	
}

CanvasLoading.prototype.default = {
	'standAlone'	: true,
	'radius' 		: 15,
	'longer' 		: 10,
	'weight' 		: 5,
	'animationStart': true,
	'animationEnd' 	: true,
	'animationTime'	: 200,
	'duration'		: false,
	'width'			: 50,
	'height'		: 50,
	'clear'			: '#fff',
	'backColor'		: '#eee',
	'frontColor'	: '#333'
}

CanvasLoading.TypesEffect = {
	CIRCLE 		: 'CIRCLE',
	RECTANGLE 	: 'RECTANGLE',
	FULLPAGE 	: 'FULLPAGE'
};

CanvasLoading.prototype.init = function() {
	this.canvas = document.createElement('canvas');
	this.canvas.className = CanvasLoading.config.prefix;
	this.canvas.width = this.options.width;
	this.canvas.height = this.options.height;
	this.title = this.element.innerHTML;
	var span = document.createElement('span');
	span.className = CanvasLoading.config.prefix+CanvasLoading.config.delimiterPrefix+"title";
	span.innerHTML = this.title;

	this.element.innerHTML = "";

	this.element.appendChild(this.canvas);
	this.element.appendChild(span);
	this.context2D = this.canvas.getContext('2d');

	this.effect.init(this);
	window.onresize = this.effect.resizeCanvas;
	window.onload = this.effect.resizeCanvas;
};

CanvasLoading.prototype.setOption = function(option,value) {
	var opt;
	if(typeof option == "string") {
		opt = {}; 
		var val = value || null;
		var key = option.toString();
		opt[key] = val;
	} else if(typeof option == "object") {
		opt = option;
	}
	this.options = merge(this.options,opt);
}

CanvasLoading.prototype.show = function(time) {
	var ele;
	var that = this;
	var mustHideAfter = false;
	this.startTime = new Date().getTime();

	if(time && typeof time == "number"){
		if(time > this.options.animationTime && this.options.standAlone){
			time = Math.abs(parseInt(time));
			this.options.duration = time;
			setTimeout(function() {
				if(that.startTime == that.getStartTime())
					that.hide();
			},time);
		} else if(time < that.options.animationTime) {
			mustHideAfter = true;
		}
	}

	if(this.options.animationStart === true){
		ele = this.element;
		ele.style.opacity = ele.style.opacity || 0;
		this.start();
		var inter = setInterval(function(){
			if(parseFloat(ele.style.opacity) < 1){
				ele.style.opacity = parseFloat(ele.style.opacity) +  1 / (that.options.animationTime / CanvasLoading.config.animationrate); 
			} else {
				ele.style.opacity = 1;
				clearInterval(inter);
				if(mustHideAfter === true)
					that.hide();
			}
		}, CanvasLoading.config.animationrate);
	}
};

CanvasLoading.prototype.hide = function() {
	var ele;
	var that = this;
	if(this.options.animationEnd === true){
		ele = that.element;
		ele.style.opacity = ele.style.opacity || 1;
		var inter = setInterval(function(){
			if(parseFloat(ele.style.opacity) >= 0.05){
				ele.style.opacity = parseFloat(ele.style.opacity) - 1 / (that.options.animationTime / CanvasLoading.config.animationrate); 
			} else {
				ele.style.opacity = 0;
				clearInterval(inter);
				that.stop();
			}
		} , CanvasLoading.config.animationrate);
	}
};

CanvasLoading.prototype.start = function() {
	var that = this;
	this.stop();
	this.launchBegin();
	this.loop = setInterval(function(){
		that.paint();
	},CanvasLoading.config.rate);
}

CanvasLoading.prototype.stop = function() {
	if(this.loop !== false){
		clearInterval(this.loop);
		this.launchEnd();
	}
}

CanvasLoading.prototype.paint = function() {
	this.effect.paint(this.context2D);
}

CanvasLoading.prototype.getType = function() {
	var classes = this.element.className.split(' ');
	var type;
	for(i in classes) {
		var ps = classes[i].search(CanvasLoading.config.prefix+CanvasLoading.config.delimiterPrefix);
		if(ps > -1){
			type = classes[i].substring((CanvasLoading.config.prefix+CanvasLoading.config.delimiterPrefix).length).toUpperCase();
			var isGoodType = false;
			for(var prop in CanvasLoading.TypesEffect) {
			    if(CanvasLoading.TypesEffect[prop] === type) {
			    	isGoodType = true;
			    	break;
			    }
			}
			if(isGoodType === false)
				break;

			delete classes[i];
			if(classes.length == 0)
				this.element.removeAttribute("class");
			else
				this.element.className = classes.join(" ").trim();
			return type;
		}
	}
	throw new Error("No type canvas loading effect found : " + type + ". Please read documentation.");
};

CanvasLoading.prototype.getLoadingEffect = function() {
	switch(this.type){
		case CanvasLoading.TypesEffect.CIRCLE :
			return new CircleEffect();
		break;
		case CanvasLoading.TypesEffect.RECTANGLE :
			return new RectangleEffect();
		break;
		case CanvasLoading.TypesEffect.FULLPAGE :
			return new FullpageEffect();
		break;
	}
};

CanvasLoading.prototype.getNextProgress = function(def) {
	if(this.options.standAlone){
		if(typeof this.effect.getNextProgress != "undefined" && this.options.duration === false && (typeof def != "undefined" && !def))
			return this.effect.getNextProgress();
		else
			return ((new Date().getTime())-this.startTime) / (this.options.duration || this.options.animationTime*10);	
	}
	else 
		return this.getProgress();
};

CanvasLoading.prototype.setAndGetNextProgress = function() {
	this.setProgress(this.getNextProgress());
	return this.getProgress();
};

CanvasLoading.prototype.setProgress = function(pourcentage, ignoreStandAlone) {
	if(this.options.standAlone === true || (typeof ignoreStandAlone != 'undefined' && ignoreStandAlone === true)){
		if(this.progress != pourcentage)
			this.progress = pourcentage;
	} else if( this.options.standAlone === false ) {
		var diff = pourcentage - this.getProgress();
		var that = this;
		var inter_transition = setInterval(function(){
			if(diff > 0 && that.getProgress() <= pourcentage 
				|| diff < 0 && that.getProgress() >= pourcentage)
			{
				that.setProgress(that.getProgress() + diff/(that.options.animationTime/CanvasLoading.config.rate),true);
			} else {
				that.setProgress(pourcentage,true);
				clearInterval(inter_transition);
			}
		}, CanvasLoading.config.rate);
	}
};

CanvasLoading.prototype.getProgress = function() {
	return this.progress;
};

CanvasLoading.prototype.getStartTime = function() {
	return this.startTime;
};

CanvasLoading.prototype.getBegin = function() {
	return (typeof this.effect.begin != "undefined") ? this.effect.begin : false;
};

CanvasLoading.prototype.getEnd = function() {
	return (typeof this.effect.end != "undefined") ? this.effect.end : false;
};

CanvasLoading.prototype.launchBegin = function() {
	if(this.begin !== false)
		this.begin();
};

CanvasLoading.prototype.launchEnd = function() {
	if(this.end !== false)
		this.end();
};

CanvasLoading.prototype.launchEnd = function() {
	if(this.end !== false)
		this.end();
};

CanvasLoading.prototype.changeStandAloneState = function(standAlone) {
	this.options.standAlone = standAlone;
	this.show();
};

/*
 	Effect Type Classes
 	Must implement methods :
 	- init(object) : Pass the Canvas Loading Objet for getting infos
 	- resizeCanvas(event) : On resize and on load of document
 	- paint(context) : Execute on paint

 	Optional methods:
	- begin : Started on begin of loading
	- end : Started on end of loading
	- getNextProgress : An extends of getNextProgress of CanvasLoading Object


*/

function CircleEffect(){
	this.config = {
		'startAngle'		: 3/2*Math.PI,
		'roundTime' 		: 2500,
		'withStrokeEffect'	: false,
		'counterclockwise'	: true,
		'fill' 				: false
	};

	var that;
	CircleEffect.prototype.init = function(object) {
		that = this;
		this.object = object;
		this.config = merge(this.config,this.object.options);
		this.context = object.context2D;

	};

	CircleEffect.prototype.resizeCanvas = function(obj) {};

	CircleEffect.prototype.paint = function(context) {
		context.fillStyle = this.object.options.clear;
		context.fillRect(0,0,this.object.canvas.width,this.object.canvas.height);
		if(this.object.options.standAlone)
			this.setNextProgress();

		if(this.config.counterclockwise){
			if(this.getProgress() <= 0.5){
				var angleB = this.config.startAngle;
				var angleE = angleB-this.object.getProgress()*4*Math.PI;
			}
			else {	
				var angleE = this.config.startAngle;
				var angleB = angleE-this.object.getProgress()*4*Math.PI;
			}
		} else {
			if(this.getProgress() <= 0.5){
				var angleE = this.config.startAngle;
				var angleB = angleE+this.object.getProgress()*4*Math.PI;
			}
			else {	
				var angleB = this.config.startAngle;
				var angleE = angleB+this.object.getProgress()*4*Math.PI;
			}
		}
		
		context.lineWidth = this.object.options.weight * 
			(this.config.withStrokeEffect == true ? 
				(this.getProgress() > 0.5 ? 1-this.getProgress() : this.getProgress()) 
				: 1);

		//BackColor
		context.beginPath();
		context.arc(this.object.options.width/2,this.object.options.height/2,
			this.object.options.radius,0,2*Math.PI);
		context.strokeStyle = this.object.options.backColor;
		context.stroke();

		context.beginPath();
		context.arc(this.object.options.width/2,this.object.options.height/2,
			this.object.options.radius,angleB,angleE,true);
		if(this.config.fill == false) {
			context.strokeStyle = "#333";
			context.stroke();
		} else {
			context.fillStyle = "#ccc";
			context.fill();
		}
	};

	CircleEffect.prototype.getNextProgress = function() {
		return this.getProgress() + CanvasLoading.config.rate/this.config.roundTime*2;
	};

	CircleEffect.prototype.setNextProgress = function() {
		this.setProgress(this.getNextProgress());
	};

	CircleEffect.prototype.setAndGetNextProgress = function() {
		this.setNextProgress();
		return this.getProgress();
	};

	CircleEffect.prototype.setProgress = function(progress) {
		if(progress > 1) progress = 0;
		this.object.setProgress(progress);
	};

	CircleEffect.prototype.getProgress = function() {
		return this.object.getProgress();
	};
}

function RectangleEffect(){
	RectangleEffect.prototype.init = function(object) {
		
	};

	RectangleEffect.prototype.resizeCanvas = function(obj) {

	};

	RectangleEffect.prototype.paint = function(context) {
		
	};
}

function FullpageEffect(){
	this.config = {
		'position' : {
			'type' 	: 'fixed',
			'top'	: 0,
			'left'	: 0,
			'right'	: 0,
			'bottom': 'auto'
		}
	}
	var that;
	FullpageEffect.prototype.init = function(object) {
		that = this;
		this.object = object;
		this.config = merge(this.config,this.object.options);

		object.element.style.position 	= this.config.position.type;
		object.element.style.top 		= this.config.position.top;
		object.element.style.left 		= this.config.position.left;
		object.element.style.right 		= this.config.position.right;
		object.element.style.bottom 	= this.config.position.bottom;
		object.element.style.width 		= this.config.width;
		object.element.style.height 	= this.config.height;
		//object.canvas.style.float = "none";

		object.element.removeChild(object.element.getElementsByTagName('span')[0]);
	};

	FullpageEffect.prototype.resizeCanvas = function(evt) {
		var width = window.innerWidth;
		that.object.canvas.width = width;
		that.object.options.width = width;
	};

	FullpageEffect.prototype.paint = function(context) {
		context.clearRect(0,0,parseFloat(this.object.options.width),parseFloat(this.object.options.height));
		this.setNextProgress();

		context.beginPath();
		context.fillStyle = this.object.options.backColor;
		context.rect(0,0,parseFloat(this.object.options.width),parseFloat(this.object.options.height));
		context.closePath();
		context.fill();

		var x,y,w,h;

		if(this.getProgress() < 1){
			x = 0;
			y = 0;
			w = this.object.options.width*this.getProgress();
			h = this.object.options.height;
		} else {
			x = this.object.options.width*(this.getProgress()-1);
			y = 0;
			w = this.object.options.width*(1-(this.getProgress()-1));
			h = this.object.options.height;
		}

		context.beginPath();
		context.fillStyle = this.object.options.frontColor;
		context.rect(x,y,parseFloat(w),parseFloat(h));
		context.closePath();
		context.fill();
	};

	FullpageEffect.prototype.begin = function() {
		//alert(this.object.title);
		LOG("Loading Fullscreen va commencer!!")
	}

	FullpageEffect.prototype.end = function() {
		LOG("Loading Fullscreen va s'arrêter!!")
	}

	FullpageEffect.prototype.getNextProgress = function() {
		return this.object.getNextProgress(true);
	};

	FullpageEffect.prototype.setNextProgress = function() {
		if(!this.object.options.standAlone)
			this.setProgress(this.getNextProgress());
		else
			this.setProgress(this.getProgress() + CanvasLoading.config.rate/(this.object.options.animationTime*5));
	};

	FullpageEffect.prototype.setAndGetNextProgress = function() {
		this.setNextProgress();
		return this.getProgress();
	};

	FullpageEffect.prototype.setProgress = function(progress) {
		if(progress > 2){
			progress = 0;
		}
		this.object.setProgress(progress);
	};

	FullpageEffect.prototype.getProgress = function() {
		return this.object.getProgress();
	};
}
