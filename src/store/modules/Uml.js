var pushed: any = 0;
var lastClientX: any, lastClientY: any;
var newScrollX: any, newScrollY: any;
var dragContainer: any;

function svgMouseDown (e: any) {
  pushed = 1;
  lastClientX = e.clientX;
  lastClientY = e.clientY;
  e.preventDefault();
}

function svgMouseMove (e: any) {
  if (pushed) {
    let scroller: any = dragContainer.scroller || dragContainer;
    // Figure out how much we moved inside the client
    newScrollX =  e.clientX - lastClientX;
    newScrollY = e.clientY - lastClientY;
    // Move scroll window
    scroller.scrollLeft -= newScrollX;
    scroller.scrollTop -= newScrollY;
    // Save our position for next time this handler is triggered
    lastClientX = e.clientX;
    lastClientY = e.clientY;
  }
}

function svgMouseUp (e) {
  pushed = 0;
  e.preventDefault();
}

function draggableSvg (dragDiv: any, svgObject: any) {
  dragContainer = dragDiv;
  let svg: any = svgObject.contentDocument;
  svg.onmousedown = svgMouseDown;
  svg.onmousemove = svgMouseMove;
  svg.onmouseup = svgMouseUp;
}

window.onload = function () {
  draggableSvg(
    document.getElementById('svgContainer'),
    document.getElementById('svgObject')
  );
}
