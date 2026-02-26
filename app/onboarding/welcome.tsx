import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  APP_BG_BASE,
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  TEXT_PRIMARY,
  TEXT_MUTED,
} from '@/src/data/colors';

const { width: W, height: H } = Dimensions.get('window');

// Figma canvas dimensions
const DW = 414;
const DH = 896;

// Scale a Figma pixel x-value to device width
function sx(v: number) { return (v / DW) * W; }
// Scale a Figma pixel y-value to device height
function sy(v: number) { return (v / DH) * H; }

// Convert Figma CSS inset percentages [top%, right%, bottom%, left%] to
// explicit {position, top, left, width, height} so Image components are
// properly bounded. Using top+right+bottom+left alone does NOT constrain
// Image size in React Native — explicit width/height is required.
function inset(t: number, r: number, b: number, l: number) {
  const top    = (t / 100) * H;
  const left   = (l / 100) * W;
  const width  = W * (1 - l / 100 - r / 100);
  const height = H * (1 - t / 100 - b / 100);
  return { position: 'absolute' as const, top, left, width, height };
}

// ─── Figma MCP assets (served from localhost:3845) ───────────────────────────
const A = {
  frame: 'http://localhost:3845/assets/145176154ef11b441702f38ef74f778b37240ee6.svg',
  logo:  'http://localhost:3845/assets/57475c2c4701a23321374a1145d2bcefb8e8f58d.svg',
  g0:  'http://localhost:3845/assets/39dbd834c10eb94eb5371e3d5763217f357c9609.svg',
  g1:  'http://localhost:3845/assets/fab1d2d183fe5debc53e039116b7929ea4c2d4b1.svg',
  g2:  'http://localhost:3845/assets/a3af4d7ad97856e519a74128bfa9a4ff543ea121.svg',
  g3:  'http://localhost:3845/assets/9c4eb0c1b4247a0142960397b8eb06f1abad621d.svg',
  v0:  'http://localhost:3845/assets/facc77f9e85fc3e5b97af86a6541fc6fbc579d73.svg',
  g4:  'http://localhost:3845/assets/1fb790b4fdf2566d8fa357f5f69a978b9887f49e.svg',
  g5:  'http://localhost:3845/assets/5f6aa1a8438afa142035c646b65284da3b9829dd.svg',
  g6:  'http://localhost:3845/assets/d1231fc7ff94484ed3c6487800e97d594c3df658.svg',
  g7:  'http://localhost:3845/assets/7ea09692e22ee05cd607004c025e5cc350f77d79.svg',
  v1:  'http://localhost:3845/assets/cc08691f37abdeba426ec44ec19a824b80da640a.svg',
  v2:  'http://localhost:3845/assets/f6bca9e52f8696c1e5783313e458eea3f6bcd033.svg',
  v3:  'http://localhost:3845/assets/5e5e0806678199274c89dc4704c542500eb50d0d.svg',
  g8:  'http://localhost:3845/assets/8beeeca479f5740579dad11cc5be9565dd7f827e.svg',
  g9:  'http://localhost:3845/assets/2a4370b1ee88a1ae9a6507935a816b46c31bc59e.svg',
  g10: 'http://localhost:3845/assets/7714da82ec1461fef4a31fdb6e232001bbad7ccf.svg',
  g11: 'http://localhost:3845/assets/870b0748b923124fce18373454249b16d204090c.svg',
  g12: 'http://localhost:3845/assets/c7835e35400c453824659ecc55ccf24507413961.svg',
  g13: 'http://localhost:3845/assets/74b11a9a4d660b8bac75443c5a3f74ecaca99783.svg',
  g14: 'http://localhost:3845/assets/aac47f84af0c8442f8de2a0eaa13f30fa2b33eaa.svg',
  g15: 'http://localhost:3845/assets/55e5d422fe3dfab0484e13fe4ae8015f8898ee75.svg',
  g16: 'http://localhost:3845/assets/5749a3485f0d2cef9e51928ef072f80db9d9e071.svg',
  g17: 'http://localhost:3845/assets/76afdfe371f0551a74bf2f45de3eca14521c2c27.svg',
  g18: 'http://localhost:3845/assets/a6a2a0589d627a36a51137a046ac886835477c2b.svg',
  g19: 'http://localhost:3845/assets/be321aed739b7db3638291809a861ba607c81aac.svg',
  g20: 'http://localhost:3845/assets/cc91476e72275712964099ec203b7ce8eaba25c0.svg',
  g21: 'http://localhost:3845/assets/4102a4e9c8a0d39cd70c77c4ae58af6f14bf761c.svg',
  g22: 'http://localhost:3845/assets/edccc7aba521719a9fb1e754e15c08d6830d4b57.svg',
  g23: 'http://localhost:3845/assets/3576b6bfbf426dcffc92d3b549f63ed1c148d17e.svg',
  g24: 'http://localhost:3845/assets/8670e125728928013f25aa056ca1d7143d403dd3.svg',
  g25: 'http://localhost:3845/assets/f294d75a45032bf5cb46ec2fe9c26328cccb903d.svg',
  g26: 'http://localhost:3845/assets/50b8fddb1bc1b1a0e851bcfab201b6c5f5262b27.svg',
  g27: 'http://localhost:3845/assets/b4286ca4b21c0b765ac2d681749b6b35981d6526.svg',
  g28: 'http://localhost:3845/assets/652bc777f5ab0c18ad548dbef468e423cc3d5d55.svg',
  g29: 'http://localhost:3845/assets/c0444e5b2af0e94abfea9dfa2a144c2777776d3c.svg',
  g30: 'http://localhost:3845/assets/293563f7c6537a25de97d6bdebea8c2ac7580e1a.svg',
  g31: 'http://localhost:3845/assets/a2f71a8ead13b7f0b3fd08d1ec2d66e557ed81fd.svg',
  g32: 'http://localhost:3845/assets/8f3fd7a168a432d90d1a6d736c10facac1e440b5.svg',
  g33: 'http://localhost:3845/assets/733b51f255a9a09d187388473bbc7536a456fbfd.svg',
  g34: 'http://localhost:3845/assets/f56743400aabfe1f3fbe33d07072ba14ed27d1a6.svg',
  g35: 'http://localhost:3845/assets/35d1fe930f108f401c3046563c8cccf12ad26f8f.svg',
  g36: 'http://localhost:3845/assets/07c3431e1fba9fef8c7105e78ae9d107f9eb1b4d.svg',
  g37: 'http://localhost:3845/assets/dcaa19dba5848334db74cdea8cd17ab79ac08a19.svg',
  g38: 'http://localhost:3845/assets/997326c0285ee32b11f125562115a928db659631.svg',
  v4:  'http://localhost:3845/assets/830cc17c88fdb666c7d7b085dcc66cdd5be05743.svg',
  v5:  'http://localhost:3845/assets/8e182c8ca4c0aa8cecb8a47753596f39be501691.svg',
  v6:  'http://localhost:3845/assets/b2a0b3a03f751e885ae2b7d45cc260f994eb60b0.svg',
  v7:  'http://localhost:3845/assets/4d46f9f80b78dfd4098c987d5b462e9f682890b9.svg',
  v8:  'http://localhost:3845/assets/d34137047babafee90dc5cf4a1df35c7e733fea8.svg',
  v9:  'http://localhost:3845/assets/f2b2089a47fab08685fc922de18b664617544e99.svg',
  g39: 'http://localhost:3845/assets/ac235ad69e07d2a612a01a57c1e38d4e1a562966.svg',
  g40: 'http://localhost:3845/assets/643ebec06658bf88a34bb2b5469ac60823bf8a00.svg',
  v10: 'http://localhost:3845/assets/c4e4682130bf51917d195d4b490b480443174c3d.svg',
  v11: 'http://localhost:3845/assets/8594bafd3fe94fbcaa6e3b4a74c596a5656d750e.svg',
  g41: 'http://localhost:3845/assets/7e863e6e850b893f6e1181372b854bb55cb2e34b.svg',
  g42: 'http://localhost:3845/assets/d43957532ae52bcfc79ae89efc08cae19d131b48.svg',
  g43: 'http://localhost:3845/assets/a62af2e8a26f838f50c0591d0a4b7c6644fed3e6.svg',
  g44: 'http://localhost:3845/assets/6cc01e4c6878e35feea26c24b465b0cd5a0830d5.svg',
  v12: 'http://localhost:3845/assets/be38aa6d35e474c76d66e98eaa6da8ad4677bc2e.svg',
  g45: 'http://localhost:3845/assets/d0b0b353ee8570399f65085d62872d22497fbbdf.svg',
  v13: 'http://localhost:3845/assets/d29ee2ac20b38ee83d9a39d8ca1b1862dfb6fd5d.svg',
  v14: 'http://localhost:3845/assets/c71b99719d3c4bedf0d55478a2652b1b872df79c.svg',
  v15: 'http://localhost:3845/assets/44f424018ae722d4555f2318b666c4962c2bc6c5.svg',
  v16: 'http://localhost:3845/assets/221aa7b539cdeaeaee8f470c8a53a805dd2c0e35.svg',
  v17: 'http://localhost:3845/assets/d73695320488fdbcd349493ec8edd13e8431c095.svg',
  v18: 'http://localhost:3845/assets/1ffdbe986efbd8e7896e21e56e529b6a1128751f.svg',
  v19: 'http://localhost:3845/assets/500c3f38c482cda9d1367c2ddf5b1dbf5f0e1818.svg',
  v20: 'http://localhost:3845/assets/3075cf76ef4c60728a0398bda06ce737f918f89f.svg',
  v21: 'http://localhost:3845/assets/758471b91c28ed0bce27e5e3098d0b0318480772.svg',
  v22: 'http://localhost:3845/assets/1b6b90018a1bf453420abf524665287614059110.svg',
  g46: 'http://localhost:3845/assets/0e6f0d6b135d5acfeed4beb291f0014fb109527b.svg',
  g47: 'http://localhost:3845/assets/355ec56cb937c8689c3a42d0af0ca1d3cfda3b77.svg',
  v23: 'http://localhost:3845/assets/61d7bc3d77530e35e880552eea4f921e568b6abe.svg',
  v24: 'http://localhost:3845/assets/5d1cc92081fd5f891468fec38ef187865f1cb2eb.svg',
  v25: 'http://localhost:3845/assets/c65091df1946fc9be266c6586145688d44d96641.svg',
  v26: 'http://localhost:3845/assets/ef3c196c6929743c5447ad4f224301c5d85694a8.svg',
  v27: 'http://localhost:3845/assets/c0f2387100e16f28ff11480738e4d770bcc97fa2.svg',
  g48: 'http://localhost:3845/assets/7888431d3f072058aacee100590a46542a441f9e.svg',
  g49: 'http://localhost:3845/assets/1f3df99757e30f7e633df1793335e3ebd83caa3e.svg',
  g50: 'http://localhost:3845/assets/4984c020a80db0b0f75bff4a2743191e8cd2d8e5.svg',
  g51: 'http://localhost:3845/assets/b6cad0242854c7983a67d08b5cd084e59a253552.svg',
  g52: 'http://localhost:3845/assets/bb13096b96ed1bdf8a8b676b951128ed4ab799d3.svg',
  g53: 'http://localhost:3845/assets/78504381d131f45375e8a457a7c75a9c19e35d44.svg',
  g54: 'http://localhost:3845/assets/c450d4683f90427888c5ef3ff26972654399de48.svg',
  g55: 'http://localhost:3845/assets/4038f7b9e95731f96d6ae9536aec05e99fe07efc.svg',
  g56: 'http://localhost:3845/assets/d1fcd01230beeaf12875ea163d661f1bec72ab24.svg',
  g57: 'http://localhost:3845/assets/3c7efe1d39d580acc3c5e8a615fc1c28ec0c2ea4.svg',
  g58: 'http://localhost:3845/assets/fe8fd48427b708c22e30c8b3fa3d5f8c8cd95067.svg',
  g59: 'http://localhost:3845/assets/210444dc9204d4527ef0b57dc622e51658874c1f.svg',
  g60: 'http://localhost:3845/assets/b71bb6d7e39473f7b84e727e7160a6bd1d2d57d5.svg',
  g61: 'http://localhost:3845/assets/374facdfac50bc20c0fde4f472ee1075d45ca399.svg',
  g62: 'http://localhost:3845/assets/53f58e9ab240177c7dd50bd178e32460abbeec58.svg',
  line: 'http://localhost:3845/assets/204702aab16b75cf70cdcaccb2abe9d95357c63f.svg',
};

