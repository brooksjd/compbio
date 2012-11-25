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

// Function to set up puzzle based on puzzle parameters
function initGame(numExons, exonCount, gameObj){

    // Calculate where exon blocks will start
    if (numExons % 2 == 0)
    {
        var blockStart = gameObj.puzzleLayerW/2-(gameObj.puzzleTileSize+gameObj.puzzleTileGap)*(numExons/2);
    }
    else
    {
        var blockStart = gameObj.puzzleLayerW/2-(gameObj.puzzleTileSize+gameObj.puzzleTileGap)*((numExons-1)/2)-gameObj.puzzleTileSize/2;
    }
    var exonSprites = new Array();
    
    colorList = new Array('#FF0000','#00FF00','#0000FF','#FFFF00','#00FFFF','#FF00FF');
    coloridx = 0;

    // Add blocks by column
    for (var i=0; i<numExons; i++)
    {
        exonSprites[i] = new Array();
        for (var j=0; j<exonCount[i]; j++)
        {
            exonSprites[i][j] = new lime.Sprite().setAnchorPoint(0,0)
                .setSize(gameObj.puzzleTileSize,gameObj.puzzleTileSize)
                .setPosition(blockStart, gameObj.puzzleLayerH-40-j*(gameObj.puzzleTileSize+1))
                .setFill(colorList[coloridx]);
            //puzzleLayer.appendChild(exonSprites[i][j]);

        }
        coloridx++;
        if (coloridx == colorList.length)
            coloridx = 0;

        blockStart += gameObj.puzzleTileSize+gameObj.puzzleTileGap;
    }

    return exonSprites;
}


// Add initial row of control sprites
function initControls(exonSprites,gameObj){
    controlSprites = new Array();
    controlSprites[0] = new Array();
    for (var i=0; i<4; i++)
    {
        controlSprites[0][i] = new lime.Sprite().setAnchorPoint(0,0)
            .setSize(gameObj.puzzleTileSize,gameObj.puzzleTileSize)
            .setPosition(exonSprites[i][0].getPosition().x, gameObj.puzzleLayerH+gameObj.controlsLayerH/2-gameObj.puzzleTileSize/2)
            .setFill(exonSprites[i][0].getFill())
            .setOpacity(.25);

        goog.events.listen(controlSprites[0][i],goog.events.EventType.CLICK,function(e){
            if (this.getOpacity() == .25)
                this.setOpacity(1);
            else
                this.setOpacity(.25);
        });
    }

    return controlSprites;
}

// entrypoint
transcriptGame.start = function(){

    // Object containing game parameters
    var gameObj = {
        width: 1024,
        height: 768,
        controlsLayerW: 768,
        controlsLayerH: 192,
        puzzleLayerW: 768,
        puzzleLayerH: 576,

        listLayerW: 256,
        listLayerH: 768,

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
    var listLayer = new lime.Layer().setAnchorPoint(0,0);

    gameScene.appendChild(puzzleLayer);
    gameScene.appendChild(controlsLayer);
    gameScene.appendChild(listLayer);

    var controlsArea = new lime.Sprite().setAnchorPoint(0, 0);
    controlsArea.setPosition(0,gameObj.height-gameObj.controlsLayerH);
    controlsArea.setSize(gameObj.controlsLayerW,gameObj.controlsLayerH);
    controlsArea.setFill('#333333');
    controlsArea.setStroke(1,'#FFF000');
    controlsLayer.appendChild(controlsArea);

    var puzzleArea = new lime.Sprite().setAnchorPoint(0,0)
        .setSize(gameObj.puzzleLayerW,gameObj.puzzleLayerH)
        .setFill('#333333')
        .setStroke(1,'#FF0000');
    puzzleLayer.appendChild(puzzleArea);


    var listArea = new lime.Sprite().setAnchorPoint(0,0)
        .setSize(gameObj.listLayerW,gameObj.listLayerH)
        .setFill('#333333')
        .setPosition(gameObj.width-gameObj.listLayerW,0)
        .setStroke(1,'#00FF00');
    listLayer.appendChild(listArea);

    // Set up initial puzzle configuration
    exonSprites = initGame(numExons,exonCount, gameObj);
    controlSprites = initControls(exonSprites,gameObj);
    for (var i=0; i<numExons; i++)
    {
        for (var j=0; j<exonCount[i]; j++)
        {
            puzzleLayer.appendChild(exonSprites[i][j]);
        }
        controlsLayer.appendChild(controlSprites[0][i]);
    }

	// set current scene active
	director.replaceScene(gameScene);

}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('transcriptGame.start', transcriptGame.start);
