function cameraSetup(distance = 900, angle = Math.PI / 4, dx = 0, dy = 0, dz = 0) {
  const eyeX = distance * Math.cos(angle / 2 - Math.PI * 2 / 6);
  const eyeY = distance * Math.sin(angle / 2 + Math.PI/2);
  const eyeZ = distance * Math.sin(angle*1);
  camera(
    eyeX + dx,
    eyeY + dy,
    eyeZ + dz,
    0 + dx,
    0 + dy,
    0 + dz,
    0, 0, -1
  );
}

// Shared arrow drawing helper for 2D controls canvas (instance-mode p5)
// p: p5 instance
// (x1,y1) -> base point, (x2,y2) -> tip point
// opts: { color, weight, headSize }
function drawArrow(p, x1, y1, x2, y2, opts = {}) {
  const color = opts.color || '#27b562ff';
  const weight = opts.weight != null ? opts.weight : 3;
  const headSize = opts.headSize != null ? opts.headSize : 10;

  // compute device-pixel scaling so stroke weights remain visually consistent
  // when the canvas backing buffer uses a different pixel density than CSS size.
  // Use the canvas element's backing width / client width which is the most
  // reliable across browsers and p5 versions.
  let density = 1;
  try {
    const elt = p && p.canvas && p.canvas.elt;
    if (elt) {
      // `elt.width` is the backing pixel width; `clientWidth` is the CSS width.
      const backing = elt.width || elt.getAttribute && elt.getAttribute('width') || p.width;
      const cssW = elt.clientWidth || (elt.getBoundingClientRect && elt.getBoundingClientRect().width) || p.width;
      if (cssW > 0) density = backing / cssW;
    }
  } catch (e) {
    density = 1;
  }
  const scaledWeight = weight * density;
  const scaledHead = headSize * density;

  p.push();
  p.stroke(color);
  p.strokeWeight(scaledWeight);
  p.fill(color);

  // shaft
  p.line(x1, y1, x2, y2);

  // arrowhead: draw two short lines forming a chevron
  const angle = p.atan2(y2 - y1, x2 - x1);
  p.push();
  p.translate(x2, y2);
  p.rotate(angle);
  p.line(0, 0, -scaledHead, scaledHead / 2);
  p.line(0, 0, -scaledHead, -scaledHead / 2);
  p.pop();

  p.pop();
}

window.drawArrow = drawArrow;