// Shorthand: Image with inset-derived bounds + contain resize
function Img({ uri, t, r, b, l }: { uri: string; t: number; r: number; b: number; l: number }) {
  return <Image source={{ uri }} style={inset(t, r, b, l)} resizeMode="contain" />;
}

// ─── Illustration pieces – all positioned absolutely relative to full screen ──
// Mirrors Figma's "contents" group: children inherit screen as containing block.
function Illustration() {
  return (
    <>
      {/* Main groups – furniture, lamp, plant, couch, character */}
      <Img uri={A.g0}  t={43.42} r={10.83} b={55.06} l={ 9.83} />
      <Img uri={A.g1}  t={26.21} r={29.76} b={72.93} l={68.72} />
      <Img uri={A.g2}  t={28.03} r={87.23} b={71.11} l={11.24} />
      <Img uri={A.g3}  t={39.72} r={30.52} b={59.41} l={67.95} />
      <Img uri={A.v0}  t={23.66} r={46.70} b={75.56} l={51.61} />
      <Img uri={A.g4}  t={40.15} r={ 9.92} b={55.60} l={71.72} />
      <Img uri={A.g5}  t={36.61} r={14.74} b={59.67} l={80.31} />
      <Img uri={A.g6}  t={29.82} r={12.10} b={59.86} l={83.73} />
      <Img uri={A.g7}  t={36.95} r={21.34} b={59.98} l={72.58} />
      <Img uri={A.v1}  t={22.97} r={82.60} b={57.01} l={16.42} />
      <Img uri={A.v2}  t={42.83} r={78.09} b={56.28} l={11.92} />
      <Img uri={A.v3}  t={17.86} r={76.22} b={76.75} l={10.04} />

      {/* Star / sparkle column (g8–g22) */}
      <Img uri={A.g8}  t={22.19} r={88.59} b={77.44} l={10.48} />
      <Img uri={A.g9}  t={22.19} r={87.53} b={77.44} l={11.54} />
      <Img uri={A.g10} t={22.19} r={86.59} b={77.44} l={12.47} />
      <Img uri={A.g11} t={22.19} r={85.53} b={77.44} l={13.53} />
      <Img uri={A.g12} t={22.19} r={84.60} b={77.44} l={14.47} />
      <Img uri={A.g13} t={22.19} r={83.54} b={77.44} l={15.53} />
      <Img uri={A.g14} t={22.19} r={82.60} b={77.44} l={16.46} />
      <Img uri={A.g15} t={22.19} r={81.54} b={77.44} l={17.52} />
      <Img uri={A.g16} t={22.19} r={80.61} b={77.44} l={18.46} />
      <Img uri={A.g17} t={22.19} r={79.55} b={77.44} l={19.52} />
      <Img uri={A.g18} t={22.19} r={78.61} b={77.44} l={20.45} />
      <Img uri={A.g19} t={22.19} r={77.55} b={77.44} l={21.51} />
      <Img uri={A.g20} t={22.19} r={76.61} b={77.44} l={22.45} />
      <Img uri={A.g21} t={21.93} r={76.90} b={77.99} l={10.81} />
      <Img uri={A.g22} t={22.75} r={76.44} b={77.16} l={10.30} />

      {/* Plant and surrounding decoratives (g23–g38) */}
      <Img uri={A.g23} t={31.14} r={66.99} b={64.72} l={25.13} />
      <Img uri={A.g24} t={33.08} r={72.60} b={62.69} l={22.99} />
      <Img uri={A.g25} t={30.03} r={74.53} b={65.64} l={23.30} />
      <Img uri={A.g26} t={30.57} r={78.42} b={65.34} l={15.87} />
      <Img uri={A.g27} t={31.55} r={76.76} b={61.82} l={18.75} />
      <Img uri={A.g28} t={24.39} r={74.92} b={69.81} l={21.83} />
      <Img uri={A.g29} t={29.99} r={69.10} b={65.34} l={25.60} />
      <Img uri={A.g30} t={26.88} r={71.66} b={66.90} l={23.60} />
      <Img uri={A.g31} t={29.09} r={76.52} b={62.21} l={22.26} />
      <Img uri={A.g32} t={24.78} r={76.04} b={69.88} l={20.35} />
      <Img uri={A.g33} t={29.59} r={78.45} b={65.71} l={16.86} />
      <Img uri={A.g34} t={37.32} r={71.34} b={56.09} l={17.57} />
      <Img uri={A.g35} t={31.16} r={70.01} b={65.98} l={26.50} />
      <Img uri={A.g36} t={26.38} r={77.71} b={70.61} l={21.56} />
      <Img uri={A.g37} t={30.81} r={79.39} b={66.36} l={18.17} />
      <Img uri={A.g38} t={28.24} r={72.70} b={67.98} l={24.48} />

      {/* Character body vectors */}
      <Img uri={A.v4}  t={28.76} r={36.82} b={61.96} l={38.24} />
      <Img uri={A.v5}  t={36.59} r={39.77} b={61.96} l={41.19} />
      <Img uri={A.v6}  t={38.04} r={39.77} b={58.28} l={39.71} />
      <Img uri={A.v7}  t={41.72} r={36.97} b={57.73} l={38.38} />
      <Img uri={A.v8}  t={42.27} r={59.40} b={56.02} l={38.24} />
      <Img uri={A.v9}  t={42.27} r={36.82} b={56.02} l={60.82} />

      {/* Tablet / couch area (g39–g47, v10–v12) */}
      <Img uri={A.g39} t={25.89} r={47.76} b={67.60} l={34.36} />
      <Img uri={A.g40} t={30.28} r={58.61} b={65.59} l={31.22} />
      <Img uri={A.v10} t={33.12} r={59.55} b={64.15} l={32.34} />
      <Img uri={A.v11} t={33.12} r={58.81} b={58.28} l={35.58} />
      <Img uri={A.g41} t={26.30} r={56.08} b={72.98} l={41.80} />
      <Img uri={A.g42} t={29.00} r={48.52} b={70.12} l={49.61} />
      <Img uri={A.g43} t={27.81} r={52.51} b={71.78} l={46.65} />
      <Img uri={A.g44} t={27.18} r={50.56} b={67.60} l={34.35} />
      <Img uri={A.v12} t={33.81} r={60.41} b={59.22} l={34.55} />
      <Img uri={A.g45} t={27.76} r={54.42} b={70.69} l={42.52} />
      <Img uri={A.v13} t={30.10} r={56.30} b={68.12} l={40.30} />
      <Img uri={A.v14} t={30.10} r={56.81} b={69.02} l={40.30} />
      <Img uri={A.v15} t={26.75} r={55.66} b={69.28} l={37.05} />

      {/* Leg / foot vectors */}
      <Img uri={A.v16} t={27.24} r={39.04} b={67.98} l={53.44} />
      <Img uri={A.v17} t={29.07} r={18.98} b={68.67} l={69.23} />
      <Img uri={A.v18} t={29.08} r={27.22} b={69.01} l={69.23} />
      <Img uri={A.v19} t={28.33} r={27.54} b={63.41} l={50.93} />
      <Img uri={A.v20} t={32.56} r={18.16} b={63.32} l={69.23} />
      <Img uri={A.v21} t={32.56} r={25.32} b={64.62} l={69.23} />
      <Img uri={A.v22} t={29.07} r={28.37} b={63.41} l={51.29} />

      {/* Headphone / head area (g46–g62) */}
      <Img uri={A.g46} t={29.58} r={25.46} b={62.24} l={46.65} />
      <Img uri={A.g47} t={32.36} r={27.40} b={62.24} l={46.65} />
      <Img uri={A.v23} t={33.12} r={30.92} b={64.15} l={60.96} />
      <Img uri={A.v24} t={33.12} r={34.17} b={58.28} l={60.23} />
      <Img uri={A.v25} t={33.81} r={33.26} b={59.22} l={61.70} />
      <Img uri={A.v26} t={28.12} r={43.63} b={63.82} l={31.89} />
      <Img uri={A.v27} t={28.68} r={57.51} b={65.67} l={31.89} />
      <Img uri={A.g48} t={31.71} r={49.68} b={67.07} l={47.08} />
      <Img uri={A.g49} t={28.75} r={57.41} b={70.75} l={41.27} />
      <Img uri={A.g50} t={29.51} r={57.26} b={70.14} l={40.56} />
      <Img uri={A.g51} t={28.29} r={59.93} b={71.37} l={38.86} />
      <Img uri={A.g52} t={29.06} r={60.54} b={70.85} l={39.06} />
      <Img uri={A.g53} t={28.83} r={59.22} b={70.80} l={39.36} />
      <Img uri={A.g54} t={28.72} r={60.13} b={71.07} l={39.57} />
      <Img uri={A.g55} t={28.72} r={59.38} b={71.13} l={40.44} />
      <Img uri={A.g56} t={28.22} r={56.65} b={71.60} l={43.10} />
      <Img uri={A.g57} t={28.35} r={56.67} b={71.30} l={41.89} />
      <Img uri={A.g58} t={28.16} r={57.31} b={71.62} l={42.46} />
      <Img uri={A.g59} t={28.50} r={57.90} b={71.38} l={41.80} />
      <Img uri={A.g60} t={26.40} r={36.80} b={70.65} l={57.33} />
      <Img uri={A.g61} t={26.45} r={55.32} b={70.32} l={36.12} />
      <Img uri={A.g62} t={27.23} r={60.63} b={69.49} l={35.36} />
    </>
  );
}

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      {/* ── Wave / backdrop ─────────────────────────────────────────────── */}
      <Image
        source={{ uri: A.frame }}
        style={styles.waveBackground}
        resizeMode="cover"
      />

      {/* ── Logo: "Bath ● Sommelier" ────────────────────────────────── */}
      <View style={styles.logoRow}>
        <Text style={styles.logoWord}>Bath</Text>
        <Image source={{ uri: A.logo }} style={styles.logoIcon} resizeMode="contain" />
        <Text style={styles.logoWord}>Sommelier</Text>
      </View>

      {/* ── Illustration (all SVG pieces absolutely placed) ───────────── */}
      <Illustration />

      {/* ── Headline & subtitle ───────────────────────────────────────── */}
      <View style={styles.textBlock}>
        <Text style={styles.heading}>나만의 목욕 루틴</Text>
        <Text style={styles.subtitle}>
          {'당신에게 꼭 맞는 입욕 레시피를\n지금 바로 시작해보세요'}
        </Text>
      </View>

      {/* ── CTA button ──────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.signUpButton}
        activeOpacity={0.85}
        onPress={() => router.push('/onboarding')}
      >
        <Text style={styles.signUpLabel}>시작하기</Text>
      </TouchableOpacity>

      {/* ── Secondary link ───────────────────────────────────────────── */}
      <TouchableOpacity style={styles.loginRow} activeOpacity={0.7}>
        <Text style={styles.loginBase}>
          이미 사용 중이신가요?{' '}
          <Text style={styles.loginLink}>건너뛰기</Text>
        </Text>
      </TouchableOpacity>

      {/* ── Bottom indicator line ─────────────────────────────────────── */}
      <Image source={{ uri: A.line }} style={styles.bottomLine} resizeMode="contain" />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },

  // Wavy cream background: Figma absolute left:-3 top:0 w:423 h:504
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: sx(-3),
    width: sx(423),
    height: sy(504),
  },

  // Logo row: centred, top ≈ 50px
  logoRow: {
    position: 'absolute',
    top: sy(50),
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sx(7),
  },
  logoIcon: {
    width: sx(30),
    height: sx(30),
  },
  logoWord: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: sx(16),
    letterSpacing: 3.84 * (W / DW),
    color: TEXT_PRIMARY,
  },

  // Text block: heading starts at 59.6% of height
  textBlock: {
    position: 'absolute',
    top: (59.6 / 100) * H,
    left: (16.91 / 100) * W,
    right: (16.91 / 100) * W,
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: sy(30),
    lineHeight: sy(30) * 1.35,
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: sy(16),
    fontFamily: 'System',
    fontWeight: '300',
    fontSize: sy(16),
    lineHeight: sy(16) * 1.65,
    color: TEXT_MUTED,
    textAlign: 'center',
  },

  // CTA button: left:20 top:705 width:374 height:63 radius:38
  signUpButton: {
    position: 'absolute',
    top: sy(705),
    left: sx(20),
    right: sx(20),
    height: sy(63),
    backgroundColor: BTN_PRIMARY,
    borderRadius: sy(38),
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpLabel: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: sy(14),
    letterSpacing: 0.7 * (W / DW),
    color: BTN_PRIMARY_TEXT,
  },

  // Secondary link – centred row at top:788
  loginRow: {
    position: 'absolute',
    top: sy(788),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loginBase: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: sy(14),
    letterSpacing: 0.7 * (W / DW),
    color: TEXT_MUTED,
  },
  loginLink: {
    color: BTN_PRIMARY,
  },

  // Bottom home-indicator line
  bottomLine: {
    position: 'absolute',
    bottom: sy(14),
    left: sx(136),
    width: sx(143),
    height: 2,
  },
});
