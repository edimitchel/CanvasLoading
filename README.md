CanvasLoading
=============

Modular and Customizable Transparent Loading with canvas. Build in Vanilla JS (pure javascript)


Introduction
------------

This plugin is made in pure javascript. __Framework isn't needed__.

It's just made for developer or integrator : it offers the possibility to create a custom loading effect with just a small canvas knowledge. 
3 effects is yet developed but everyone can submit theirs : __Fork it__!

I've developed it fast and i haven't too many experience, so please, be lenient ;)

*This document is writen by a french (not realy good in english, sorry in advance)*

How it works
------------

Canvas Loading use canvas. It generate automaticlly the html canvas element. Just specify the selector to find the place where the plugin will put the loading effect.

Some configuration are required for the initialization of the plugin and the beauty of animation.

### Initialization and usage ###

Follow steps but all aren't required (* required)

* \* Import the javascript plugin (the minified or the development file)

* \* Create your element who it will be use for the loadign effect. You can use any type of element : __block or inline element__. The text inside will be the title of the loading.

		<span id="loading">That is a title!</span>

* \* Choose the effect and write it in class with the prefix. For the moment, 3 effects is available: Circle, Rectangle and Fullpage

		<span id="loading" class="cnvldg-circle">That is a title!</span>

* \* Instantiate a CanvasLoading object as parameters :
	* CSS selector
	* Options

		var cl = new CanvasLoading("#loading", {
			'standAlone' : false
		});


* Add options (see below) in class with format **cl-opt-*optName*:*optvalue* **

		<span id="loading" class="cnvldg-circle cl-opt-counterclockwise">That is a title</span>


The html render :

		<span id="loading">
			<canvas class="cnvldg" width="50" height="50"></canvas>
			<span class="cnvldg-title">That is a title!</span>
		</span>

* \* Run your loading effect with the **show** method. You can specify the running time in milliseconds at first parameter. 
		
		cl.show(5000) // Will show the loading effect during 5 seconds. 

#### Example ####

	<span id="loading">Hey bro', load you please!</span>

	<script src="canvasloading.min.js"></script>
	<script type="text/javascript">
		var cl_c = new CanvasLoading('#loading', {
			'width' : 75,	
			'height' : 75	
		});
		cl_c.show(5000);
	</script>

### Configurations ###

* (__string__) prefix : use to find effect choosen *(default: 'cnvldg')*
* (__string__) prefixOptions : use to find added options *(default: 'cl_opt')*
* (__string__) delimiterPrefix : use delimit prefix and data *(default: '-')*
* (__int__) rate : the rate of loading effect *(default: 15)*
* (__int__) animationrate : the rate of animation *(default: 5)*


### Options ###

* (__int__) width : width of the loading effect *(default: 50)*
* (__int__) height : height of the loading effect *(default: 50)*
* (__boolean__) standAlone : (dis)enable the alone mode (infinite mode) (default: true)
* (__boolean__) hidden : hide on init (default: true)
* (__int__) weight : the weight of stroke line *(default: 5)*
* (__int__) duration : the duration of a standAlone animation *(default: false (not specified))*
* (__color__) backColor : the background color of the loading effect *(default: #eee)*
* (__color__) frontColor : the frontground color of the loading effect *(default: #333)*
* (__boolean__) animationStart : (dis)enable the animation on start *(default: true : fade in)*
* (__boolean__) animationEnd : (dis)enable the animation on end *(default: true : fade out)*
* (__int__) animationTime : time of the animation on start and end if enabled *(default: 200)*

*(not yet implemented)*

* __int__ length : the length of the stroke (for a circle effect)


### Methods ###

* __setOption(option[,name])__ : Add ou replace an option. You can pass an object or a data tuple (optionName and the value)
* __show(time)__ : Show your effect with or not animation
* __hide()__ : Hide your effect with or not animation
* __setProgress(progress)__ : Set the progress of your effect
* __getProgress()__ : Get the progress of your effect 
* __changeStandAloneState(standAlone)__ : Disable or enable the stand alone mode



### Creating your effect ###

A effect is a class. It must implement methods :

* init(object) : Initialization of the effect. Passing of the canvas loading object.

* paint(context) : Use to paint your effect. You can play with it!

*no required methods*

* begin : executed on beginning of effect

* end : executed on endding of effect

* resizeCanvas : use if you want to change the resize function

* getNextProgress : return the next progress value in standAlone mode

* setNextProgress : set the next progress value in standAlone mode

* setAndGetNextProgress : set and get the next progress value in standAlone mode

* setProgress : Override the CanvasLoading method to do condition of the progress entered

* getProgress : Override the CanvasLoading method to change if you want the dimension of your progress.


For example, I'll show you one of three developed effect : the circle effect.

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
		};

		CircleEffect.prototype.resizeCanvas = function(obj) { ... };

		CircleEffect.prototype.paint = function(context) { ... };

		CircleEffect.prototype.getNextProgress = function() { ... };

		CircleEffect.prototype.setNextProgress = function() { ... };

		CircleEffect.prototype.setAndGetNextProgress = function() { ... };

		CircleEffect.prototype.setProgress = function(progress) { ... };

		CircleEffect.prototype.getProgress = function() { ... };
	}
	CanvasLoading.addEffect('circle',CircleEffect);

I've specified a new configuration for this effect and I merge with the other options to have all options.

I've duplicate __this__ with the __that__ variable because I could use it in resizeCanvas when the context can change.

I store the CanvasLoading object in my effect object for make it faster to writen.

When i finish my effect, I hade it with the static method addEffect by entering a label and the Class reference.

__You can see the effect in entire in the code.__


### Debugging ###

Use __LOG__ to log for debug and press __D__ to enable print log. (default: debug disabled)