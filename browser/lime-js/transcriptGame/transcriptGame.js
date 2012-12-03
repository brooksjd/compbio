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
goog.require('transcript.LinkedBlock');



// Function to set up puzzle based on puzzle parameters
function initGame(numExons, exonCount, gameObj, exonWidths){

    var totalWidth = 0;
    for (var i=0; i<numExons; i++)
        totalWidth += exonWidths[i];
    totalWidth += gameObj.puzzleTileGap*(numExons-1);

    // Calculate where exon blocks will start
    /*if (numExons % 2 == 0)
    {
        var blockStart = gameObj.puzzleLayerW/2-(gameObj.puzzleTileSize+gameObj.puzzleTileGap)*(numExons/2);
    }
    else
    {
        var blockStart = gameObj.puzzleLayerW/2-(gameObj.puzzleTileSize+gameObj.puzzleTileGap)*((numExons-1)/2)-gameObj.puzzleTileSize/2;
    }
    */
    blockStart = gameObj.puzzleLayerW/2-totalWidth/2;

    var exonSprites = new Array();
    
    // TODO: add lots more and better colors
    //colorList = new Array('#FF0000','#00FF00','#0000FF','#FFFF00','#00FFFF','#FF00FF');

    // Kelly's max contrast set
    // http://stackoverflow.com/questions/470690/how-to-automatically-generate-n-distinct-colors
    colorList = new Array('#FFB300','#803E75','#FF6800','#A6BDD7','#C10020','#CEA262','#817066','#007D34','#F6768E','#00538A','#FF7A5C',
        '#53377A','#FF8E00','#B32851','#F4C800','#7F180D','#93AA00','#593315','#F13A13','#232C16');

    coloridx = 0;

    // Add blocks by column
    for (var i=0; i<numExons; i++)
    {
        exonSprites[i] = new Array();
        for (var j=0; j<exonCount[i]; j++)
        {
            exonSprites[i][j] = new lime.Sprite().setAnchorPoint(0,0)
                .setSize(exonWidths[i],gameObj.puzzleTileSize)
                .setPosition(blockStart, gameObj.puzzleLayerH-40-j*(gameObj.puzzleTileSize+1))
                .setFill(colorList[coloridx]);
            //puzzleLayer.appendChild(exonSprites[i][j]);

        }
        coloridx++;
        if (coloridx == colorList.length)
            coloridx = 0;

        blockStart += exonWidths[i]+gameObj.puzzleTileGap;
    }

    return exonSprites;
}

