/* eslint-env mocha */

import {geoHemispheres} from "../src/index.js";
import {assertProjectionEqual} from "./asserts.js";

it("geoHemispheres(point) returns the expected values", () => {
  const projection = geoHemispheres();
  assertProjectionEqual(projection, [   0,   0], [ 9.442021, 135.000001]);
  assertProjectionEqual(projection, [   0, -90], [50.000000, 185.000001]);
  assertProjectionEqual(projection, [   0, -45], [20.186898, 166.726442]);
  assertProjectionEqual(projection, [   0,  45], [20.186898, 103.273560]);
  assertProjectionEqual(projection, [   1,   1], [ 9.954326, 134.251271]);
  assertProjectionEqual(projection, [  45,  87], [48.919424,  86.212183]);
});