export interface HardwareSpecDetail {
  craft: string;
  specs: { label: string; val: string }[];
  highlightTip: string;
}

export const stepSpecsMapZh: Record<string, HardwareSpecDetail> = {
  cpu: {
    craft: 'TSMC N4P 先进制程 · 镀镍紫铜 IHS 均热顶盖 · 金色防呆三角对位标',
    specs: [
      { label: '插槽封装', val: 'LGA1700 / AM5 (1718 Pin)' },
      { label: '热设计功耗', val: '120W - 253W 动态功耗' },
      { label: '操作关键', val: '认准金色三角，切勿触碰底座针脚' },
    ],
    highlightTip: '金手指标记与插槽缺口严密对齐，零压力自由落座',
  },
  ram: {
    craft: '10层服务器级 PCB · 原厂海力士 A-die 颗粒 · 阳极氧化厚重铝马甲',
    specs: [
      { label: '技术规范', val: 'DDR5 6000MHz CL30 双通道' },
      { label: '插槽推荐', val: '优先插入第 2 槽与第 4 槽 (A2/B2)' },
      { label: '超频支持', val: '支持 Intel XMP 3.0 & AMD EXPO' },
    ],
    highlightTip: '两端听到“咔哒”锁定声，卡扣自动回弹咬紧',
  },
  ssd: {
    craft: 'PCIe 4.0 x4 NVMe 2.0 · 3D TLC 高速颗粒 · 独立高速 DRAM 物理缓存',
    specs: [
      { label: '传输速度', val: '读取 7400 MB/s · 写入 6500 MB/s' },
      { label: '固定形式', val: 'M.2 2280 规格 · 免工具旋转卡扣 / 螺丝' },
      { label: '散热提醒', val: '主板金属散热马甲背后蓝色导热垫膜必撕！' },
    ],
    highlightTip: '30°~45° 倾斜入槽到底，向下轻压旋紧固定',
  },
  cooler: {
    craft: '双塔穿 FIN 工艺 · 6x 6mm 逆重力烧结纯铜热管 · FDB 液压静音轴承风扇',
    specs: [
      { label: '解热能力', val: '最高压制 260W TDP 核心发热' },
      { label: '风扇规格', val: '120mm PWM 温控静音扇 (800-1850RPM)' },
      { label: '供电接口', val: '主板 CPU_FAN 4-Pin 专用排针' },
    ],
    highlightTip: '铜底撕膜后点涂黄豆粒硅脂，对角线交替旋紧螺丝',
  },
  motherboard: {
    craft: '标准 ATX 版型 · 16+1+2 相 90A 旗舰供电 · 8层 2oz 加厚铜箔 PCB',
    specs: [
      { label: '扩展插槽', val: 'PCIe 5.0 x16 金属加固槽 + 4x M.2' },
      { label: '后置 I/O', val: '一体化预装金属挡板 + Wi-Fi 7 天线接口' },
      { label: '机箱对位', val: '主板 9 孔螺丝位，必须与机箱铜柱一一对应' },
    ],
    highlightTip: '主板斜向滑入机箱卡稳 I/O 挡板，严防多余铜柱短路',
  },
  psu: {
    craft: 'ATX 3.0 规范 · 80 PLUS 金牌全模组 · 105°C 日系全固态/电解电容',
    specs: [
      { label: '额定功率', val: '850W 纯净单路 12V 稳压输出' },
      { label: '新显卡线', val: '原生 PCIe 5.0 12V-2x6 600W 接口' },
      { label: '风道方向', val: '风扇朝下对准机箱底面防尘网进风' },
    ],
    highlightTip: '装箱前先插好线缆，CPU 8Pin 与 PCIe 8Pin 绝不可插反',
  },
  gpu: {
    craft: 'Ada / RDNA3 旗舰核心 · 3x 逆向环形导流风扇 · 金属穿透散热背板',
    specs: [
      { label: '视频输出', val: '3x DP 2.1 + 1x HDMI 2.1 高刷接口' },
      { label: '槽位规格', val: '2.5 槽加厚散热体 · 双金属挡片牢靠固定' },
      { label: '供电注意事项', val: '16-Pin 接口必须垂直完全插到底零缝隙' },
    ],
    highlightTip: '推入 PCIe 槽发出咔哒锁死，机箱挡片螺丝紧固防下垂',
  },
  cables: {
    craft: '高密度编织蛇皮网 · 镀金端子触点 · 附赠高刚性透明工程理线梳',
    specs: [
      { label: '开机核心', val: 'POWER SW 双针 (插 JFP1 无正负极)' },
      { label: '高速传输', val: '前置 USB 3.0 19-Pin (防呆缺口严防断针)' },
      { label: '音频走线', val: 'HD AUDIO 9-Pin 防呆插座 (防呆缺一针)' },
    ],
    highlightTip: '分束梳理顺直走背线，扎带固定提升机箱内部风道效能',
  },
  case: {
    craft: '270° 无立柱海景房 · 4mm 超白钢化防爆玻璃 · 独立下置电源仓分舱',
    specs: [
      { label: '点亮自检', val: '观察主板 CPU->DRAM->VGA->BOOT 4颗灯' },
      { label: '视频接线', val: '视频线务必插在独显后置接口，严禁插主板' },
      { label: '首开进系统', val: '狂按 Del 进 BIOS 开启 XMP / EXPO 内存加速' },
    ],
    highlightTip: '通电自检全绿即大功告成，享受首次点亮主机的仪式感！',
  },
};

