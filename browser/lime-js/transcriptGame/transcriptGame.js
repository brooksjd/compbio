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

// Returns idx of a transcript in a list of transcripts, -1 otherwise
function transcriptIdx(currTranscript, transcriptList){
    // Check to see if transcript already exists
    var exists = false;
    var idx = -1;
    for (var i=0; i<transcriptList.length && !exists; i++)
    {
        exists = true;
        for (var j=0; j<currTranscript.length; j++)
        {
            if (transcriptList[i][j] != currTranscript[j])
            {
                exists = false;
                break;
            }
        }

        if (exists)
        {
            idx = i;
        }
    }

    return idx;
}

// Redraws transcript list
function redrawList(transcriptList,transcriptCount,gameObj,listLayer,exonSprites){
    listLayer.removeAllChildren();
    for (var i=0; i<transcriptList.length; i++)
    {
        // Add transcript blocks
        for (var j=0; j<transcriptList[i].length; j++)
        {
            currBlock = new lime.Sprite().setAnchorPoint(0,0)
                .setSize(gameObj.listTileSize,gameObj.listTileSize)
                .setFill(exonSprites[j][0].getFill())
                .setPosition(gameObj.puzzleLayerW+j*(gameObj.listTileSize+gameObj.listTileGap)+5, 5+i*(gameObj.listTileSize+gameObj.listTileGap));
            if (transcriptList[i][j] == 0)
                currBlock.setOpacity(.1);
            listLayer.appendChild(currBlock);
        }

        // Add transcript count
        currLabel = new lime.Label().setAnchorPoint(0,0)
            .setText('x '+transcriptCount[i])
            .setFontColor('#FFFFFF')
            .setPosition(gameObj.width-30,5+i*(gameObj.listTileSize+gameObj.listTileGap));
        listLayer.appendChild(currLabel);
    }
}

// Adds a transcript to the current list and redraws list screen
function addTranscript(currTranscript, transcriptList, transcriptCount){

    // Add transcript to list if new
    var idx = transcriptIdx(currTranscript,transcriptList);
    if (idx == -1)
    {
        transcriptList[transcriptList.length] = currTranscript;
        transcriptCount[transcriptCount.length] = 1;
    }
    else
        transcriptCount[idx]++;

}

// Removes transcript from list if it exists and returns true, otherwise returns false
function removeTranscript(currTranscript,transcriptList,transcriptCount){
    var idx = transcriptIdx(currTranscript,transcriptList);
    
    if (idx == -1)
        return false;
        
    if (transcriptCount[idx] == 1)
    {
        transcriptList.splice(idx,1);
        transcriptCount.splice(idx,1);
    }
    else
        transcriptCount[idx]--;

    return true;
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
        puzzleTileGap: 15,
    
        listTileSize: 10,
        listTileGap: 5
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
    gameScene.appendChild(listArea);

    gameScene.appendChild(listLayer);
    // Set up initial puzzle configuration
    exonSprites = initGame(numExons,exonCount, gameObj);
    controlSprites = initControls(exonSprites,gameObj);
    exonIdxs = new Array();
    for (var i=0; i<numExons; i++)
    {
        for (var j=0; j<exonCount[i]; j++)
        {
            puzzleLayer.appendChild(exonSprites[i][j]);
        }
        exonIdxs[i] = exonSprites[i].length-1;
        controlsLayer.appendChild(controlSprites[i]);
    }

    // Add labels for screenshot purposes
    var label1 = new lime.Label().setAnchorPoint(0,0)
        .setPosition(exonSprites[0][1].getPosition().x+10,exonSprites[0][1].getPosition().y+10)
        .setText('A')
        .setFontColor('#FFFFFF');
    //puzzleLayer.appendChild(label1);

    var label2 = new lime.Label().setAnchorPoint(0,0)
        .setPosition(exonSprites[2][2].getPosition().x+10,exonSprites[2][2].getPosition().y+10)
        .setText('A')
        .setFontColor('#FFFFFF');
    //puzzleLayer.appendChild(label2);
	

    transcriptList = new Array();
    transcriptCount = new Array();

    // Control buttons
    var resetButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(80,40)
        .setColor('#E3E3E3')
        .setText('Reset')
        .setPosition(controlSprites[0].getPosition().x-gameObj.puzzleTileSize-50, controlSprites[0].getPosition().y+gameObj.puzzleTileSize/2);
    controlsLayer.appendChild(resetButton);

    // reset button logic
    goog.events.listen(resetButton, ['mousedown','touchstart'],function(e){
        // Clear transcript lists
        transcriptList = [];
        transcriptCount = [];
        redrawList(transcriptList,transcriptCount,gameObj,listLayer,exonSprites);

        // Reset exon sprites and exon indexes
        for (var i=0; i<exonSprites.length; i++)
        {
            for (var j=0; j<exonSprites[i].length; j++)
            {
                exonSprites[i][j].setOpacity(1);
            }
            exonIdxs[i] = exonSprites[i].length-1;
        }
                
    });

    var plusButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(15,15)
        .setColor('#E3E3E3')
        .setText('+')
        .setPosition(controlSprites[controlSprites.length-1].getPosition().x+gameObj.puzzleTileSize+25,controlSprites[controlSprites.length-1].getPosition().y);
    controlsLayer.appendChild(plusButton);

    // plus button logic
    goog.events.listen(plusButton, ['mousedown','touchstart'],function(e){
        currTranscript = new Array();
        for (var i=0; i<controlSprites.length; i++)
        {
            if (controlSprites[i].getOpacity() == 1)
                currTranscript[i] = 1;
            else
                currTranscript[i] = 0;
        }

        // Check exon availiblity
        var valid = true;
        var allempty = true;
        for (var i=0; i<exonIdxs.length; i++)
        {
            if (currTranscript[i] == 1 && exonIdxs[i] < 0)
            {
                valid = false;
                break;
            }
            else if (currTranscript[i] == 1)
                allempty = false;
        }
        if (valid && !allempty)
        {
            
            for (var i=0; i<exonIdxs.length; i++)
            {
                if (currTranscript[i] == 1)
                {
                    exonSprites[i][exonIdxs[i]].setOpacity(0);
                    exonIdxs[i] = exonIdxs[i]-1;
                }
            }

            addTranscript(currTranscript,transcriptList,transcriptCount);
            redrawList(transcriptList,transcriptCount,gameObj,listLayer,exonSprites);
        }

        // TODO: linked logic
    });

    var minusButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(15,15)
        .setColor('#E3E3E3')
        .setText('-')
        .setPosition(plusButton.getPosition().x, plusButton.getPosition().y+25);
    controlsLayer.appendChild(minusButton);

    // minus button logic
    goog.events.listen(minusButton, ['mousedown','touchstart'],function(e){
        currTranscript = new Array();
        for (var i=0; i<controlSprites.length; i++)
        {
            if (controlSprites[i].getOpacity() == 1)
                currTranscript[i] = 1;
            else
                currTranscript[i] = 0;
        }

        if (removeTranscript(currTranscript,transcriptList,transcriptCount))
        {
            redrawList(transcriptList,transcriptCount,gameObj,listLayer,exonSprites);
            
            // Add blocks back to columns
            for (var i=0; i<exonIdxs.length; i++)
            {
                if (currTranscript[i] == 1)
                {
                    exonIdxs[i]++;
                    exonSprites[i][exonIdxs[i]].setOpacity(1);
                }
            }
        }

        // TODO: linked logic
    });

    // set current scene active
	director.replaceScene(gameScene);

}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('transcriptGame.start', transcriptGame.start);
