goog.provide('transcript.LinkedBlock');
goog.require('lime.Sprite');
goog.require('lime.Layer');

transcript.LinkedBlock = function() {
    goog.base(this);
    
    this.half1 = new lime.Sprite().setAnchorPoint(0,0);
    this.half2 = new lime.Sprite().setAnchorPoint(0,0);

    this.appendChild(this.half1);
    this.appendChild(this.half2);    
}

goog.inherits(transcript.LinkedBlock,lime.Layer);

// Set fill
transcript.LinkedBlock.prototype.setFillL = function(color1, color2){
    this.half1.setFill(color1);
    this.half2.setFill(color2);

    return this;
};

// Set size
transcript.LinkedBlock.prototype.setSizeL = function(width,height){
    this.half1.setSize(width/2,height);
    this.half2.setSize(width/2,height);

    return this;
};

// Set Position
transcript.LinkedBlock.prototype.setPositionL = function(x,y){
    this.half1.setPosition(x,y);
    this.half2.setPosition(x+this.half1.getSize().width,y)

    return this;
};

