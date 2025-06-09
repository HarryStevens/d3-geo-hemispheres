import { geoAzimuthalEqualAreaRaw, geoCircle, geoProjection } from "d3-geo";
import { geoClipPolygon } from "d3-geo-polygon";

const { abs, cos, PI, sign } = Math;

const epsilon = 1e-6,
      valid = x => typeof x === "number" && !isNaN(x);

export function geoHemispheres(raw = geoAzimuthalEqualAreaRaw) {
  let overlap = 0.15;
  let rotate = [110, 0, 0];
  let width = 100;

  const dy = 2 * raw(0, PI / 2)[1];
  
  const raw2 = (lambda, phi) => {
    if (cos(lambda) > 0) {
      const p = raw(lambda, phi);
      return p && [p[0], p[1] + (1 - overlap) * dy];
    }
    return raw(lambda - PI * sign(lambda), phi);
  };

  raw2.invert = (x, y) => {
    // bottom
    {
      const [l, p] = raw.invert(x, y);
      if (abs(l) < PI / 2 && abs(p) < PI / 2) {
        const [x2, y2] = raw2(l + PI, p);
        if (abs(x - x2) + abs(y - y2) < 1e-2) return [l + PI, p];
      }
    }

    // top
    {
      const [l, p] = raw.invert(x, y - (1 - overlap) * dy);
      const [x1, y1] = raw2(l, p);
      if (abs(x - x1) + abs(y - y1) < 1e-2) return [l, p];
    }
  };
    
  const projection = geoProjection(raw2);
  const _fitSize = projection.fitSize;
  const _preclip = projection.preclip;
  const _rotate = projection.rotate;
  const _translate = projection.translate;
  
  function rebuild(){
    const top = geoProjection(raw)
      .clipAngle(90)
      .fitSize([100, 100 * (1 + overlap)], { type: "Sphere" });
  
    const clip = geoCircle()
      .precision(0.5)
      .radius(90 - epsilon)()
      .coordinates[0].flatMap((p, i) => {
        const [x, y] = top(p);
        return abs(100 - y) < 3 || i % 6 === 0 // more points just near the elbow, for performance
          ? [
              y > 100
                ? top.invert([x, 200 - y]) // mirror
                : p
            ]
          : [];
      });

    const clipGeo = {
      type: "MultiPolygon",
      coordinates: [
        geoCircle().center([-180, 0]).radius(90 - epsilon)().coordinates,
        [clip]
      ]
    };
    
    _preclip.call(projection, geoClipPolygon(clipGeo));
    _fitSize.call(projection, [width, width * 2], { type: "Sphere" });
    _translate.call(projection, [width / 2, width / 2]);
    _rotate.call(projection, rotate);
  }
  
  rebuild();

  projection.overlap = n => valid(n) ? (overlap = n, rebuild(), projection) : overlap;
  projection.rotate = r => Array.isArray(r) && r.every(valid) ? (rotate = r, rebuild(), projection) : rotate;
  projection.width = n => valid(n) ? (width = n, rebuild(), projection) : width;
  
  return projection;
}