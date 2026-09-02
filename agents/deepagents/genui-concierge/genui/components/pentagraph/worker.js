// pentagraph - a Tier-2 generative-UI component (RFC 0056).
//
// Tier 2 is builder JavaScript running in a Web Worker: no DOM, no network, no
// parent access. The worker receives resolved props and returns a serialized
// VNode tree; Dharta's trusted host materializes that tree against a strict
// element and attribute allowlist. That is why the code below only computes
// geometry and describes SVG - it can never touch the page itself.
//
// This must be a classic script with no imports: Dharta runs it verbatim from a
// blob URL inside the host's sandboxed frame.
//
// Protocol
//   in : { type: "render", nonce, props, data }
//   out: { type: "tree",  nonce, tree }   or   { type: "error", nonce, message }
// Echo the nonce back so the host can discard a superseded render. For a
// registered bundle the host sends the same resolved props as both `props` and
// `data`, so read either and prefer `props`.
//
// Declared in component.json:
//   props  : axes (5 strings), values (5 numbers), max (number), color (hex)
//   events : vertex_selected -> { axis, value }, cadence agent_action

var ctx = self;

ctx.onmessage = function (e) {
  var msg = e.data;
  if (!msg || msg.type !== "render") return;
  try {
    var props = msg.props || {};
    var data = msg.data || {};
    ctx.postMessage({ type: "tree", nonce: msg.nonce, tree: buildPentagraph(props, data) });
  } catch (err) {
    ctx.postMessage({ type: "error", nonce: msg.nonce, message: String(err) });
  }
};

var N = 5;
var CX = 120;
var CY = 120;
var R = 84;
var GRID = "#e4e4e7";
var LABEL = "#52525b";

function buildPentagraph(props, data) {
  var values = toNumbers(props.values !== undefined ? props.values : data.values, N);
  var axes = toLabels(props.axes !== undefined ? props.axes : data.axes, N);
  var max = typeof props.max === "number" && props.max > 0 ? props.max : Math.max.apply(null, [1].concat(values));
  var accent = typeof props.color === "string" ? props.color : "#6366f1";

  var gridRings = [0.25, 0.5, 0.75, 1].map(function (fraction) {
    return {
      el: "polygon",
      attrs: { points: ring(fraction * R), fill: "none", stroke: GRID, "stroke-width": 1 },
    };
  });

  var axisLines = series(N).map(function (i) {
    var point = axisPoint(i, R);
    return {
      el: "line",
      attrs: { x1: CX, y1: CY, x2: point[0], y2: point[1], stroke: GRID, "stroke-width": 1 },
    };
  });

  var dataPoints = values.map(function (value, i) {
    return axisPoint(i, (clamp(value, 0, max) / max) * R);
  });

  var dataPolygon = {
    el: "polygon",
    attrs: {
      points: dataPoints
        .map(function (point) {
          return point[0] + "," + point[1];
        })
        .join(" "),
      fill: accent,
      "fill-opacity": 0.18,
      stroke: accent,
      "stroke-width": 2,
    },
  };

  // Each vertex declares an interaction. The worker never sees the click: it
  // only declares the event, and the host wires it and sends it to the agent.
  var vertices = dataPoints.map(function (point, i) {
    return {
      el: "circle",
      attrs: { cx: point[0], cy: point[1], r: 5, fill: accent },
      event: { name: "vertex_selected", context: { axis: axes[i], value: values[i] } },
    };
  });

  var labels = series(N).map(function (i) {
    var point = axisPoint(i, R + 14);
    return {
      el: "text",
      attrs: {
        x: point[0],
        y: point[1],
        "text-anchor": anchor(point[0]),
        "dominant-baseline": "middle",
        "font-size": 11,
        fill: LABEL,
      },
      text: axes[i],
    };
  });

  // The viewBox is padded horizontally so the left and right axis labels are
  // not clipped by the SVG bounds.
  return {
    el: "svg",
    attrs: {
      viewBox: "-36 0 312 264",
      width: 264,
      height: 224,
      role: "img",
      "aria-label": "Pentagraph of " + axes.join(", "),
    },
    children: [{ el: "g", children: gridRings.concat(axisLines, [dataPolygon], vertices, labels) }],
  };
}

function axisPoint(i, radius) {
  var angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [round(CX + radius * Math.cos(angle)), round(CY + radius * Math.sin(angle))];
}

function ring(radius) {
  return series(N)
    .map(function (i) {
      return axisPoint(i, radius).join(",");
    })
    .join(" ");
}

function series(n) {
  var out = [];
  for (var i = 0; i < n; i++) out.push(i);
  return out;
}

function toNumbers(value, n) {
  var arr = Array.isArray(value) ? value : [];
  return series(n).map(function (i) {
    var num = Number(arr[i]);
    return Number.isFinite(num) ? num : 0;
  });
}

function toLabels(value, n) {
  var arr = Array.isArray(value) ? value : [];
  return series(n).map(function (i) {
    return arr[i] === undefined ? "Axis " + (i + 1) : String(arr[i]);
  });
}

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function anchor(x) {
  return x < CX - 4 ? "end" : x > CX + 4 ? "start" : "middle";
}