export const stepSpecsMapEn: Record<string, HardwareSpecDetail> = {
  cpu: {
    craft: 'TSMC N4P Advanced Node · Nickel-Plated Copper IHS · Golden Alignment Triangle',
    specs: [
      { label: 'Socket Spec', val: 'LGA1700 / AM5 (1718 Pin)' },
      { label: 'TDP Rating', val: '120W - 253W Dynamic' },
      { label: 'Key Tip', val: 'Align golden triangle; never touch socket pins' },
    ],
    highlightTip: 'Align gold pins with socket notch; zero-insertion force drop-in',
  },
  ram: {
    craft: '10-Layer Server-Grade PCB · SK Hynix A-die ICs · Anodized Heavy Aluminum Heatspreader',
    specs: [
      { label: 'Spec Standard', val: 'DDR5 6000MHz CL30 Dual Channel' },
      { label: 'Recommended Slots', val: 'Slots 2 & 4 (A2/B2 channel)' },
      { label: 'OC Support', val: 'Intel XMP 3.0 & AMD EXPO' },
    ],
    highlightTip: "Listen for crisp audible 'click' on both ends as latches lock in",
  },
  ssd: {
    craft: 'PCIe 4.0 x4 NVMe 2.0 · 3D TLC High-Speed Flash · Dedicated Physical DRAM Cache',
    specs: [
      { label: 'Read/Write Speed', val: 'Read 7400 MB/s · Write 6500 MB/s' },
      { label: 'Form Factor', val: 'M.2 2280 · Toolless Latch / Standoff Screw' },
      { label: 'Thermal Warning', val: 'Peel off protective film under motherboard heatsink!' },
    ],
    highlightTip: 'Insert at 30°~45° angle until seated, press down gently and secure',
  },
  cooler: {
    craft: 'Dual-Tower Fin Stack · 6x 6mm Anti-Gravity Sintered Heatpipes · FDB Hydraulic Fan',
    specs: [
      { label: 'Thermal Capacity', val: 'Tames up to 260W TDP heat output' },
      { label: 'Fan Spec', val: '120mm PWM Silent Fan (800-1850 RPM)' },
      { label: 'Power Header', val: 'Motherboard CPU_FAN 4-Pin Dedicated' },
    ],
    highlightTip: 'Peel bottom film, apply pea-sized paste, tighten diagonally in turns',
  },
  motherboard: {
    craft: 'Standard ATX · 16+1+2 Phase 90A Flagship VRM · 8-Layer 2oz Copper PCB',
    specs: [
      { label: 'Expansion Slots', val: 'PCIe 5.0 x16 Reinforced + 4x M.2' },
      { label: 'Rear I/O', val: 'Integrated I/O Shield + Wi-Fi 7 Antenna' },
      { label: 'Chassis Alignment', val: '9 screw holes; match chassis standoffs 1-to-1' },
    ],
    highlightTip: 'Slide board at angle into I/O shield; beware rogue standoffs causing shorts',
  },
  psu: {
    craft: 'ATX 3.0 Spec · 80 PLUS Gold Full Modular · 105°C Japanese All-Solid Capacitors',
    specs: [
      { label: 'Rated Power', val: '850W Pure Single-Rail 12V Output' },
      { label: '12VHPWR Cable', val: 'Native PCIe 5.0 12V-2x6 600W Header' },
      { label: 'Airflow Direction', val: 'Fan faces downward toward bottom dust filter' },
    ],
    highlightTip: 'Pre-connect modular cables before case install; never mix CPU and PCIe 8-Pin',
  },
  gpu: {
    craft: 'Ada / RDNA3 Flagship Core · 3x Reverse Ring Axial Fans · Metal Flow-Through Backplate',
    specs: [
      { label: 'Display Output', val: '3x DP 2.1 + 1x HDMI 2.1 High Refresh' },
      { label: 'Slot Size', val: '2.5-Slot Thick Heatsink · Dual Metal Brackets' },
      { label: 'Power Warning', val: '16-Pin cable must be seated completely flush with zero gap' },
    ],
    highlightTip: 'Press into PCIe slot until latch locks, secure bracket screws to prevent sag',
  },
  cables: {
    craft: 'High-Density Braided Sleeving · Gold-Plated Contacts · High-Rigidity Cable Combs',
    specs: [
      { label: 'Power Switch', val: 'POWER SW 2-Pin (JFP1 header, no polarity)' },
      { label: 'Front USB', val: 'USB 3.0 19-Pin (Careful with keyed notch)' },
      { label: 'Front Audio', val: 'HD AUDIO 9-Pin Keyed Header' },
    ],
    highlightTip: 'Route along backside channels, secure with zip ties to maintain internal airflow',
  },
  case: {
    craft: '270° Pillarless Panoramic Fish Tank · 4mm Ultra-White Tempered Glass · Dual-Chamber PSU Bay',
    specs: [
      { label: 'POST Self-Test', val: 'Watch Motherboard Debug LEDs: CPU->DRAM->VGA->BOOT' },
      { label: 'Display Cable', val: 'Plug monitor cable into GPU rear ports, NEVER motherboard!' },
      { label: 'First Boot BIOS', val: 'Spam Del key to enter BIOS & enable XMP / EXPO memory OC' },
    ],
    highlightTip: 'All debug LEDs off means success — enjoy your pristine custom rig!',
  },
};

