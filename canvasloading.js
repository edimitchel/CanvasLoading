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
				var m = merge(o2[i]);
				i = t;
				arr[i] = m;
			}
			else{
				arr[i] = getCorrectValue(o2[i]);
			}
			delete o2[i];
		}
		else
			arr[i] = o1[i];
	}

	for(i in o2){	
		arr[i] = getCorrectValue(o2[i]);
	}

	return arr;
}

function getCorrectValue(val){
	if(typeof val == "string")
	{
		if(!isNaN(parseFloat(val)) && isFinite(val))
			return parseFloat(val);
		else if(stringToBoolean(val) != -1)
			return stringToBoolean(val);
		else
			return val;
	}
	else if(typeof val == "object")
		return val;
	return val;
}

function stringToBoolean(string){
	switch(string.toLowerCase()){
		case "true": case "yes": case "1": return true;
		case "false": case "no": case "0": case null: return false;
	}
	return -1;
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
	return obj === false || typeof obj == 'undefined' || obj == null;
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

function CanvasLoading(selector, options) {
	if(! ( options && typeof options == "object" ))
		options = false;

	this.element = document.querySelector(selector);
	if(isNull(this.element)) {
		throw new Error("The selector aims to a null object.");
		return false;
	}

	this.options = merge(CanvasLoading.defaults,options);
	this.getOptions();

	if(this.options.hidden == true){
		this.element.style.opacity = 0;
	}

	this.type = this.getType();
	this.loop = false;

	this.effect = this.getLoadingEffect();
	this.begin = this.getBegin();
	this.end = this.getEnd();

	this.progress = 0;

	this.init();
	return true;
}

CanvasLoading.effects = {}

CanvasLoading.config = {
	'prefix' 			: 'cnvldg',
	'prefixOptions'		: 'cl-opt',
	'delimiterPrefix'	: '-',
	'rate'				: 15,	
	'animationrate'		: 5	
}

CanvasLoading.defaults = {
	'standAlone'	: true,
	'width'			: 50,
	'height'		: 50,
	'weight' 		: 5,
	'animationStart': true,
	'animationEnd' 	: true,
	'animationTime'	: 200,
	'duration'		: false,
	'clear'			: '#fff',
	'backColor'		: '#eee',
	'frontColor'	: '#333',
	'hidden' 		: true,
	'length' 		: 10
}

CanvasLoading.prototype.init = function() {
	this.canvas = document.createElement('canvas');
	this.canvas.className = CanvasLoading.config.prefix;

	this.title = this.element.innerHTML;

	var title = document.createElement(this.element.nodeName);
	title.className = CanvasLoading.config.prefix+CanvasLoading.config.delimiterPrefix+"title";
	title.innerHTML = this.title;

	this.element.innerHTML = "";

	this.element.appendChild(this.canvas);
	this.element.appendChild(title);
	this.context2D = this.canvas.getContext('2d');

	if(this.options.hidden == true)
		this.element.style.display = '';

	if(!isNull(this.effect.init))
		this.effect.init(this);
	else {
		throw new Error("Effect doesn't implement init method.");
		return false;
	}
	this.resizeCanvas();
	window.onresize = this.effect.resizeCanvas;
};

CanvasLoading.prototype.resizeCanvas = function() {
	// if(this.canvas.height != this.options.height)
		this.canvas.height = this.options.height;
	// if(this.canvas.width != this.options.width)
		this.canvas.width = this.options.width;

	this.options.radius = Math.max(0,this.options.width/2 - this.options.weight/2);
	if(!isNull(this.effect.resizeCanvas))
		this.effect.resizeCanvas();
};

CanvasLoading.prototype.getOptions = function() {
	var classes = this.element.className.split(' ');
	var newClass = [];
	for(var c in classes) {
		var cls = classes[c];
		var indOpt = cls.search(CanvasLoading.config.prefixOptions);
		if(indOpt > -1){
			var option = cls.substring(( CanvasLoading.config.prefixOptions + CanvasLoading.config.delimiterPrefix ).length);
			var optionName = option.substring(0,option.search(':'));
			var optionValue = option.substring(option.search(':')+1);

			this.setOption(optionName,optionValue);
		}
		else newClass.push(cls);
	}
	if(newClass.length == 0)
		this.element.removeAttribute('class');
	else
		this.element.className = newClass.join(' ').trim();
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
		if(time > this.options.animationTime){
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
	} else {
		this.start();
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
	} else {
		this.stop();
	}
};

CanvasLoading.prototype.start = function() {
	var that = this;
	this.stop();
	this.launchBegin();
	this.loop = setInterval(function(){
		that.resizeCanvas();
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
	if(typeof this.effect.paint != "undefined")
		this.effect.paint(this.context2D);
	else {
		this.stop();
		throw new Error("Effect doesn't implement paint method.");
	}
}

CanvasLoading.prototype.getType = function() {
	var classes = this.element.className.split(' ');
	var type;
	for(i in classes) {
		var ps = classes[i].search(CanvasLoading.config.prefix+CanvasLoading.config.delimiterPrefix);
		if(ps > -1){
			type = classes[i].substring((CanvasLoading.config.prefix+CanvasLoading.config.delimiterPrefix).length).toUpperCase();
			
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
	for(var i in CanvasLoading.effects) {
		if(i == this.type)
		{
			return new CanvasLoading.effects[i];
		}
	}
	throw new Error("The effect entered doesn't exist.");
};

CanvasLoading.addEffect = function(name,Class) {
	CanvasLoading.effects[name.toUpperCase()] = Class;
	return true;
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

CanvasLoading.prototype.changeStandAloneState = function(standAlone) {
	this.options.standAlone = standAlone;
	this.show();
};

function CircleEffect(){
	this.config = {
		'startAngle'		: 3/2*Math.PI,
		'roundTime' 		: 2500,
		'withStrokeEffect'	: false,
		'counterclockwise'	: true,
		'fill' 				: false
	};

	var that = this;
	CircleEffect.prototype.init = function(object) {
		this.object = object;
		this.config = merge(this.config,this.object.options);
		this.context = object.context2D;
	};

	CircleEffect.prototype.resizeCanvas = function(obj) {};

	CircleEffect.prototype.paint = function(context) {
		context.clearRect(0,0,this.object.canvas.width,this.object.canvas.height);
		if(this.object.options.standAlone)
			this.setNextProgress();

		var angleB, angleE;

		if(this.config.counterclockwise){
			if(this.getProgress() <= 0.5){
				angleB = this.config.startAngle;
				angleE = angleB-this.object.getProgress()*4*Math.PI;
			}
			else {	
				angleE = this.config.startAngle;
				angleB = angleE-this.object.getProgress()*4*Math.PI;
			}
		} else {
			if(this.getProgress() <= 0.5){
				angleE = this.config.startAngle;
				angleB = angleE+this.object.getProgress()*4*Math.PI;
			}
			else {	
				angleB = this.config.startAngle;
				angleE = angleB+this.object.getProgress()*4*Math.PI;
			}
		}
		
		context.lineWidth = this.object.options.weight * 
			(this.config.withStrokeEffect == true ? 
				(this.getProgress() > 0.5 ? 1-this.getProgress() : this.getProgress()) 
				: 1);

		if(this.config.fill == false) {
			context.beginPath();
			context.arc(this.object.options.width/2,this.object.options.height/2,
				this.object.options.radius,0,2*Math.PI);
			context.strokeStyle = this.object.options.backColor;
			context.stroke();
			context.closePath();

			context.beginPath();
			context.arc(this.object.options.width/2,this.object.options.height/2,
				this.object.options.radius,angleB,angleE,true);
			context.strokeStyle = this.object.options.frontColor;
			context.stroke();
		} else {
			context.beginPath();
			context.arc(this.object.options.width/2,this.object.options.height/2,
				this.object.options.radius,0,2*Math.PI);
			context.lineTo(this.object.options.width/2,this.object.options.height/2);
			context.fillStyle = this.object.options.backColor;
			context.closePath();
			context.fill();

			context.beginPath();
			context.arc(this.object.options.width/2,this.object.options.height/2,
				this.object.options.radius,angleB,angleE,true);
			context.lineTo(this.object.options.width/2,this.object.options.height/2);
			context.fillStyle = this.object.options.frontColor;
			context.closePath();
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
CanvasLoading.addEffect('circle',CircleEffect);

function RectangleEffect(){
	this.config = {
		'direction'	: 'right'
	};

	var that = this;
	RectangleEffect.prototype.init = function(object) {
		this.object = object;
		this.config = merge(this.config,this.object.options);
	};

	RectangleEffect.prototype.resizeCanvas = function(obj) {};

	RectangleEffect.prototype.paint = function(context) {
		context.clearRect(0,0,this.object.canvas.width,this.object.canvas.height);
		if(this.object.options.standAlone)
			this.setNextProgress();

		var left, top, width, height;
		var direction = this.config.direction;
		switch(direction) {
			case 'right':
			case 'left':
				top = 0;
				height = this.object.options.height;
				if(this.getProgress() <= 0.5){
					left = direction == 'left' ? (1 - this.object.getProgress() * 2) * this.object.options.width : 0;
					width = this.object.getProgress() * 2 * this.object.options.width;
				}
				else {	
					left = direction == 'left' ? 0 : (this.object.getProgress()-0.5) * 2 * this.object.options.width;
					width = (1 - (this.object.getProgress() - 0.5) * 2) * this.object.options.width;
				}
			break;
			case 'top':
			case 'bottom':
				left = 0;
				width = this.object.options.width;
				if(this.getProgress() <= 0.5){
					top = direction == 'top' ? (1 - this.object.getProgress() * 2) * this.object.options.height : 0;
					height = this.object.getProgress() * 2 * this.object.options.height;
				}
				else {	
					top = direction == 'top' ? 0 : (this.object.getProgress()-0.5) * 2 * this.object.options.height;
					height = (1 - (this.object.getProgress() - 0.5) * 2) * this.object.options.height;
				}
			break;
		}
				
		context.lineWidth = 0,this.object.options.weight * 
			(this.config.withStrokeEffect == true ? 
				(this.getProgress() > 0.5 ? 1-this.getProgress() : this.getProgress()) 
				: 1);
		if(this.config.fill == false) {
			context.beginPath();
			context.rect(0,0,this.object.options.width,this.object.options.height);
			context.strokeStyle = this.object.options.backColor;
			context.stroke();
			context.closePath();

			context.beginPath();
			context.rect(left,top,width,height);
			context.strokeStyle = this.object.options.frontColor;
			context.stroke();
		} else {
			context.beginPath();
			context.rect(0,0,this.object.options.width,this.object.options.height);
			context.fillStyle = this.object.options.backColor;
			context.closePath();
			context.fill();

			context.beginPath();
			context.rect(left,top,width,height);
			context.fillStyle = this.object.options.frontColor;
			context.closePath();
			context.fill();
		}
	}

	RectangleEffect.prototype.getNextProgress = function() {
		return this.object.getNextProgress(true);
	};

	RectangleEffect.prototype.setNextProgress = function() {
		if(!this.object.options.standAlone)
			this.setProgress(this.getNextProgress());
		else
			this.setProgress(this.getProgress() + CanvasLoading.config.rate/(this.object.options.animationTime*5));
	};

	RectangleEffect.prototype.setAndGetNextProgress = function() {
		this.setNextProgress();
		return this.getProgress();
	};

	RectangleEffect.prototype.setProgress = function(progress) {
		if(progress > 1){
			progress = 0;
		}
		this.object.setProgress(progress);
	};

	RectangleEffect.prototype.getProgress = function() {
		return this.object.getProgress();
	};
}
CanvasLoading.addEffect('rectangle',RectangleEffect);

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

	var that = this;
	FullpageEffect.prototype.init = function(object) {
		this.object = this.object || object;
		this.config = merge(this.config,this.object.options);

		object.element.style.position 	= this.config.position.type;
		object.element.style.top 		= this.config.position.top;
		object.element.style.left 		= this.config.position.left;
		object.element.style.right 		= this.config.position.right;
		object.element.style.bottom 	= this.config.position.bottom;
		object.element.style.width 		= this.config.width;
		object.element.style.height 	= this.config.height;

		object.element.removeChild(object.element.getElementsByTagName('span')[0]);

		that.resizeCanvas();
	};

	FullpageEffect.prototype.resizeCanvas = function(evt) {
		var width = window.innerWidth;
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
		LOG("Loading Fullscreen va commencer!!");
	}

	FullpageEffect.prototype.end = function() {
		LOG("Loading Fullscreen va s'arrêter!!");
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
CanvasLoading.addEffect('fullpage',FullpageEffect);
