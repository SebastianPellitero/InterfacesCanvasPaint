var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

var mousePressed = false;
var isEraser = false;
var lastX, lastY;

var eraser = document.getElementById("eraser");
eraser.addEventListener('click', function(){isEraser = true;});

var pencil = document.getElementById("pencil");
pencil.addEventListener('click', function(){isEraser = false;});


function draw(x, y, isDown) {
    if (isDown) {
        context.beginPath();
        if (!isEraser) {
        	context.strokeStyle = document.getElementById("selColor").value;
        } else {
        	context.strokeStyle = "white";
        }
        context.lineWidth = document.getElementById("selWidth").value;
        context.lineJoin = "round";
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
    }
    lastX = x;
    lastY = y;
}

function onMouseDown(e) {
	mousePressed = true;
	let x, y;
	x = e.clientX - this.offsetLeft;
	y = e.clientY - this.offsetTop;
	draw(x,y,false);
}

function onMouseMove(e) {
	if (mousePressed) {
		let x, y;
		x = e.clientX - this.offsetLeft;
		y = e.clientY - this.offsetTop;
        draw(x, y, true);
    }
} 

function stopDrawing(e) {
	mousePressed = false;
}

var clearButton = document.getElementById("clear");
clearButton.addEventListener('click', clearArea);

function clearArea() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}


var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', loadImageonPage, false);

function loadImageonPage(e) {
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);   
}


/*****************************/
/* Filtro por pixel */

function invert(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i]     = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
    }
    context.putImageData(imageData, 0, 0);
};

function brighter(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i]     = 2*data[i]  // red
        data[i + 1] = 2*data[i + 1] // green
        data[i + 2] = 2*data[i + 2] // blue
    }
    context.putImageData(imageData, 0, 0);
};

function blackandwhite(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < imageData.data.length; i+=4) {
        imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = imageData.data[i] > 127 ? 255 : 0;
    }
    context.putImageData(imageData, 0, 0);
}

function sepiascale(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i]     = Math.trunc(0.393*data[i] + 0.769*data[i + 1] + 0.189*data[i + 2]); // red
        data[i + 1] = Math.trunc(0.349*data[i] + 0.686*data[i + 1] + 0.168*data[i + 2]); // green
        data[i + 2] = Math.trunc(0.272*data[i] + 0.534*data[i + 1] + 0.131*data[i + 2]); // blue
    }
    context.putImageData(imageData, 0, 0);
};

function grayscale(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i]     = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    context.putImageData(imageData, 0, 0);
};

var negativeFilter = document.getElementById('negative');
negativeFilter.addEventListener('click', function(){ invert(context)});

var brightFilter = document.getElementById('brillo');
brightFilter.addEventListener('click', function(){ brighter(context)});

var binarizFilter = document.getElementById('blackwhite');
binarizFilter.addEventListener('click', function(){ blackandwhite(context)});

var sepiaFilter = document.getElementById('sepia');
sepiaFilter.addEventListener('click', function(){ sepiascale(context)});

var grayFilter = document.getElementById('gray');
grayFilter.addEventListener('click', function(){ grayscale(context)});

/* filtro por imagen*/

function saturate(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var data = imageData.data;
    var value = 1;
    for (var i = 0; i < data.length; i += 4) {
        var gray = 0.2989*data[i] + 0.5870*data[i+ 1] + 0.1140*data[i + 2]; //weights from CCIR 601 spec
        data[i] = -gray * value + data[i] * (1 + value);
        data[i + 1] = -gray * value + data[i + 1] * (1 + value);
        data[i + 2] = -gray * value + data[i + 2] * (1 + value);
        if(data[i] > 255) data[i] = 255;
        if(data[i + 1] > 255) data[i] = 255;
        if(data[i + 2] > 255) data[i] = 255;
        if(data[i] < 0) data[i] = 0;
        if(data[i + 1] < 0) data[i] = 0;
        if(data[i + 2] < 0) data[i] = 0;
    }    
    ctx.putImageData(imageData, 0, 0);
}

function convolute(imageData, pixels) {
    var side = Math.round( Math.sqrt(pixels.length) );
    var halfs = Math.floor(side/2);
    
    var data = imageData.data;
    var sw = imageData.width;
    var sh = imageData.height;
    var w = sw;
    var h = sh;
    var output = context.createImageData(w, h);
    var dataOutput = output.data;
    for ( var y=0; y < h; y++ ) {
        for ( var x=0; x < w; x++ ) {
        var sy = y;
        var sx = x;
        var dataOuti = ( y * w + x ) * 4;
        let r=0, g=0, b=0, a=0;
        for ( var cy=0; cy < side; cy++ ) {
            for ( var cx=0; cx<side; cx++ ) {
            var scy = sy + cy - halfs;
            var scx = sx + cx - halfs;
            if ( scy >= 0 && scy < sh && scx >= 0 && scx < sw ) {
                var datai = ( scy * sw + scx) *4;
                var wt = pixels[cy * side + cx];
                r += data[datai] * wt;
                g += data[datai + 1] * wt;
                b += data[datai + 2] * wt;
                a += data[datai + 3] * wt;
            }
            }
        }
        dataOutput[dataOuti] = r;
        dataOutput[dataOuti + 1] = g;
        dataOutput[dataOuti + 2] = b;
        dataOutput[dataOuti + 3] = 255;
        }
    }
    context.putImageData(output, 0,0);
}

function blur(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    convolute(imageData, [  1/9, 1/9, 1/9,
                            1/9, 1/9, 1/9,
                            1/9, 1/9, 1/9 ]);
}

function border(ctx) {
    var imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    convolute(imageData, [   0, -1,  0,
                            -1,  5, -1,
                             0, -1,  0]); 
}

var saturateFilter = document.getElementById('saturation');
saturateFilter.addEventListener('click', function(){ saturate(context)}); 

var blurFilter = document.getElementById('blur');
blurFilter.addEventListener('click', function(){ blur(context)}); 

var borderFilter = document.getElementById('bordes');
borderFilter.addEventListener('click', function(){ border(context)});

var save = document.getElementById('save');

save.addEventListener('click', function(e) {
    this.href = canvas.toDataURL();
    this.download = "mypainting.png";
}, false);