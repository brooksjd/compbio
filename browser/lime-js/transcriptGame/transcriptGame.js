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
        puzzleLayerH: 384,

        puzzleTileSize: 30,
        puzzleTileGap: 15
    }


    // Example puzzle (TODO: make puzzle.js object)
    var numExons = 4;
    var exonCount = new Array();
    exonCount[0] = 2;
    exonCount[1] = 3;
    exonCount[2] = 3;
    exonCount[3] = 2;



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

    // Load puzzle
    // Calculate where exon blocks will start
    if (numExons % 2 == 0)
    {
        var blockStart = gameObj.puzzleLayerW/2-(gameObj.puzzleTileSize+gameObj.puzzleTileGap)*(numExons/2);
    }
    else
    {
        var blockStart = gameObj.puzzleLayerW/2-(gameObj.puzzleTileSize+gameObj.puzzleTileGap)*((numExons-1)/2)-gameObj.puzzleTileSize/2;
    }

    console.log(blockStart);


    // TODO: probably stick into some sort of initialize function
    var exonSprites = new Array();
    // Add blocks by column
    for (var i=0; i<numExons; i++)
    {
        exonSprites[i] = new Array();
        for (var j=0; j<exonCount[i]; j++)
        {
            exonSprites[i][j] = new lime.Sprite().setAnchorPoint(0,0)
                .setSize(gameObj.puzzleTileSize,gameObj.puzzleTileSize)
                .setPosition(blockStart, gameObj.puzzleLayerH-40-j*(gameObj.puzzleTileSize+1))
                .setFill('#FF0000'); // TODO: alternating colors
            puzzleLayer.appendChild(exonSprites[i][j]);

        }
        blockStart += gameObj.puzzleTileSize+gameObj.puzzleTileGap;
    }


	// set current scene active
	director.replaceScene(gameScene);

}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('transcriptGame.start', transcriptGame.start);
