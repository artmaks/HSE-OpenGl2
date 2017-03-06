/**
 * Created by tema on 06.02.17.
 */

const THREE = require('three');

/** @namespace */
var THREEx	= THREEx || {};

/**
 * Update renderer and camera when the window is resized
 *
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 */
THREEx.WindowResize	= function(renderer, camera){
    var callback	= function(){
        // notify the renderer of the size change
        renderer.setSize( window.innerWidth, window.innerHeight );
        // update the camera
        camera.aspect	= window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    // bind the resize event
    window.addEventListener('resize', callback, false);
    // return .stop() the function to stop watching window resize
    return {
        /**
         * Stop watching window resize
         */
        stop	: function(){
            window.removeEventListener('resize', callback);
        }
    };
}


/// Keyboard State

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
 */
THREEx.KeyboardState	= function()
{
    // to store the current state
    this.keyCodes	= {};
    this.modifiers	= {};

    // create callback to bind/unbind keyboard events
    var self	= this;
    this._onKeyDown	= function(event){ self._onKeyChange(event, true); };
    this._onKeyUp	= function(event){ self._onKeyChange(event, false);};

    // bind keyEvents
    document.addEventListener("keydown", this._onKeyDown, false);
    document.addEventListener("keyup", this._onKeyUp, false);
}

/**
 * To stop listening of the keyboard events
 */
THREEx.KeyboardState.prototype.destroy	= function()
{
    // unbind keyEvents
    document.removeEventListener("keydown", this._onKeyDown, false);
    document.removeEventListener("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS	= {
    'left'		: 37,
    'up'		: 38,
    'right'		: 39,
    'down'		: 40,
    'space'		: 32,
    'pageup'	: 33,
    'pagedown'	: 34,
    'tab'		: 9
};

/**
 * to process the keyboard dom event
 */
THREEx.KeyboardState.prototype._onKeyChange	= function(event, pressed)
{
    // log to debug
    //console.log("onKeyChange", event, pressed, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

    // update this.keyCodes
    var keyCode		= event.keyCode;
    this.keyCodes[keyCode]	= pressed;

    // update this.modifiers
    this.modifiers['shift']= event.shiftKey;
    this.modifiers['ctrl']	= event.ctrlKey;
    this.modifiers['alt']	= event.altKey;
    this.modifiers['meta']	= event.metaKey;
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
 */
THREEx.KeyboardState.prototype.pressed	= function(keyDesc)
{
    var keys	= keyDesc.split("+");
    for(var i = 0; i < keys.length; i++){
        var key		= keys[i];
        var pressed;
        if( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
            pressed	= this.modifiers[key];
        }else if( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 ){
            pressed	= this.keyCodes[ THREEx.KeyboardState.ALIAS[key] ];
        }else {
            pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
        }
        if( !pressed)	return false;
    };
    return true;
}

// Full screen

THREEx.FullScreen	= THREEx.FullScreen	|| {};

/**
 * test if it is possible to have fullscreen
 *
 * @returns {Boolean} true if fullscreen API is available, false otherwise
 */
THREEx.FullScreen.available	= function()
{
    return this._hasWebkitFullScreen || this._hasMozFullScreen;
}

/**
 * test if fullscreen is currently activated
 *
 * @returns {Boolean} true if fullscreen is currently activated, false otherwise
 */
THREEx.FullScreen.activated	= function()
{
    if( this._hasWebkitFullScreen ){
        return document.webkitIsFullScreen;
    }else if( this._hasMozFullScreen ){
        return document.mozFullScreen;
    }else{
        console.assert(false);
    }
}

/**
 * Request fullscreen on a given element
 * @param {DomElement} element to make fullscreen. optional. default to document.body
 */
THREEx.FullScreen.request	= function(element)
{
    element	= element	|| document.body;
    if( this._hasWebkitFullScreen ){
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }else if( this._hasMozFullScreen ){
        element.mozRequestFullScreen();
    }else{
        console.assert(false);
    }
}

/**
 * Cancel fullscreen
 */
THREEx.FullScreen.cancel	= function()
{
    if( this._hasWebkitFullScreen ){
        document.webkitCancelFullScreen();
    }else if( this._hasMozFullScreen ){
        document.mozCancelFullScreen();
    }else{
        console.assert(false);
    }
}

// internal functions to know which fullscreen API implementation is available
THREEx.FullScreen._hasWebkitFullScreen	= 'webkitCancelFullScreen' in document	? true : false;
THREEx.FullScreen._hasMozFullScreen	= 'mozCancelFullScreen' in document	? true : false;

/**
 * Bind a key to renderer screenshot
 * usage: THREEx.FullScreen.bindKey({ charCode : 'a'.charCodeAt(0) });
 */
THREEx.FullScreen.bindKey	= function(opts){
    opts		= opts		|| {};
    var charCode	= opts.charCode	|| 'f'.charCodeAt(0);
    var dblclick	= opts.dblclick !== undefined ? opts.dblclick : false;
    var element	= opts.element

    var toggle	= function(){
        if( THREEx.FullScreen.activated() ){
            THREEx.FullScreen.cancel();
        }else{
            THREEx.FullScreen.request(element);
        }
    }

    var onKeyPress	= function(event){
        if( event.which !== charCode )	return;
        toggle();
    }.bind(this);

    document.addEventListener('keypress', onKeyPress, false);

    dblclick && document.addEventListener('dblclick', toggle, false);

    return {
        unbind	: function(){
            document.removeEventListener('keypress', onKeyPress, false);
            dblclick && document.removeEventListener('dblclick', toggle, false);
        }
    };
};


/// DAY NIGHT

THREEx.DayNight	= {}

THREEx.DayNight.baseURL	= '../'

THREEx.DayNight.currentPhase	= function(sunAngle){
    if( Math.sin(sunAngle) > Math.sin(0) ){
        return 'day'
    }else if( Math.sin(sunAngle) > Math.sin(-Math.PI/6) ){
        return 'twilight'
    }else{
        return 'night'
    }
}


//////////////////////////////////////////////////////////////////////////////////
//		starfield								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.StarField	= function(){
    // create the mesh
    var texture	= THREE.ImageUtils.loadTexture(THREEx.DayNight.baseURL+'images/galaxy_starfield.png')
    var material	= new THREE.MeshBasicMaterial({
        map	: texture,
        side	: THREE.BackSide,
        color	: 0x808080,
    })
    var geometry	= new THREE.SphereGeometry(100, 32, 32)
    var mesh	= new THREE.Mesh(geometry, material)
    this.object3d	= mesh

    this.update	= function(sunAngle){
        var phase	= THREEx.DayNight.currentPhase(sunAngle)
        if( phase === 'day' ){
            mesh.visible	= false
        }else if( phase === 'twilight' ){
            mesh.visible	= false
        } else {
            mesh.visible	= true
            mesh.rotation.y	= sunAngle / 5
            var intensity	= Math.abs(Math.sin(sunAngle))
            material.color.setRGB(intensity, intensity, intensity)
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////
//		SunLight							//
//////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.SunLight	= function(){
    var light	= new THREE.DirectionalLight( 0xffffff, 1 );
    this.object3d	= light

    this.update	= function(sunAngle){
        light.position.x = 0;
        light.position.y = Math.sin(sunAngle) * 90000;
        light.position.z = Math.cos(sunAngle) * 90000;
// console.log('Phase ', THREEx.DayNight.currentPhase(sunAngle))

        var phase	= THREEx.DayNight.currentPhase(sunAngle)
        if( phase === 'day' ){
            light.color.set("rgb(255,"+ (Math.floor(Math.sin(sunAngle)*200)+55) + "," + (Math.floor(Math.sin(sunAngle)*200)) +")");
        }else if( phase === 'twilight' ){
            light.intensity = 1;
            light.color.set("rgb(" + (255-Math.floor(Math.sin(sunAngle)*510*-1)) + "," + (55-Math.floor(Math.sin(sunAngle)*110*-1)) + ",0)");
        } else {
            light.intensity	= 0;
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////
//		SunSphere							//
//////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.SunSphere	= function(){
    var geometry	= new THREE.SphereGeometry( 20, 30, 30 )
    var material	= new THREE.MeshBasicMaterial({
        color		: 0xff0000
    })
    var mesh	= new THREE.Mesh(geometry, material)
    this.object3d	= mesh

    this.update	= function(sunAngle){
        mesh.position.x = 0;
        mesh.position.y = Math.sin(sunAngle) * 400;
        mesh.position.z = Math.cos(sunAngle) * 400;

        var phase	= THREEx.DayNight.currentPhase(sunAngle)
        if( phase === 'day' ){
            mesh.material.color.set("rgb(255,"+ (Math.floor(Math.sin(sunAngle)*200)+55) + "," + (Math.floor(Math.sin(sunAngle)*200)+5) +")");
        }else if( phase === 'twilight' ){
            mesh.material.color.set("rgb(255,55,5)");
        } else {
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////
//		Skydom								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.DayNight.Skydom		= function(){
    var geometry	= new THREE.SphereGeometry( 700, 32, 15 );
    var shader	= THREEx.DayNight.Skydom.Shader
    var uniforms	= THREE.UniformsUtils.clone(shader.uniforms)
    var material	= new THREE.ShaderMaterial({
        vertexShader	: shader.vertexShader,
        fragmentShader	: shader.fragmentShader,
        uniforms	: uniforms,
        side		: THREE.BackSide
    });

    var mesh	= new THREE.Mesh( geometry, material );
    this.object3d	= mesh

    this.update	= function(sunAngle){
        var phase	= THREEx.DayNight.currentPhase(sunAngle)
        if( phase === 'day' ){
            uniforms.topColor.value.set("rgb(0,120,255)");
            uniforms.bottomColor.value.set("rgb(255,"+ (Math.floor(Math.sin(sunAngle)*200)+55) + "," + (Math.floor(Math.sin(sunAngle)*200)) +")");
        } else if( phase === 'twilight' ){
            uniforms.topColor.value.set("rgb(0," + (120-Math.floor(Math.sin(sunAngle)*240*-1)) + "," + (255-Math.floor(Math.sin(sunAngle)*510*-1)) +")");
            uniforms.bottomColor.value.set("rgb(" + (255-Math.floor(Math.sin(sunAngle)*510*-1)) + "," + (55-Math.floor(Math.sin(sunAngle)*110*-1)) + ",0)");
        } else {
            uniforms.topColor.value.set('black')
            uniforms.bottomColor.value.set('black');
        }
    }
}

THREEx.DayNight.Skydom.Shader	= {
    uniforms	: {
        topColor	: { type: "c", value: new THREE.Color().setHSL( 0.6, 1, 0.75 ) },
        bottomColor	: { type: "c", value: new THREE.Color( 0xffffff ) },
        offset		: { type: "f", value: 400 },
        exponent	: { type: "f", value: 0.6 },
    },
    vertexShader	: [
        'varying vec3 vWorldPosition;',
        'void main() {',
        '	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
        '	vWorldPosition = worldPosition.xyz;',
        '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
    ].join('\n'),
    fragmentShader	: [
        'uniform vec3 topColor;',
        'uniform vec3 bottomColor;',
        'uniform float offset;',
        'uniform float exponent;',

        'varying vec3 vWorldPosition;',

        'void main() {',
        '	float h = normalize( vWorldPosition + offset ).y;',
        '	gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );',
        '}',
    ].join('\n'),
}

module.exports = THREEx;