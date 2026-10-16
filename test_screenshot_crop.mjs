import {
  regionFromCorners, polygonRegion, isUsableRegion, moveRegion, resizeRegion, fitPicture, roundedRadius,
  regionOutline, closesPolygon, cropSize, SCREENSHOT_SHAPES,
} from './src/app/(Primary.pages)/Playground/utils/screenCapture.js';

/**
 * Insert > Screenshot: choosing a region (the four WPS shapes), moving and resizing it, fitting
 * the captured picture on screen and mapping between screen and picture pixels.
 */

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}
const size = { width: 1920, height: 1080 };

expect('the four WPS screenshot shapes', SCREENSHOT_SHAPES.join(',') === 'rect,oval,rounded,polygon');
let r = regionFromCorners({ x: 500, y: 400 }, { x: 100, y: 200 }, size);
expect('a region from two corners, either way round', r.x === 100 && r.y === 200 && r.w === 400 && r.h === 200, JSON.stringify(r));
r = regionFromCorners({ x: -50, y: 1000 }, { x: 200, y: 1300 }, size);
expect('a region stays inside the picture', r.x === 0 && r.y === 1000 && r.w === 200 && r.h === 80, JSON.stringify(r));
expect('a tiny region is not used', !isUsableRegion({ x: 0, y: 0, w: 2, h: 50 }) && isUsableRegion({ x: 0, y: 0, w: 4, h: 4 }));
const poly = [{ x: 100, y: 100 }, { x: 300, y: 120 }, { x: 200, y: 400 }];
r = polygonRegion(poly, size);
expect('a polygon region is the box around its points', r.x === 100 && r.y === 100 && r.w === 200 && r.h === 300, JSON.stringify(r));
expect('a polygon closes near its first point', closesPolygon(poly, { x: 104, y: 97 }, 10) && !closesPolygon(poly, { x: 150, y: 150 }, 10) && !closesPolygon(poly.slice(0, 2), { x: 100, y: 100 }, 10));

r = moveRegion({ x: 100, y: 100, w: 200, h: 100 }, 5000, -500, size);
expect('moving a region keeps it inside the picture', r.x === 1720 && r.y === 0, JSON.stringify(r));
r = resizeRegion({ x: 100, y: 100, w: 200, h: 100 }, 'se', { x: 500, y: 600 }, size);
expect('resizing from se keeps the top-left', r.x === 100 && r.y === 100 && r.w === 400 && r.h === 500, JSON.stringify(r));
r = resizeRegion({ x: 100, y: 100, w: 200, h: 100 }, 'w', { x: 50, y: 9999 }, size);
expect('resizing from w changes only the left side', r.x === 50 && r.w === 250 && r.y === 100 && r.h === 100, JSON.stringify(r));
r = resizeRegion({ x: 100, y: 100, w: 200, h: 100 }, 'e', { x: 0, y: 0 }, size);
expect('a region cannot be turned inside out', r.x === 100 && r.w >= 4, JSON.stringify(r));

const fit = fitPicture(size, { left: 0, top: 0, width: 1366, height: 900 });
expect('a wide picture fills the width of a narrower screen', Math.abs(fit.width - 1366) < 0.01 && Math.abs(fit.scale - 1366 / 1920) < 1e-9, JSON.stringify([fit.width, fit.scale]));
expect('and is centred vertically', Math.abs(fit.top - (900 - 1080 * fit.scale) / 2) < 0.01);
const p = fit.toPicture({ x: 683, y: 450 });
expect('the centre of the screen is the centre of the picture', Math.abs(p.x - 960) < 0.01 && Math.abs(p.y - 540) < 0.01, JSON.stringify(p));
const back = fit.toScreen({ x: 960, y: 540 });
expect('and back', Math.abs(back.x - 683) < 0.01 && Math.abs(back.y - 450) < 0.01);
expect('positions off the picture land on its edge', fit.toPicture({ x: -100, y: 0 }).x === 0);
const phone = fitPicture({ width: 1170, height: 2532 }, { left: 0, top: 0, width: 390, height: 844 });
expect('a phone screenshot fits a phone screen', Math.abs(phone.scale - 1 / 3) < 0.001, phone.scale);

const region = { x: 10, y: 20, w: 200, h: 100 };
expect('rounded corners: 12% of the shorter side', roundedRadius(region) === 12);
expect('rectangle outline', regionOutline('rect', region) === 'M0 0H200V100H0Z');
expect('oval outline: two half ellipses', regionOutline('oval', region) === 'M0 50A100 50 0 1 0 200 50A100 50 0 1 0 0 50Z', regionOutline('oval', region));
expect('rounded outline has four arcs', (regionOutline('rounded', region).match(/A/g) || []).length === 4);
expect('polygon outline relative to the region', regionOutline('polygon', { x: 100, y: 100, w: 200, h: 300 }, poly) === 'M0 0L200 20L100 300Z', regionOutline('polygon', { x: 100, y: 100, w: 200, h: 300 }, poly));
expect('a polygon of two points falls back to the rectangle', regionOutline('polygon', region, poly.slice(0, 2)) === 'M0 0H200V100H0Z');
expect('crop size in whole pixels', JSON.stringify(cropSize({ x: 0, y: 0, w: 199.6, h: 0.2 })) === '{"width":200,"height":1}');

console.log(`${checks - failed}/${checks} checks passed`);
process.exit(failed ? 1 : 0);
