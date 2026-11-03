// Labelled sketches of the shapes on the Area & Perimeter and Volume & Surface Area pages.
// Letters match the input boxes. Drawn in currentColor so they follow light and dark mode.

const FILL = 'rgba(251, 174, 61, 0.22)';
const L = ({ x, y, children, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="13" fontStyle="italic" fontFamily="serif" fill="currentColor" stroke="none">{children}</text>
);
const dash = { strokeDasharray: '4 3' };

const DRAW = {
  // ---------- 2D ----------
  square: <><rect x="50" y="20" width="100" height="100" fill={FILL} /><L x={100} y={136}>a</L><L x={160} y={74}>a</L></>,
  rectangle: <><rect x="30" y="35" width="140" height="70" fill={FILL} /><L x={100} y={122}>l</L><L x={182} y={74}>b</L></>,
  'triangle-bh': <><polygon points="30,115 170,115 110,22" fill={FILL} /><line x1="110" y1="22" x2="110" y2="115" style={dash} /><L x={100} y={132}>b</L><L x={120} y={74} anchor="start">h</L></>,
  'triangle-sss': <><polygon points="30,115 170,115 90,22" fill={FILL} /><L x={100} y={132}>c</L><L x={46} y={66}>b</L><L x={140} y={66}>a</L></>,
  circle: <><circle cx="100" cy="70" r="50" fill={FILL} /><line x1="100" y1="70" x2="150" y2="70" /><circle cx="100" cy="70" r="2" fill="currentColor" /><L x={125} y={64}>r</L></>,
  sector: <><path d="M100 110 L170 110 A70 70 0 0 0 135 49.4 Z" fill={FILL} /><path d="M120 110 A20 20 0 0 0 110 92.7" fill="none" /><L x={135} y={126}>r</L><L x={124} y={100} anchor="start">θ</L><L x={162} y={72}>arc</L></>,
  trapezium: <><polygon points="60,30 140,30 175,115 25,115" fill={FILL} /><line x1="100" y1="30" x2="100" y2="115" style={dash} /><L x={100} y={22}>a</L><L x={100} y={132}>b</L><L x={108} y={78} anchor="start">h</L><L x={33} y={70}>c</L><L x={170} y={70}>d</L></>,
  parallelogram: <><polygon points="50,30 180,30 150,115 20,115" fill={FILL} /><line x1="50" y1="30" x2="50" y2="115" style={dash} /><L x={85} y={132}>b</L><L x={58} y={78} anchor="start">h</L><L x={26} y={66}>s</L></>,
  rhombus: <><polygon points="100,15 170,70 100,125 30,70" fill={FILL} /><line x1="30" y1="70" x2="170" y2="70" style={dash} /><line x1="100" y1="15" x2="100" y2="125" style={dash} /><L x={140} y={64}>d₁</L><L x={110} y={104} anchor="start">d₂</L></>,
  polygon: <><polygon points="100,15 152,45 152,105 100,135 48,105 48,45" fill={FILL} /><L x={168} y={78}>s</L><L x={100} y={78}>n sides</L></>,
  ellipse: <><ellipse cx="100" cy="70" rx="80" ry="45" fill={FILL} /><line x1="100" y1="70" x2="180" y2="70" style={dash} /><line x1="100" y1="70" x2="100" y2="25" style={dash} /><L x={140} y={64}>a</L><L x={108} y={50} anchor="start">b</L></>,

  // ---------- 3D ----------
  cube: <><polygon points="40,50 120,50 120,125 40,125" fill={FILL} /><polygon points="40,50 70,25 150,25 120,50" fill={FILL} /><polygon points="120,50 150,25 150,100 120,125" fill={FILL} /><L x={80} y={140}>a</L></>,
  cuboid: <><polygon points="25,60 135,60 135,125 25,125" fill={FILL} /><polygon points="25,60 65,30 175,30 135,60" fill={FILL} /><polygon points="135,60 175,30 175,95 135,125" fill={FILL} /><L x={80} y={140}>l</L><L x={164} y={122}>b</L><L x={14} y={96}>h</L></>,
  cylinder: <><path d="M50 30 L50 112 A50 12 0 0 0 150 112 L150 30" fill={FILL} /><ellipse cx="100" cy="30" rx="50" ry="12" fill={FILL} /><path d="M50 112 A50 12 0 0 1 150 112" style={dash} fill="none" /><line x1="100" y1="30" x2="150" y2="30" /><L x={125} y={24}>r</L><L x={162} y={76} anchor="start">h</L></>,
  cone: <><path d="M45 112 L100 15 L155 112 A55 13 0 0 1 45 112 Z" fill={FILL} /><path d="M45 112 A55 13 0 0 1 155 112" style={dash} fill="none" /><line x1="100" y1="15" x2="100" y2="112" style={dash} /><line x1="100" y1="112" x2="155" y2="112" /><L x={128} y={128}>r</L><L x={106} y={70} anchor="start">h</L><L x={136} y={58} anchor="start">l</L></>,
  frustum: <><path d="M70 35 L40 112 A60 14 0 0 0 160 112 L130 35" fill={FILL} /><ellipse cx="100" cy="35" rx="30" ry="8" fill={FILL} /><path d="M40 112 A60 14 0 0 1 160 112" style={dash} fill="none" /><line x1="100" y1="35" x2="130" y2="35" /><line x1="100" y1="112" x2="160" y2="112" /><line x1="100" y1="35" x2="100" y2="112" style={dash} /><L x={115} y={29}>r</L><L x={130} y={130}>R</L><L x={106} y={78} anchor="start">h</L></>,
  sphere: <><circle cx="100" cy="70" r="55" fill={FILL} /><ellipse cx="100" cy="70" rx="55" ry="14" style={dash} fill="none" /><line x1="100" y1="70" x2="155" y2="70" /><L x={128} y={64}>r</L></>,
  hemisphere: <><path d="M45 95 A55 55 0 0 1 155 95 A55 14 0 0 1 45 95 Z" fill={FILL} /><path d="M45 95 A55 14 0 0 1 155 95" style={dash} fill="none" /><line x1="100" y1="95" x2="155" y2="95" /><L x={128} y={89}>r</L></>,
  prism: <><polygon points="35,115 95,115 65,70" fill={FILL} /><polygon points="65,70 135,35 165,80 95,115" fill={FILL} /><polygon points="95,115 165,80 135,35" fill="none" /><line x1="35" y1="115" x2="105" y2="80" style={dash} /><line x1="105" y1="80" x2="135" y2="35" style={dash} /><line x1="105" y1="80" x2="165" y2="80" style={dash} /><L x={64} y={106}>B</L><L x={140} y={110} anchor="start">h</L></>,
  pyramid: <><polygon points="30,115 130,115 170,85 100,20" fill={FILL} /><polyline points="30,115 100,20 130,115" fill="none" /><line x1="100" y1="20" x2="100" y2="100" style={dash} /><line x1="30" y1="115" x2="70" y2="85" style={dash} /><line x1="70" y1="85" x2="170" y2="85" style={dash} /><L x={80} y={132}>a</L><L x={106} y={62} anchor="start">h</L><L x={128} y={62} anchor="start">l</L></>,
};

export default function ShapeDiagram({ id, title }) {
  const shape = DRAW[id];
  if (!shape) return null;
  return (
    <svg viewBox="0 0 200 145" role="img" aria-label={title ? `Diagram: ${title}` : 'Shape diagram'} className="w-full max-w-[260px] h-auto text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      {shape}
    </svg>
  );
}
