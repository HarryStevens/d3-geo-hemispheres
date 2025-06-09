/* eslint-env mocha */

// See https://github.com/d3/d3-geo-projection/blob/main/test/asserts.js
import assert from "assert";

// This is a weaker test because of an epsilon which is necessary for clipping.
// Some points near the edges can be inverted but not correctly reprojected.
export function assertProjectionEqual(projection, location, point) {
  const projected = projection(location);
  const inverted = projection.invert(point);
  
  assert(
    planarEqual(projected, point, 1e-6) &&
    projection.invert(projected) ? sphericalEqual(inverted, location, 1e-3) : true, 
    `${[inverted, projected]} should be projected equivalents; expected: ${[location, point]}`
  );
}

function planarEqual(actual, expected, delta) {
  return Array.isArray(actual)
      && actual.length === 2
      && inDelta(actual[0], expected[0], delta)
      && inDelta(actual[1], expected[1], delta);
}

function sphericalEqual(actual, expected, delta) {
  return Array.isArray(actual)
      && actual.length === 2
      && longitudeEqual(actual[0], expected[0], delta)
      && inDelta(actual[1], expected[1], delta);
}

function longitudeEqual(actual, expected, delta) {
  actual = Math.abs(actual - expected) % 360;
  return actual <= delta || actual >= 360 - delta;
}

function inDelta(actual, expected, delta) {
  return inDeltaNumber(actual, expected, delta);
}

function inDeltaNumber(actual, expected, delta) {
  return actual >= expected - delta && actual <= expected + delta;
}