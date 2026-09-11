import { memo, useId, useState } from 'react';
import { HardwareCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import './hardwareImages.css';

interface HardwareImageProps {
  category: HardwareCategory;
  name: string;
  brand: string;
  imageUrl?: string;
}

const categoryLabels: Record<HardwareCategory, string> = {
  cpu: 'PROCESSOR', gpu: 'GRAPHICS', motherboard: 'MAINBOARD', ram: 'MEMORY',
  storage: 'STORAGE', psu: 'POWER SUPPLY', cooler: 'COOLING', case: 'CHASSIS', laptop: 'LAPTOP',
};

// Old catalog stock photos are repeated across unrelated products. Keep those
// illustrative, while allowing real product assets with an image-error fallback.
function productImageUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, 'https://silicon-wiki.local');
    if (!['https:', 'http:'].includes(url.protocol)) return undefined;
    if (/(^|\.)(unsplash\.com|picsum\.photos)$/.test(url.hostname)) return undefined;
    return value;
  } catch { return undefined; }
}

/** Static product studies: generic silhouettes, not product photography. */
export const HardwareImage = memo(function HardwareImage({ category, name, brand, imageUrl }: HardwareImageProps) {
  const { lang } = useLanguage();
  const id = `hardware-${useId().replace(/:/g, '')}`;
  const [failedUrl, setFailedUrl] = useState<string>();
  const source = productImageUrl(imageUrl);
  const showPhoto = !!source && source !== failedUrl;
  const paint = (part: string) => `url(#${id}-${part})`;
  const product = `${brand} ${name}`;
  const shell = /white|白色|雪|冰|银色/i.test(name) ? paint('silver') : paint('graphite');
  const brandLabel = brand.length > 14 ? `${brand.slice(0, 13)}…` : brand;
  const modelLabel = (name.toLowerCase().startsWith(brand.toLowerCase()) ? name.slice(brand.length).trim() : name).slice(0, 26);
  const fan = (x: number, y: number, size: number) => <use href={`#${id}-fan`} x={x} y={y} width={size} height={size} />;
  const screw = (x: number, y: number) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="2.2" fill="#222823" stroke="#858a7c" strokeWidth=".7" /><path d={`M${x - 1},${y}h2`} stroke="#bbc0ad" strokeWidth=".6" /></g>;
  const label = (x: number, y: number, size = 9, color = '#e5e5d9') => <text x={x} y={y} fill={color} fontSize={size} fontWeight="600" letterSpacing="1.4">{brandLabel.toUpperCase()}</text>;

  function illustration() {
    switch (category) {
      case 'cpu': {
        const isApple = /apple|苹果/i.test(product);
        const isAMD = /amd|ryzen|锐龙/i.test(product);
        return <g transform="rotate(-12 200 117)">
          <rect x="128" y="49" width="148" height="148" rx="9" fill="#1c241e" />
          <rect x="124" y="42" width="148" height="148" rx="8" fill={paint('board')} stroke="#83917a" strokeWidth="1.3" />
          {Array.from({ length: 13 }, (_, i) => <g key={i} fill="#c6ac65"><rect x={134 + i * 10} y="44" width="4" height="5" rx=".8" /><rect x={134 + i * 10} y="183" width="4" height="5" rx=".8" /><rect x="126" y={55 + i * 10} width="5" height="4" rx=".8" /><rect x="265" y={55 + i * 10} width="5" height="4" rx=".8" /></g>)}
          <path d={isAMD ? 'M145 57H252V84H259V145H252V173H145V145H137V84H145Z' : 'M143 56H253Q259 56 259 62V170Q259 176 253 176H143Q137 176 137 170V62Q137 56 143 56Z'} fill={isApple ? paint('graphite') : paint('silver')} stroke="#cdd0c0" strokeWidth="1.2" />
          <path d="M150 64H245M145 68V159" fill="none" stroke="#fff" opacity=".45" />
          <path d="M150 165H245" stroke="#535b50" opacity=".35" />
          {label(154, 92, 11, isApple ? '#e8e6d9' : '#454b43')}
          <text x="153" y="119" fontSize="17" fontWeight="600" letterSpacing="-.5" fill={isApple ? '#e4cf83' : '#323a32'}>{isAMD ? 'RYZEN' : isApple ? (name.match(/M\d\s*(?:Pro|Max|Ultra)?/i)?.[0] || 'SILICON') : 'CORE'}</text>
          <text x="154" y="136" fontSize="6.5" fill={isApple ? '#b7bdad' : '#626b5c'}>{modelLabel}</text>
          <rect x="153" y="148" width="24" height="5" fill="#8b7750" opacity=".65" />
          <path d="M131 175l7 7h-7z" fill="#e3c875" />
        </g>;
      }
      case 'gpu': return <g transform="translate(0 5) rotate(-7 200 115)">
        <path d="M58 76L82 54H326L347 71V145L327 165H58Z" fill="#191e1b" stroke="#555d50" />
        <path d="M58 76L82 54H326L303 76Z" fill={paint('silver')} />
        <path d="M304 77L327 56L347 71V145L326 164H304Z" fill="#252c26" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${311 + i * 3} 87v60`} stroke="#626958" strokeWidth="1" />)}
        <rect x="55" y="76" width="252" height="86" rx="7" fill={shell} stroke="#858b7b" />
        <path d="M62 82H131L142 92H218L228 82H299M64 155H128L140 145H220L232 155H299" fill="none" stroke="#9da28d" strokeWidth="2" opacity=".6" />
        {fan(67, 84, 68)}{fan(143, 84, 68)}{fan(220, 84, 68)}
        <rect x="49" y="72" width="6" height="100" rx="1" fill={paint('silver')} />
        <path d="M51 171H37v-6h12" fill="#b7bdad" />
        <rect x="92" y="162" width="99" height="9" fill="#bda360" />
        {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${96 + i * 4.7} 164v7`} stroke="#665638" />)}
        {label(147, 68, 7, '#343e35')}
        {[[62,83], [298,83], [62,155], [298,155]].map(([x,y]) => screw(x,y))}
      </g>;
      case 'motherboard': return <g transform="rotate(-9 200 120)">
        <rect x="123" y="33" width="155" height="176" rx="5" fill="#181f1a" />
        <rect x="120" y="28" width="155" height="176" rx="4" fill={paint('board')} stroke="#76806e" />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${145 + i * 6} 91v${24 + i * 4}l-15 15v48M203 ${110 + i * 7}h${13 + i * 3}l12 12v38`} fill="none" stroke="#809074" strokeWidth=".55" opacity=".48" />)}
        <path d="M126 36H154V102L146 111H126Z" fill={shell} stroke="#7d8574" />
        <path d="M159 35H219V52H169L159 45Z" fill={paint('silver')} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M130 ${44 + i * 8}h20`} stroke="#a7ad99" opacity=".5" />)}
        <rect x="162" y="59" width="55" height="54" rx="3" fill="#191e19" stroke="#a9af9c" strokeWidth="2" />
        <rect x="170" y="67" width="39" height="38" fill={paint('silver')} stroke="#f1eee1" />
        <path d="M220 61v47l-5 10" fill="none" stroke="#bbc1ad" strokeWidth="2" />
        {Array.from({ length: 4 }, (_, i) => <g key={i}><rect x={231 + i * 8} y="49" width="5" height="83" rx="1" fill={i % 2 ? '#9a9c80' : '#171e19'} stroke="#707760" strokeWidth=".7" /><path d={`M${233 + i * 8} 54v72`} stroke="#c7bb84" strokeWidth=".5" /></g>)}
        <rect x="145" y="126" width="81" height="9" rx="1" fill="#b9bcaa" /><path d="M148 130h73" stroke="#404a3b" strokeWidth="2" />
        <path d="M143 144H221L230 154H143Z" fill={shell} stroke="#909781" />
        <path d="M233 143H267V190H230V159Z" fill={paint('graphite')} stroke="#78826d" />
        <path d="M241 153l18 18m-18-10 18 18m-18-10 18 18" stroke="#c3aa66" strokeWidth="2" />
        <rect x="145" y="173" width="78" height="6" fill="#161b16" stroke="#67745c" />
        <circle cx="135" cy="161" r="8" fill={paint('silver')} stroke="#abb39c" />
        {label(145, 192, 6)}
        {[[126,34], [268,34], [126,198], [268,198]].map(([x,y]) => screw(x,y))}
      </g>;
      case 'ram': return <g transform="rotate(-12 200 120)">
        {[0, 1].map((row) => <g key={row} transform={`translate(${row * -12} ${row * 59})`}>
          <rect x="71" y="54" width="260" height="50" rx="3" fill="#252d24" />
          <path d="M77 49H322L332 58V96H72V58Z" fill={shell} stroke="#969e8b" />
          <path d="M78 50H323" stroke="#e5d499" strokeWidth="4" />
          <path d="M91 60l22 29h28l-22-29M275 60l-22 29h28l22-29" fill="#a5ab97" opacity=".32" />
          <path d="M152 60h92v25h-92z" fill="#222923" stroke="#79816e" strokeWidth=".7" />
          {label(164, 76, 8)}
          <path d="M84 97H197V105H84ZM205 97H317V105H205Z" fill="#bfa463" />
          {Array.from({ length: 43 }, (_, i) => <path key={i} d={`M${87 + i * 5.3} 98v7`} stroke="#6e6040" strokeWidth="1.1" />)}
        </g>)}
      </g>;
      case 'storage': {
        const isHdd = /HDD|机械|酷狼|酷鱼|红盘|紫盘|金盘|ironwolf|barracuda|exos|ultrastar/i.test(name) && !/SSD|NVMe|SN\d|固态/i.test(name);
        const isSata = /SATA|870|MX500|BX500|2\.5/i.test(name);
        if (isHdd || isSata) return <g transform="rotate(-11 200 120)">
          <rect x="128" y="39" width="149" height="165" rx="9" fill="#202720" />
          <rect x="123" y="32" width="149" height="165" rx="8" fill={isHdd ? paint('silver') : shell} stroke="#9ca28f" />
          {isHdd ? <><path d="M137 50Q187 30 254 55V173Q200 190 137 174Z" fill="none" stroke="#9aa291" strokeWidth="3" /><circle cx="196" cy="115" r="51" fill="none" stroke="#8c9685" strokeWidth="2" opacity=".65" /><circle cx="196" cy="115" r="8" fill={paint('silver')} stroke="#879080" /></> : <path d="M135 42H259V181H135Z" fill="#242c23" />}
          <rect x="143" y="64" width="109" height="44" rx="2" fill="#deded0" />
          {label(152, 82, 8, '#374132')}
          <text x="152" y="97" fill="#6e765f" fontSize="7">{isHdd ? 'HARD DISK DRIVE' : 'SOLID STATE DRIVE'}</text>
          <path d="M156 195h40v6h-40zm46 0h24v6h-24z" fill="#b59a54" />
          {[[131,40], [264,40], [131,188], [264,188]].map(([x,y]) => screw(x,y))}
        </g>;
        return <g transform="rotate(-13 200 120)">
          <path d="M63 87H331V107Q321 118 331 128V148H63Z" fill={paint('board')} stroke="#7d8e72" strokeWidth="1.3" />
          <path d="M57 92H72V113H57ZM57 119H72V142H57Z" fill="#c4a65e" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M58 ${95 + i * 5}h13`} stroke="#76613c" />)}
          <rect x="87" y="95" width="228" height="45" rx="3" fill={shell} stroke="#9da58f" />
          <path d="M95 101h129M95 106h129M95 111h129" stroke="#a7ad9a" opacity=".25" />
          <rect x="230" y="95" width="85" height="45" rx="2" fill="#d9d9c9" />
          {label(240, 113, 7, '#384532')}
          <text x="240" y="128" fill="#737b65" fontSize="6.5">NVMe · M.2</text>
          <path d="M97 128h97" stroke="#cfb66f" strokeWidth="3" />
          <circle cx="328" cy="118" r="5" fill="none" stroke="#c4ba8c" strokeWidth="2" />
        </g>;
      }
      case 'psu': return <g transform="rotate(-6 200 120)">
        <path d="M110 60L149 39H274L304 67V160L260 190H110Z" fill="#20271f" stroke="#6f7865" />
        <path d="M110 60L149 39H274L260 60Z" fill={paint('silver')} />
        <path d="M260 60L274 39L304 67V160L260 190Z" fill={paint('graphite')} />
        <rect x="109" y="60" width="151" height="130" rx="5" fill={shell} stroke="#939b86" />
        {fan(127, 69, 114)}
        {[30, 39, 48].map(r => <circle key={r} cx="184" cy="126" r={r} fill="none" stroke="#9da58e" strokeWidth="1.5" opacity=".72" />)}
        <path d="M136 126h96M184 78v96" stroke="#939a85" strokeWidth="2.5" />
        {Array.from({ length: 3 }, (_, i) => <g key={i}><path d={`M272 ${84 + i * 23}l21-12v14l-21 12z`} fill="#111811" stroke="#7b856d" /><path d={`M278 ${85 + i * 23}l8-5`} stroke="#b6a371" strokeWidth="3" /></g>)}
        {label(152, 54, 6, '#414a39')}
        {[[116,68], [251,68], [116,182], [251,182]].map(([x,y]) => screw(x,y))}
      </g>;
      case 'cooler': {
        const isLiquid = /(?:240|280|360|420)|水冷|liquid|kraken|iCUE|nucleus|冷排/i.test(name);
        const compactRadiator = /240|280/.test(name) && !/360|420/.test(name);
        const radiatorLeft = compactRadiator ? 128 : 90;
        const radiatorRight = compactRadiator ? 291 : 329;
        if (isLiquid) return <g>
          <path d={`M${radiatorLeft + 8} 97C48 161 94 197 152 167M${radiatorLeft + 20} 105C76 159 104 187 161 176`} fill="none" stroke="#1c241c" strokeWidth="9" />
          <path d={`M${radiatorLeft + 8} 97C48 161 94 197 152 167M${radiatorLeft + 20} 105C76 159 104 187 161 176`} fill="none" stroke="#79846f" strokeWidth="2" />
          <g transform="rotate(-8 215 90)"><path d={`M${radiatorLeft} 45H${radiatorRight}V120H${radiatorLeft}Z`} fill="#1d241e" stroke="#8c947e" /><path d={`M${radiatorLeft} 45l12-9H${radiatorRight + 7}l-7 9z`} fill={paint('silver')} /><path d={`M${radiatorRight} 45l7-9v75l-7 9z`} fill="#4b5546" />
            {(compactRadiator ? [137, 213] : [99, 175, 251]).map(x => <g key={x}><rect x={x} y="51" width="70" height="63" rx="5" fill={shell} stroke="#777f6d" />{fan(x + 4, 54, 58)}</g>)}
          </g>
          <path d="M149 150L172 138H215L228 153V190L208 204H166L149 190Z" fill="#242c23" stroke="#88967b" />
          <rect x="148" y="148" width="65" height="49" rx="12" fill={paint('graphite')} stroke="#bbc2a9" />
          <circle cx="180" cy="172" r="18" fill="#20291f" stroke="#d0bb76" strokeWidth="2" />
          <text x="180" y="175" textAnchor="middle" fill="#e1dfcc" fontSize="6">{brandLabel.slice(0, 9)}</text>
        </g>;
        return <g transform="rotate(-7 200 120)">
          {[145, 159, 229, 242].map(x => <path key={x} d={`M${x} 143v34q0 17 ${x < 200 ? 38 : -38} 17`} fill="none" stroke="#a88a55" strokeWidth="5" />)}
          <rect x="169" y="188" width="66" height="12" rx="3" fill={paint('silver')} />
          <path d="M119 54L143 38H250L273 55V162L248 179H120Z" fill={paint('silver')} stroke="#8c9782" />
          {Array.from({ length: 19 }, (_, i) => <path key={i} d={`M122 ${59 + i * 6}h126l23-16`} fill="none" stroke="#67745f" strokeWidth="2" />)}
          <path d="M119 54L143 38H250L247 54Z" fill={shell} stroke="#a4ac96" />
          <rect x="125" y="62" width="119" height="112" rx="7" fill={shell} stroke="#929d84" />
          {fan(133, 67, 103)}
          {[[131,68], [238,68], [131,168], [238,168]].map(([x,y]) => screw(x,y))}
          {label(163, 49, 6)}
        </g>;
      }
      case 'case': {
        const wood = /north|木/i.test(name);
        return <g>
          <path d="M143 40L186 24H269V187L232 210H143Z" fill="#252d24" stroke="#8a957e" />
          <path d="M143 40L186 24H269L228 40Z" fill={paint('silver')} />
          <path d="M228 40L269 24V187L228 210Z" fill={shell} stroke="#818e74" />
          {wood ? Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${234 + i * 4.8} ${41 - i * 1.8}v160`} stroke={i % 2 ? '#ac8957' : '#c2a06b'} strokeWidth="2.5" />) : <g transform="matrix(.4 -.17 0 .95 231 44)">{fan(0, 8, 83)}{fan(0, 88, 83)}</g>}
          <rect x="144" y="41" width="84" height="167" fill={shell} stroke="#a6ae96" />
          <rect x="150" y="49" width="70" height="125" rx="2" fill="#182019" stroke="#737f68" />
          <rect x="157" y="60" width="52" height="71" fill="#2c382b" stroke="#58674e" />
          {fan(166, 69, 33)}
          <rect x="153" y="118" width="62" height="14" rx="2" fill={paint('silver')} />
          <path d="M159 134h52" stroke="#cebc7b" strokeWidth="2" />
          <path d="M151 50h24l-24 124z" fill="#dee2ce" opacity=".06" />
          <path d="M153 181h61M153 185h61" stroke="#737f65" strokeWidth="1.5" />
          <path d="M150 210v5h14v-5m49 0v5h11v-5" fill="#444e3c" />
          <path d="M201 30h14m5 0h6" stroke="#3d4837" strokeWidth="2" />
          {label(156, 199, 5.5)}
        </g>;
      }
      case 'laptop': return <g>
        <path d="M93 43H303Q309 43 309 50V164H87V50Q87 43 93 43Z" fill={paint('graphite')} stroke="#9ca58f" strokeWidth="1.5" />
        <rect x="95" y="51" width="206" height="104" rx="2" fill="#222c23" />
        <path d="M95 137Q145 65 204 91T301 58V155H95Z" fill="#65765b" />
        <path d="M95 152Q174 58 237 110T301 93V155H95Z" fill="#9ba68a" />
        <path d="M178 155Q232 112 301 128V155Z" fill="#d6ca92" />
        <circle cx="198" cy="47" r="1" fill="#b6be9f" />
        <path d="M87 164H309L342 191H56Z" fill={paint('silver')} stroke="#9ba38e" />
        <path d="M56 191H342L336 198H62Z" fill="#798571" stroke="#a9b19b" />
        <path d="M103 167H292L309 181H87Z" fill="#555f4e" />
        {Array.from({ length: 3 }, (_, row) => <g key={row}>{Array.from({ length: 15 }, (_, col) => <path key={col} d={`M${103 + col * 12.7 - row * 3} ${168 + row * 4}h10l2 2.2h-12z`} fill="#c5cbb7" />)}</g>)}
        <path d="M179 183H219L226 189H171Z" fill="#a5ad97" stroke="#737f64" strokeWidth=".7" />
        <path d="M181 192h36" stroke="#4d5a43" strokeWidth="1.3" />
      </g>;
    }
  }

  return <div className="hardware-image" data-category={category}>
    <div className="hardware-image__heading" aria-hidden="true"><span>{categoryLabels[category]}</span><span className="hardware-image__index">{String(Object.keys(categoryLabels).indexOf(category) + 1).padStart(2, '0')}</span></div>
    {showPhoto ? <img key={source} className="hardware-image__photo" src={source} alt={lang === 'en' ? `${name} product image` : `${name} 产品图片`} loading="lazy" decoding="async" onError={() => setFailedUrl(source)} /> :
      <svg className="hardware-image__art" viewBox="0 0 400 240" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{lang === 'en' ? `${name} — representative component illustration, not a product photograph` : `${name} — 品类外观示意，非实物照片`}</title>
        <defs>
          <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#edece1" /><stop offset=".32" stopColor="#b3baab" /><stop offset=".5" stopColor="#e0e2d5" /><stop offset="1" stopColor="#7d8878" /></linearGradient>
          <linearGradient id={`${id}-graphite`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#626c60" /><stop offset=".45" stopColor="#343e34" /><stop offset="1" stopColor="#1b221c" /></linearGradient>
          <linearGradient id={`${id}-board`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4d6049" /><stop offset="1" stopColor="#25362b" /></linearGradient>
          <radialGradient id={`${id}-shadow`}><stop stopColor="#182018" stopOpacity=".24" /><stop offset="1" stopColor="#182018" stopOpacity="0" /></radialGradient>
          <symbol id={`${id}-fan`} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#182019" stroke="#929c83" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="43" fill="#252e24" stroke="#465440" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} transform={`rotate(${i * 40} 50 50)`} d="M47 42C24 42 15 28 28 13C40 13 49 27 53 38Z" fill={paint('graphite')} stroke="#7e8b70" strokeWidth=".55" />)}
            <circle cx="50" cy="50" r="12" fill={paint('silver')} stroke="#a3ae94" />
            <circle cx="50" cy="50" r="7" fill="#343f31" /><path d="M46 50h8" stroke="#c9b875" strokeWidth="1.5" />
          </symbol>
        </defs>
        <ellipse cx="201" cy="209" rx={category === 'gpu' || category === 'ram' || category === 'laptop' ? 146 : 104} ry="15" fill={paint('shadow')} />
        <g className="hardware-image__product" fontFamily="Arial, sans-serif">{illustration()}</g>
      </svg>}
    <div className="hardware-image__caption" aria-hidden="true"><span>{brand}</span><span>{showPhoto ? (lang === 'en' ? 'Product image' : '产品图片') : (lang === 'en' ? 'Illustration' : '外观示意')}</span></div>
  </div>;
});