// Redraw linked blocks
function redrawLinks(junctions,junctionCount,linkedLayer,exonSprites,exonIdxs,gameObj,exonWidths){
    linkedLayer.removeAllChildren();
    
    // current amount of linked blocks in each column - for stacking linked blocks on top of other linked blocks
    var currLinked = new Array();
    for (var i=0; i<exonIdxs.length; i++)
        currLinked[i] = 0;

    for (var i=0; i<junctionCount.length; i++)
    {
        if (junctionCount[i] > 0)
        {
            for (var j=0; j<junctionCount[i]; j++)
            {
                // Put a linked block in both columns that are linked
                var block1 = new transcript.LinkedBlock().setAnchorPoint(0,0);
                block1.setSizeL(exonWidths[junctions[i][0]],gameObj.puzzleTileSize);
                block1.setFillL(exonSprites[junctions[i][0]][0].getFill(), exonSprites[junctions[i][1]][0].getFill());
                if (exonIdxs[junctions[i][0]] >= 0)
                    block1.setPositionL(exonSprites[junctions[i][0]][0].getPosition().x, exonSprites[junctions[i][0]][exonIdxs[junctions[i][0]]].getPosition().y-(gameObj.puzzleTileSize+1)-currLinked[junctions[i][0]]*(gameObj.puzzleTileSize+1));
                else
                    block1.setPositionL(exonSprites[junctions[i][0]][0].getPosition().x, gameObj.puzzleLayerH-40-currLinked[junctions[i][0]]*(gameObj.puzzleTileSize+1));
                   
                currLinked[junctions[i][0]]++;

                var block2 = new transcript.LinkedBlock().setAnchorPoint(0,0).setSizeL(exonWidths[junctions[i][1]],gameObj.puzzleTileSize)
                    .setFillL(exonSprites[junctions[i][0]][0].getFill(), exonSprites[junctions[i][1]][0].getFill());
                if (exonIdxs[junctions[i][1]] >= 0)
                    block2.setPositionL(exonSprites[junctions[i][1]][0].getPosition().x, exonSprites[junctions[i][1]][exonIdxs[junctions[i][1]]].getPosition().y-(gameObj.puzzleTileSize+1)-currLinked[junctions[i][1]]*(gameObj.puzzleTileSize+1));
                else
                    block2.setPositionL(exonSprites[junctions[i][1]][0].getPosition().x, gameObj.puzzleLayerH-40-currLinked[junctions[i][1]]*(gameObj.puzzleTileSize+1));

                currLinked[junctions[i][1]]++;

                linkedLayer.appendChild(block1);
                linkedLayer.appendChild(block2);
            }
        }
    }

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
function initControls(exonSprites,gameObj,exonWidths){
    controlSprites = new Array();
    for (var i=0; i<exonSprites.length; i++)
    {
        controlSprites[i] = new lime.Sprite().setAnchorPoint(0,0)
            .setSize(exonWidths[i],gameObj.puzzleTileSize)
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
        listLayerH: 640,

        scoreLayerW: 256,
        scoreLayerH: 128,

        puzzleTileSize: 30,
        puzzleTileGap: 15,
    
        listTileSize: 10,
        listTileGap: 5
    }


    // puzzle class
    var puzzle = new function() {
        this.numExons = 0;
        this.exonCount = new Array();
        // this.exonWidths = new Array();
        this.junctions = new Array();    // [exon1] [exon2] [junction count]
        this.exonWidths = new Array();

        // Function for recieving puzzle parameters from server
        // this.getParams () { };
    }

    // Example puzzle (TODO: make puzzle.js object)
    //var numExons = 4;
    //var exonCount = new Array();
    //exonCount[0] = 2;
    //exonCount[1] = 3;
    //exonCount[2] = 3;
    //exonCount[3] = 2;

    // puzzle.getParams();
    puzzle.numExons = 4;
    puzzle.exonCount[0] = 2;
    puzzle.exonCount[1] = 3;
    puzzle.exonCount[2] = 3;
    puzzle.exonCount[3] = 2;
    puzzle.junctions[0] = new Array(0,2,1);
    puzzle.junctions[1] = new Array(0,3,2);

    puzzle.exonWidths = new Array(25,40,30,30);

	var director = new lime.Director(document.body,gameObj.width, gameObj.height);
    //director.setDisplayFPS(false);
    director.makeMobileWebAppCapable();    
	var gameScene = new lime.Scene();
    gameScene.setRenderer(lime.Renderer.CANVAS);

    var puzzleLayer = new lime.Layer().setAnchorPoint(0, 0);
    var controlsLayer = new lime.Layer().setAnchorPoint(0, 0);
    var listLayer = new lime.Layer().setAnchorPoint(0,0);
    var linkedLayer = new lime.Layer().setAnchorPoint(0,0);
    var scoreLayer = new lime.Layer().setAnchorPoint(0,0);

    gameScene.appendChild(puzzleLayer);
    gameScene.appendChild(linkedLayer);
    gameScene.appendChild(controlsLayer);
    gameScene.appendChild(scoreLayer);

    var controlsArea = new lime.Sprite().setAnchorPoint(0, 0);
    controlsArea.setPosition(0,gameObj.height-gameObj.controlsLayerH);
    controlsArea.setSize(gameObj.controlsLayerW,gameObj.controlsLayerH);
    controlsArea.setFill('#333333');
    controlsArea.setStroke(2,255,255,0);
    controlsLayer.appendChild(controlsArea);

    var puzzleArea = new lime.Sprite().setAnchorPoint(0,0)
        .setSize(gameObj.puzzleLayerW,gameObj.puzzleLayerH)
        .setFill('#333333')
        .setStroke(2,255,0,16);
    puzzleLayer.appendChild(puzzleArea);


    var listArea = new lime.Sprite().setAnchorPoint(0,0)
        .setSize(gameObj.listLayerW,gameObj.listLayerH)
        .setFill('#333333')
        .setPosition(gameObj.width-gameObj.listLayerW,0)
        .setStroke(2,43,206,72);
    gameScene.appendChild(listArea);

    var scoreArea = new lime.Sprite().setAnchorPoint(0,0)
        .setSize(gameObj.scoreLayerW,gameObj.scoreLayerH)
        .setFill('#333333')
        .setPosition(gameObj.width-gameObj.scoreLayerW,gameObj.height-gameObj.scoreLayerH)
        .setStroke(2,116,10,255);
    scoreLayer.appendChild(scoreArea);

    gameScene.appendChild(listLayer);
    // Set up initial puzzle configuration
    exonSprites = initGame(puzzle.numExons,puzzle.exonCount, gameObj, puzzle.exonWidths);
    //exonSprites = initGame(numExons,exonCount, gameObj);
    controlSprites = initControls(exonSprites,gameObj,puzzle.exonWidths);
    exonIdxs = new Array();

    // Set up initial count of junctions remaining
    junctionCount = new Array();
    for (var i=0; i<puzzle.junctions.length; i++)
        junctionCount[i] = puzzle.junctions[i][2];
    
    for (var i=0; i<puzzle.numExons; i++)
    {
        for (var j=0; j<puzzle.exonCount[i]; j++)
        {
            puzzleLayer.appendChild(exonSprites[i][j]);
        }
        exonIdxs[i] = exonSprites[i].length-1;
        controlsLayer.appendChild(controlSprites[i]);
    }
    redrawLinks(puzzle.junctions,junctionCount,linkedLayer,exonSprites, exonIdxs, gameObj, puzzle.exonWidths);

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
        .setPosition(controlSprites[0].getPosition().x-puzzle.exonWidths[0]-50, controlSprites[0].getPosition().y+gameObj.puzzleTileSize/2);
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

        // Reset linked block counts
        for (var i=0; i<junctionCount.length; i++)
            junctionCount[i] = puzzle.junctions[i][2];
        redrawLinks(puzzle.junctions,junctionCount,linkedLayer,exonSprites, exonIdxs, gameObj, puzzle.exonWidths);

                
    });

    var plusButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(15,15)
        .setColor('#E3E3E3')
        .setText('+')
        .setPosition(controlSprites[controlSprites.length-1].getPosition().x+puzzle.exonWidths[puzzle.exonWidths.length-1]+25,controlSprites[controlSprites.length-1].getPosition().y);
    controlsLayer.appendChild(plusButton);

    // Score labels
    var scoreTitle = new lime.Label().setAnchorPoint(0,0)
        .setFontSize(25)
        .setFontColor('#C10020')
        .setText("Score:")
        .setOpacity(0)
        .setPosition(scoreArea.getPosition().x+20,scoreArea.getPosition().y+20);
    scoreLayer.appendChild(scoreTitle);

    var scoreValue = new lime.Label().setAnchorPoint(0,0)
        .setFontSize(40)
        .setFontColor('#C10020')
        .setText("0")
        .setOpacity(0)
        .setPosition(scoreTitle.getPosition().x+25,scoreTitle.getPosition().y+40);
    scoreLayer.appendChild(scoreValue);

    // Next puzzle button
    var nextButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(80,40)
        .setColor('#E3E3E3')
        .setText('Next')
        .setOpacity(0)
        .setPosition(scoreArea.getPosition().x+scoreArea.getSize().width/2+40,scoreArea.getPosition().y+scoreArea.getSize().height/2);
    scoreLayer.appendChild(nextButton);
    
    // plus button logic
    goog.events.listen(plusButton, ['mousedown','touchstart'],function(e){
        var currTranscript = new Array();
        var currLinks = new Array();
        var junctionsAffected = new Array();
        for (var i=0; i<controlSprites.length; i++)
        {
            if (controlSprites[i].getOpacity() == 1)
                currTranscript[i] = 1;
            else
                currTranscript[i] = 0;
            currLinks[i] = 0;
        }

        // First check ability to remove linked exon
        for (var i=0; i<puzzle.junctions.length; i++)
        {
            junctionsAffected[i] = 0;
            if (currTranscript[puzzle.junctions[i][0]] == 1 && currTranscript[puzzle.junctions[i][1]] == 1 && junctionCount[i] > 0)
            {
                var unset = true;
                // Check to make sure there are no exons selected in between
                for (var j=puzzle.junctions[i][0]+1; j<puzzle.junctions[i][1]; j++)
                {
                    if (currTranscript[j] == 1)
                        unset = false;
                }

                // If valid link to remove, mark position as viable for junction
                if (unset)
                {
                    currLinks[puzzle.junctions[i][0]] = 1;
                    currLinks[puzzle.junctions[i][1]] = 1;
                    junctionsAffected[i] = 1;
                }

            }
        }

        // Check exon availiblity
        var valid = true;
        var allempty = true;
        for (var i=0; i<exonIdxs.length; i++)
        {
            if (currTranscript[i] == 1 && exonIdxs[i] < 0 && currLinks[i] == 0)
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
                // Removing normal exon
                if (currTranscript[i] == 1 && currLinks[i] == 0)
                {
                    exonSprites[i][exonIdxs[i]].setOpacity(0);
                    exonIdxs[i] = exonIdxs[i]-1;
                }
            }

            for (var i=0; i<junctionsAffected.length; i++)
            {
                if (junctionsAffected[i] == 1)
                    junctionCount[i]--;
            }

            addTranscript(currTranscript,transcriptList,transcriptCount);
            redrawList(transcriptList,transcriptCount,gameObj,listLayer,exonSprites);
            redrawLinks(puzzle.junctions,junctionCount,linkedLayer,exonSprites, exonIdxs, gameObj, puzzle.exonWidths);
        }

        // Check for puzzle completion
        var complete = true;
        for (var i=0; i<exonIdxs.length; i++)
        {
            if (exonIdxs[i] > -1)
                complete = false;
        }

        for (var i=0; i<junctionCount.length; i++)
        {
            if (junctionCount[i] > 0)
                complete = false;
        }

        // Display score and next button if puzzle is complete
        if (complete)
        {
            // var score = computeScore(transcriptList, puzzle);
            scoreTitle.setOpacity(1);
            scoreValue.setOpacity(1);
            // scoreValue.setText(''+score);
            nextButton.setOpacity(1);    
        }   
    });

    var minusButton = new lime.GlossyButton().setAnchorPoint(0,0)
        .setSize(15,15)
        .setColor('#E3E3E3')
        .setText('-')
        .setPosition(plusButton.getPosition().x, plusButton.getPosition().y+25);
    controlsLayer.appendChild(minusButton);

    // minus button logic
    goog.events.listen(minusButton, ['mousedown','touchstart'],function(e){
        var currTranscript = new Array();
        var currLinks = new Array();
        var junctionsAffected = new Array();
        for (var i=0; i<controlSprites.length; i++)
        {
            if (controlSprites[i].getOpacity() == 1)
                currTranscript[i] = 1;
            else
                currTranscript[i] = 0;
            currLinks[i] = 0;
        }

        if (removeTranscript(currTranscript,transcriptList,transcriptCount))
        {
            redrawList(transcriptList,transcriptCount,gameObj,listLayer,exonSprites);
        
            // Check if removed transcript qualifies for linked blocks
            for (i = 0; i<puzzle.junctions.length; i++)
            {
                junctionsAffected[i] = 0;
                if (currTranscript[puzzle.junctions[i][0]] == 1 && currTranscript[puzzle.junctions[i][1]] == 1 && junctionCount[i] < puzzle.junctions[i][2])
                {
                    var unset = true;
                    // Check to make sure there are no exons selected in between
                    for (var j=puzzle.junctions[i][0]+1; j<puzzle.junctions[i][1]; j++)
                    {
                        if (currTranscript[j] == 1)
                            unset = false;
                    }

                    if (unset)
                    {
                        currLinks[puzzle.junctions[i][0]] = 1;
                        currLinks[puzzle.junctions[i][1]] = 1;
                        junctionsAffected[i] = 1;
                    }
                }
            }

            // Add blocks back to columns
            for (var i=0; i<exonIdxs.length; i++)
            {
                if (currTranscript[i] == 1 && currLinks[i] == 0)
                {
                    exonIdxs[i]++;
                    exonSprites[i][exonIdxs[i]].setOpacity(1);
                }
            }

            // Add back valid linked blocks
            for (var i=0; i<junctionsAffected.length; i++)
            {
                if (junctionsAffected[i] == 1)
                    junctionCount[i]++;
            }

            redrawLinks(puzzle.junctions,junctionCount,linkedLayer,exonSprites, exonIdxs, gameObj, puzzle.exonWidths);
        }

    });


    // set current scene active
	director.replaceScene(gameScene);

}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('transcriptGame.start', transcriptGame.start);
