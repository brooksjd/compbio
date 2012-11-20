//set main namespace
goog.provide('transcriptGame');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Sprite');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');


// entrypoint
transcriptGame.start = function(){

    // Object containing game parameters
    var gameObj = {
        width: 1024,
        height: 768,
        controlsLayerW: 1024,
        controlsLayerH: 384,
        puzzleLayerW: 1024,
        puzzleLayerH: 384

    }


	var director = new lime.Director(document.body,gameObj.width, gameObj.height);
    //director.setDisplayFPS(false);
    director.makeMobileWebAppCapable();    
	var gameScene = new lime.Scene();
    gameScene.setRenderer(lime.Renderer.CANVAS);

    var puzzleLayer = new lime.Layer().setAnchorPoint(0, 0);
    var controlsLayer = new lime.Layer().setAnchorPoint(0, 0);

    gameScene.appendChild(puzzleLayer);
    gameScene.appendChild(controlsLayer);

    var controlsArea = new lime.Sprite().setAnchorPoint(0, 0);
    controlsArea.setPosition(0,gameObj.height-gameObj.controlsLayerH);
    controlsArea.setSize(gameObj.controlsLayerW,gameObj.controlsLayerH);
    controlsArea.setFill('#333333');
    controlsArea.setStroke(1,'#FFF000');
    controlsLayer.appendChild(controlsArea);

    var puzzleArea = new lime.Sprite().setAnchorPoint(0,0)
        .setSize(gameObj.puzzleLayerW,gameObj.puzzleLayerH)
        .setStroke(1,'#FF0000');
    puzzleLayer.appendChild(puzzleArea);

	// set current scene active
	director.replaceScene(gameScene);

}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('transcriptGame.start', transcriptGame.start);