export const componentNameMapZh: Record<string, string> = {
  cpu: 'CPU 处理器',
  ram: '双通道内存',
  ssd: 'M.2 NVMe 固态',
  cooler: '风冷散热器',
  motherboard: 'ATX 旗舰主板',
  psu: '模组电源',
  gpu: '独立显卡',
  cables: '模组线缆与跳线',
  case: '全景海景房机箱',
};

export const componentNameMapEn: Record<string, string> = {
  cpu: 'CPU Processor',
  ram: 'Dual-Channel RAM',
  ssd: 'M.2 NVMe SSD',
  cooler: 'CPU Air Cooler',
  motherboard: 'ATX Flagship Motherboard',
  psu: 'Modular Power Supply (PSU)',
  gpu: 'Discrete Graphics Card (GPU)',
  cables: 'Modular Cables & Front Panel Headers',
  case: 'Panoramic PC Chassis (Case)',
};

export const stepTranslationsEn: Record<
  number,
  {
    title: string;
    subtitle: string;
    summary: string;
    instructions: string[];
    criticalWarning?: string;
    debugCheck?: string;
  }
> = {
  1: {
    title: 'Motherboard Prep & CPU Installation',
    subtitle: 'Golden Triangle Alignment · Lever Locking & Socket Cap Ejection',
    summary:
      'Place the motherboard on its packaging cardboard box, open the retention lever, and gently align and seat the processor.',
    instructions: [
      'Use the motherboard box cardboard as a temporary insulated bench; NEVER place the board on the conductive outside of the anti-static bag.',
      'Gently press the metal retention lever beside the CPU socket, unhook it outwards, and lift it completely upward.',
      'Locate the small printed golden triangle on the CPU corner and match it precisely with the triangle mark on the socket corner.',
      'Hold the CPU by its edges and place it vertically and levelly into the socket with zero pressure — it should drop in naturally.',
      'Lower the load plate, swing the lever down with firm pressure, and hook it back into place (the black plastic protective cap will automatically pop off).',
    ],
    criticalWarning:
      'CRITICAL WARNING: AM5 and LGA1700 sockets have over a thousand delicate spring pins! Never touch pins with fingers or tools — bent pins will ruin the socket or memory channels!',
    debugCheck:
      'Check that the CPU is seated perfectly flat with no corners lifted, and the lever is hooked securely under the latch.',
  },
  2: {
    title: 'Dual-Channel Memory (RAM) Installation',
    subtitle: 'Keyed Notch Check · Prioritize Slots 2 & 4',
    summary:
      'Identify the asymmetrical key notch on the DIMM slot and press down until both latches produce a crisp audible click.',
    instructions: [
      'For typical 4-slot motherboards, when installing 2 sticks, always prioritize Slot 2 and Slot 4 counting from the CPU (channels A2 and B2).',
      'Open the retention latches at one or both ends of the memory slots.',
      'Align the asymmetrical notch on the RAM gold fingers with the matching ridge in the slot — it only fits one way.',
      'Place both thumbs on the ends of the module and press firmly downward until the latches snap shut with a loud, satisfying click!',
    ],
    criticalWarning:
      'If insertion feels extraordinarily difficult, do NOT force it — you likely have the orientation reversed. Re-check the middle notch.',
    debugCheck:
      'Look from the side to confirm gold pins are fully recessed inside the slot and both retention latches are fully engaged.',
  },
  3: {
    title: 'M.2 NVMe High-Speed SSD Installation',
    subtitle: '30°~45° Incline Angle · Standoff Screw · Peel Film Warning',
    summary:
      'Install the primary NVMe SSD into the top CPU-direct slot, peel off the heatsink thermal pad protective film, and tighten down.',
    instructions: [
      'Use a Phillips screwdriver to remove the motherboard metal M.2 heatsink closest to the CPU socket.',
      'Insert the M.2 SSD gently at a 30°~45° angle into the M.2 slot connector until golden contacts are fully seated.',
      'Gently press down the raised end of the SSD and secure it with the standoff screw or rotate the toolless plastic EZ-latch.',
      'Turn over the heatsink cover, PEEL OFF the protective blue/clear film on the thermal pad, and screw the heatsink back in place.',
    ],
    criticalWarning:
      'MOST COMMON BEGINNER MISTAKE: You MUST peel the protective film off the thermal pad beneath the heatsink! Leaving it on causes rapid overheating and thermal throttling.',
    debugCheck:
      'SSD is flat and securely held; heatsink makes flush, complete contact with SSD surface with no gaps.',
  },
  4: {
    title: 'CPU Cooler & Thermal Paste Application',
    subtitle: 'PEEL BOTTOM FILM! · Pea-Sized Dot · Diagonal Cross-Tightening',
    summary:
      'Apply thermal paste to the CPU IHS, peel the protective sticker off the cooler base, and tighten mounting screws diagonally in turns.',
    instructions: [
      'Install the appropriate mounting brackets and standoffs onto the motherboard according to your CPU socket (AMD AM5 or Intel LGA1700).',
      'Apply a pea-sized dot of thermal paste directly in the center of the CPU integrated heat spreader (IHS).',
      'CRITICAL REMINDER: Inspect the cooler copper base and PEEL OFF the clear plastic sticker labeled "WARNING: REMOVE BEFORE USE"!',
      'Position cooler base over the CPU mounting posts; tighten screws alternating diagonally 2 turns at a time until snugly bottomed out.',
      'Connect the fan 4-Pin PWM header to the motherboard header labeled CPU_FAN (do not plug into SYS_FAN).',
    ],
    criticalWarning:
      'TALES OF TEARS: Leaving the plastic sticker on the cooler base will send temperatures to 100°C within 3 seconds of booting, causing emergency thermal shutdown!',
    debugCheck:
      'Fan is connected to CPU_FAN; gently wiggle the heatsink to confirm zero play or loose wobble.',
  },
  5: {
    title: 'Motherboard Installation into PC Chassis',
    subtitle: 'Seat I/O Shield · Match Standoffs 1:1 · Snug Screws',
    summary:
      'Remove chassis side panels, verify standoff positions against the motherboard, slide board in, and fasten mounting screws.',
    instructions: [
      'Remove both chassis side panels (place tempered glass on a soft surface away from hard tile floors).',
      'Verify the motherboard standoffs inside the case match your motherboard form factor (ATX 9 holes / M-ATX 8 holes). Remove any unused standoffs to prevent short circuits!',
      'If your motherboard does not have an integrated I/O shield, snap the loose shield firmly into the rear chassis cutout first.',
      'Hold the board by its edges and slide it diagonally into the case, pressing rear ports into the shield while centering on the alignment pin.',
      'Drive motherboard screws in a diagonal pattern until snug; do not over-torque to avoid cracking the PCB trace layers.',
    ],
    criticalWarning:
      'NEVER leave an extra unused metal standoff installed under an empty motherboard spot — it will directly short power traces upon booting and brick the motherboard!',
    debugCheck:
      'Board edges are stable and secure; all rear USB and audio ports protrude cleanly through the I/O shield without bent grounding tabs blocking them.',
  },
  6: {
    title: 'Power Supply (PSU) & Main Power Cables',
    subtitle: 'Fan Facing Downward Intake · 24-Pin Motherboard & 8-Pin CPU EPS',
    summary:
      'Slide PSU into the lower power shroud, fan facing downward toward the dust filter, and route primary power cables.',
    instructions: [
      'If using a modular PSU, plug in needed cables before sliding it in: 24-Pin ATX, 8-Pin CPU (4+4), and PCIe 8-Pin / 12V-2x6.',
      'Slide the PSU into the lower chassis bay with the intake FAN FACING DOWNWARD toward the bottom mesh dust filter for dedicated cool air intake.',
      'Fasten the PSU from the case exterior rear with 4 coarse-thread case screws.',
      'Route the thick 24-Pin motherboard cable through the rear grommet and snap it firmly into the right side of the motherboard.',
      'Route the CPU 8-Pin (4+4) cable through the top-left opening and plug it into the top-left EPS header on the motherboard.',
    ],
    criticalWarning:
      'NEVER MIX UP: CPU 8-Pin (splits 4+4) and PCIe GPU 8-Pin (splits 6+2) have completely different pinouts! Check the molded labels on the connectors.',
    debugCheck:
      '24-Pin latch is fully clicked and flush; CPU 8-Pin is firmly seated.',
  },
  7: {
    title: 'Graphics Card (GPU) & Power Connector',
    subtitle: 'Remove Rear PCIe Slots · Open Retention Latch · Click In & Secure',
    summary:
      'Remove rear metal slot covers, push open PCIe retention latch, seat GPU firmly until locked, and fasten bracket screws.',
    instructions: [
      'Measure GPU thickness and remove the corresponding 2 to 3 metal expansion slot covers from the rear chassis.',
      'Push open the plastic retention lock at the rear of the motherboard primary PCIe x16 slot.',
      'Hold GPU level with both hands, align the golden fingers with the primary slot, and push straight down until the slot latch snaps closed with a click.',
      'Fasten 1 to 2 screws at the rear bracket to firmly anchor the graphics card to the case chassis.',
      'Plug in the dedicated GPU power cable (native 12V-2x6 16-Pin for modern cards, PCIe 6+2 Pin for others) — push all the way in until zero gap remains!',
    ],
    criticalWarning:
      'The 16-Pin power connector MUST be seated completely flush with zero gap! Any partial insertion creates high contact resistance and catastrophic terminal melting.',
    debugCheck:
      'PCIe latch has snapped closed; bracket screws are tight; GPU exhibits no severe sagging.',
  },
  8: {
    title: 'Front Panel Headers & Case I/O Routing',
    subtitle: 'Fear No More! · POWER SW · USB 3.0 · HD Audio',
    summary:
      'Connect power button switches, front USB 3.0, and front audio headers following motherboard silkscreen labels.',
    instructions: [
      'Find the small front-panel wire bundle; locate the 2-pin connector labeled POWER SW (power switch).',
      'Locate the header cluster labeled F_PANEL or JFP1 on bottom-right of the motherboard. Plug POWER SW onto the designated 2 pins (polarity does not matter!).',
      'Connect RESET SW (reset switch) and POWER LED (+/- mindful of polarity) if present.',
      'Align the blue front USB 3.0 19-Pin connector with the keyed notch on the motherboard USB 3.0 header and press gently and straight.',
      'Plug the connector labeled HD AUDIO into the 9-Pin keyed audio header at the bottom-left of the board.',
    ],
    criticalWarning:
      'Front USB 3.0 headers have 19 fragile pins inside. Align perfectly straight before pushing — angling or forcing will bend or snap pins instantly!',
    debugCheck:
      'POWER SW is plugged onto correct power pins; USB 3.0 and HD Audio cables are securely seated.',
  },
  9: {
    title: 'First Power-On & Motherboard POST Self-Test',
    subtitle: 'Display Cable into GPU! · Watch 4 Debug LEDs · Enable XMP in BIOS',
    summary:
      'Connect power cord, turn on PSU rocker switch, press power button, observe Debug LEDs, and enter BIOS to enable XMP/EXPO.',
    instructions: [
      'CARDINAL RULE: Plug your monitor HDMI/DP cable directly into the DISCRETE GPU REAR PORTS, NEVER into the motherboard IO!',
      'Flip the physical power toggle switch on the back of the PSU to the "I" (ON) position; press the chassis power button.',
      'Watch the 4 diagnostic Debug LEDs through the glass (CPU -> DRAM -> VGA -> BOOT). All 4 lights turning off signifies a successful clean POST!',
      'When monitor turns on with the motherboard brand logo, rapidly tap Delete or F2 to enter BIOS setup.',
      'Locate the XMP or EXPO toggle in BIOS EZ Mode, set to Profile 1 (Enabled), press F10 to save & reboot, and prepare Windows installation!',
    ],
    criticalWarning:
      'On first boot, DDR5 platforms run "Memory Training" — the DRAM amber LED may stay lit and screen remains black for 1 to 2 minutes. Do NOT panic or pull the plug!',
    debugCheck:
      'All 4 Debug LEDs extinguish after POST; display boots cleanly into BIOS; RAM runs at rated high speed.',
  },
};
