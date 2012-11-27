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
goog.require('lime.GlossyButton');

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
    for (var i=0; i<4; i++)
    {
        controlSprites[i] = new lime.Sprite().setAnchorPoint(0,0)
            .setSize(gameObj.puzzleTileSize,gameObj.puzzleTileSize)
            .setPosition(exonSprites[i][0].getPosition().x, gameObj.puzzleLayerH+gameObj.controlsLayerH/2-gameObj.puzzleTileSize/2)
            .setFill(exonSprites[i][0].getFill())
            .setOpacity(.1);

        goog.events.listen(controlSprites[i],goog.events.EventType.CLICK,function(e){
            if (this.getOpacity() == .1)
                this.setOpacity(1);
            else
                this.setOpacity(.1);
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
        controlsLayerH: 128,
        puzzleLayerW: 768,
        puzzleLayerH: 640,

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
        controlsLayer.appendChild(controlSprites[i]);
    }

    // Add labels for screenshot purposes
    var label1 = new lime.Label().setAnchorPoint(0,0)
        .setPosition(exonSprites[0][1].getPosition().x+10,exonSprites[0][1].getPosition().y+10)
        .setText('A')
        .setFontColor('#FFFFFF');
    puzzleLayer.appendChild(label1);

    var label2 = new lime.Label().setAnchorPoint(0,0)
        .setPosition(exonSprites[2][2].getPosition().x+10,exonSprites[2][2].getPosition().y+10)
        .setText('A')
        .setFontColor('#FFFFFF');
    puzzleLayer.appendChild(label2);
	
    // Control buttons
    var resetButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(80,40)
        .setColor('#E3E3E3')
        .setText('Reset')
        .setPosition(controlSprites[0].getPosition().x-gameObj.puzzleTileSize-50, controlSprites[0].getPosition().y+gameObj.puzzleTileSize/2);
    controlsLayer.appendChild(resetButton);

    var plusButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(15,15)
        .setColor('#E3E3E3')
        .setText('+')
        .setPosition(controlSprites[controlSprites.length-1].getPosition().x+gameObj.puzzleTileSize+25,controlSprites[controlSprites.length-1].getPosition().y);
    controlsLayer.appendChild(plusButton);

    var minusButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(15,15)
        .setColor('#E3E3E3')
        .setText('-')
        .setPosition(plusButton.getPosition().x, plusButton.getPosition().y+25);
    controlsLayer.appendChild(minusButton);

    // set current scene active
	director.replaceScene(gameScene);

}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('transcriptGame.start', transcriptGame.start);
