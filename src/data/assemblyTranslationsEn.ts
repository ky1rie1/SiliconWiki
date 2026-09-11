export interface HardwareSpecDetail {
  craft: string;
  specs: { label: string; val: string }[];
  highlightTip: string;
}

// These cards describe representative teaching geometry, not a vendor SKU.
export const stepSpecsMapZh: Record<string, HardwareSpecDetail> = {
  "cpu": {
    "craft": "AM5 处理器示意 · 金属顶盖 · LGA 触点与定位标记",
    "specs": [
      {
        "label": "示例平台",
        "val": "AMD AM5 / LGA1718"
      },
      {
        "label": "安装方向",
        "val": "核对三角标记与定位缺口"
      },
      {
        "label": "接触保护",
        "val": "捏住边缘，不触碰插槽针脚"
      }
    ],
    "highlightTip": "处理器对齐后自然落座，确认平整再锁定扣盖"
  },
  "ram": {
    "craft": "DDR5 DIMM 示意 · 非对称防呆缺口 · 双模块安装",
    "specs": [
      {
        "label": "示例插槽",
        "val": "A2 / B2，即从 CPU 向外的第 2 / 4 槽"
      },
      {
        "label": "安装顺序",
        "val": "以主板说明书为准"
      },
      {
        "label": "内存配置",
        "val": "先验证默认设置，再按需开启 EXPO / XMP"
      }
    ],
    "highlightTip": "核对两端入位和卡扣状态，不只依赖咔哒声"
  },
  "ssd": {
    "craft": "M.2 NVMe 示意 · 2280 外形 · 尾端支柱固定",
    "specs": [
      {
        "label": "外形规格",
        "val": "22 × 80 mm（M.2 2280）"
      },
      {
        "label": "安装角度",
        "val": "本示例约 30° 斜插，再轻压尾端"
      },
      {
        "label": "散热接触",
        "val": "若有导热垫保护膜，按说明移除"
      }
    ],
    "highlightTip": "连接器端保持入位，尾端落在正确支柱上后固定"
  },
  "cooler": {
    "craft": "双塔风冷示意 · 金属鳍片与热管 · 前进后出风道",
    "specs": [
      {
        "label": "示例风向",
        "val": "由机箱前方吹向后部排风口"
      },
      {
        "label": "底座检查",
        "val": "移除运输保护件，核对是否预涂硅脂"
      },
      {
        "label": "风扇接线",
        "val": "CPU_FAN；额外风扇按主板说明连接"
      }
    ],
    "highlightTip": "使用 AM5 兼容扣具，均匀交替拧紧至规定止点"
  },
  "motherboard": {
    "craft": "ATX 主板示意 · AM5 插槽 · DDR5 与 PCIe 扩展区域",
    "specs": [
      {
        "label": "示例板型",
        "val": "标准 ATX：305 × 244 mm"
      },
      {
        "label": "安装孔位",
        "val": "逐孔匹配铜柱，不预设统一孔数"
      },
      {
        "label": "整体入箱",
        "val": "已装 CPU、内存、SSD、散热器一同移动"
      }
    ],
    "highlightTip": "托稳主板组件，对齐后置接口，移除多余铜柱"
  },
  "psu": {
    "craft": "下置模组电源示意 · 后部安装 · 独立底部进风",
    "specs": [
      {
        "label": "示例安装",
        "val": "由机箱后部电源开口装入"
      },
      {
        "label": "风扇朝向",
        "val": "本机箱朝下进风，底部保持通风"
      },
      {
        "label": "线材选择",
        "val": "仅用原配或厂家明确兼容的模组线"
      }
    ],
    "highlightTip": "区分 CPU EPS 4+4-Pin 与显卡 PCIe 6+2-Pin"
  },
  "gpu": {
    "craft": "水平显卡示意 · 向下进风的轴流风扇 · 后部固定挡板",
    "specs": [
      {
        "label": "主板连接",
        "val": "主 PCIe x16 插槽，完整入位并锁定"
      },
      {
        "label": "机械固定",
        "val": "固定后挡板，按显卡重量添加支撑"
      },
      {
        "label": "辅助供电",
        "val": "按实际接口接线，卡扣锁定，避免急弯"
      }
    ],
    "highlightTip": "核对槽位、挡板和线缆间隙，不强行推压显卡"
  },
  "cables": {
    "craft": "电源与前置 I/O 线缆示意 · 背部走线 · 针脚图对照",
    "specs": [
      {
        "label": "开机按键",
        "val": "POWER SW：连接指定开关针脚"
      },
      {
        "label": "前置接口",
        "val": "USB 与 HD AUDIO 接到对应防呆接口"
      },
      {
        "label": "理线检查",
        "val": "留出线缆余量，避开扇叶和侧板夹点"
      }
    ],
    "highlightTip": "针脚定义以主板说明书为准，全程断电接线"
  },
  "case": {
    "craft": "ATX 机箱示意 · 透明侧板 · 首次通电检查",
    "specs": [
      {
        "label": "诊断指示",
        "val": "按主板说明书解释 POST 灯或代码"
      },
      {
        "label": "显示输出",
        "val": "优先接独显；核显输出需平台支持"
      },
      {
        "label": "首次 BIOS",
        "val": "核对硬件识别、温度与风扇状态"
      }
    ],
    "highlightTip": "没有可启动系统时 BOOT 灯可能常亮；内存训练时间因配置而异"
  },
  "case-glass": {
    "craft": "透明侧板示意 · 沿面板法线接近机箱 · 固定件定位",
    "specs": [
      {
        "label": "模型动作",
        "val": "垂直于侧板平面靠近并闭合"
      },
      {
        "label": "实际拆装",
        "val": "滑轨、铰链或螺丝结构以机箱说明书为准"
      },
      {
        "label": "操作注意",
        "val": "托稳玻璃，放在平整软垫上"
      }
    ],
    "highlightTip": "确认线缆和显卡供电插头不受侧板挤压"
  },
  "thermal-paste": {
    "craft": "导热界面材料示意 · 填补 CPU 顶盖与底座微小间隙",
    "specs": [
      {
        "label": "预涂检查",
        "val": "已有预涂硅脂时，不重复叠加"
      },
      {
        "label": "用量图案",
        "val": "遵循 CPU、散热器或硅脂说明书"
      },
      {
        "label": "接触准备",
        "val": "底座如有运输保护膜，安装前移除"
      }
    ],
    "highlightTip": "保持接触面干净，按扣具要求均匀施压"
  }
};

export const stepSpecsMapEn: Record<string, HardwareSpecDetail> = {
  "cpu": {
    "craft": "Representative AM5 processor · Metal heat spreader · LGA contacts and alignment marks",
    "specs": [
      {
        "label": "Example platform",
        "val": "AMD AM5 / LGA1718"
      },
      {
        "label": "Orientation",
        "val": "Match the triangle and locating notches"
      },
      {
        "label": "Contact protection",
        "val": "Hold edges; do not touch socket pins"
      }
    ],
    "highlightTip": "Let the aligned CPU settle flat before closing the load plate"
  },
  "ram": {
    "craft": "Representative DDR5 DIMMs · Asymmetric key notch · Two-module installation",
    "specs": [
      {
        "label": "Example slots",
        "val": "A2 / B2: second and fourth slots from the CPU"
      },
      {
        "label": "Population order",
        "val": "Follow the motherboard manual"
      },
      {
        "label": "Memory profile",
        "val": "Verify defaults before optional EXPO / XMP"
      }
    ],
    "highlightTip": "Check both ends and latches; do not rely on a click alone"
  },
  "ssd": {
    "craft": "Representative M.2 NVMe drive · 2280 outline · Tail secured to a standoff",
    "specs": [
      {
        "label": "Form factor",
        "val": "22 × 80 mm (M.2 2280)"
      },
      {
        "label": "Insertion angle",
        "val": "About 30° in this example; gently lower the tail"
      },
      {
        "label": "Thermal contact",
        "val": "Remove thermal-pad protective film if present"
      }
    ],
    "highlightTip": "Keep the connector seated and secure the tail on the correct standoff"
  },
  "cooler": {
    "craft": "Representative dual-tower cooler · Metal fins and heatpipes · Front-to-rear airflow",
    "specs": [
      {
        "label": "Example airflow",
        "val": "From the case front toward the rear exhaust"
      },
      {
        "label": "Base inspection",
        "val": "Remove shipping protection; check for pre-applied paste"
      },
      {
        "label": "Fan connection",
        "val": "CPU_FAN; connect extra fans as the manual specifies"
      }
    ],
    "highlightTip": "Use AM5-compatible mounts and tighten evenly to the specified stop"
  },
  "motherboard": {
    "craft": "Representative ATX board · AM5 socket · DDR5 and PCIe expansion areas",
    "specs": [
      {
        "label": "Example form factor",
        "val": "Standard ATX: 305 × 244 mm"
      },
      {
        "label": "Mounting points",
        "val": "Match each hole; hole counts vary by board"
      },
      {
        "label": "Assembly transfer",
        "val": "CPU, RAM, SSD and cooler move with the board"
      }
    ],
    "highlightTip": "Support the board assembly, align rear I/O and remove extra standoffs"
  },
  "psu": {
    "craft": "Representative modular PSU · Rear insertion · Separate bottom air intake",
    "specs": [
      {
        "label": "Example installation",
        "val": "Insert through the rear PSU opening"
      },
      {
        "label": "Fan orientation",
        "val": "Downward intake here; keep the bottom ventilated"
      },
      {
        "label": "Cable selection",
        "val": "Use original or explicitly approved compatible cables"
      }
    ],
    "highlightTip": "Distinguish CPU EPS 4+4-Pin from GPU PCIe 6+2-Pin"
  },
  "gpu": {
    "craft": "Representative horizontal GPU · Downward-facing axial fans · Rear mounting bracket",
    "specs": [
      {
        "label": "Board connection",
        "val": "Primary PCIe x16 slot, fully seated and locked"
      },
      {
        "label": "Mechanical support",
        "val": "Secure bracket; add support as needed for card weight"
      },
      {
        "label": "Auxiliary power",
        "val": "Match actual connectors; latch fully and avoid tight bends"
      }
    ],
    "highlightTip": "Check slot, bracket and cable clearance; do not force the card"
  },
  "cables": {
    "craft": "Representative power and front I/O cables · Rear routing · Manual pinout reference",
    "specs": [
      {
        "label": "Power button",
        "val": "POWER SW: connect to the designated switch pins"
      },
      {
        "label": "Front I/O",
        "val": "Connect USB and HD AUDIO to matching keyed headers"
      },
      {
        "label": "Routing check",
        "val": "Allow slack and avoid fan blades and panel pinch points"
      }
    ],
    "highlightTip": "Follow the motherboard pinout and connect cables with power disconnected"
  },
  "case": {
    "craft": "Representative ATX case · Transparent side panel · First power-on checks",
    "specs": [
      {
        "label": "Diagnostics",
        "val": "Interpret POST LEDs or codes using the board manual"
      },
      {
        "label": "Display output",
        "val": "Usually GPU; integrated output requires platform support"
      },
      {
        "label": "First BIOS visit",
        "val": "Check detected hardware, temperatures and fan status"
      }
    ],
    "highlightTip": "BOOT may remain lit without a bootable OS; memory training time varies"
  },
  "case-glass": {
    "craft": "Representative transparent panel · Movement normal to panel · Mounting alignment",
    "specs": [
      {
        "label": "Model movement",
        "val": "Approaches the case perpendicular to the panel plane"
      },
      {
        "label": "Actual mechanism",
        "val": "Rails, hinges and screws depend on the case manual"
      },
      {
        "label": "Handling",
        "val": "Support the glass and place it on a flat padded surface"
      }
    ],
    "highlightTip": "Ensure the panel does not press on cables or GPU power connectors"
  },
  "thermal-paste": {
    "craft": "Representative thermal interface material · Fills small gaps between CPU and cooler",
    "specs": [
      {
        "label": "Pre-applied paste",
        "val": "Do not add more paste over an existing application"
      },
      {
        "label": "Amount and pattern",
        "val": "Follow CPU, cooler or paste manufacturer instructions"
      },
      {
        "label": "Contact preparation",
        "val": "Remove shipping protection from the base if present"
      }
    ],
    "highlightTip": "Keep contact surfaces clean and apply even mounting pressure"
  }
};

export const componentNameMapZh: Record<string, string> = {
  "cpu": "CPU 处理器",
  "ram": "双通道内存",
  "ssd": "M.2 NVMe 固态",
  "thermal-paste": "导热硅脂",
  "cooler": "双塔风冷散热器",
  "motherboard": "ATX 主板",
  "psu": "模组电源",
  "gpu": "独立显卡",
  "cables": "电源线缆与面板跳线",
  "case": "机箱与侧板",
  "case-glass": "透明侧板"
};

export const componentNameMapEn: Record<string, string> = {
  "cpu": "CPU Processor",
  "ram": "Dual-Channel RAM",
  "ssd": "M.2 NVMe SSD",
  "thermal-paste": "Thermal Paste",
  "cooler": "Dual-Tower Air Cooler",
  "motherboard": "ATX Motherboard",
  "psu": "Modular Power Supply",
  "gpu": "Discrete Graphics Card",
  "cables": "Power Cables & Front Panel Headers",
  "case": "Case & Side Panel",
  "case-glass": "Transparent Side Panel"
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
  "1": {
    "title": "Motherboard Preparation & CPU Installation",
    "subtitle": "AM5 Socket · Triangle Alignment · Retention Lever",
    "summary": "Disconnect power, prepare the motherboard on a stable surface, and gently seat the aligned processor in its AM5 socket.",
    "instructions": [
      "Switch off and unplug the power supply, and take anti-static precautions. Place the motherboard on its clean, flat cardboard box; do not use the outside of an anti-static bag as a work mat.",
      "Open the CPU retention lever and load plate as directed by the motherboard manual, keeping fingers and tools away from socket pins.",
      "Hold the CPU by its edges. Match its corner triangle with the socket alignment mark and check the locating notches.",
      "Keep the CPU level and lower it gently into the socket. It should settle naturally without pressing or sliding it across the pins.",
      "Confirm that all corners sit flat, then close the plate and lock the lever as instructed. The protective cap typically releases during locking; keep it for shipping or service."
    ],
    "criticalWarning": "AM5 socket pins are delicate. If the CPU will not sit flat, check its orientation before closing the load plate. Never touch the pins.",
    "debugCheck": "CPU sits flat and correctly aligned, lever is locked, and the socket is free of debris."
  },
  "2": {
    "title": "Dual-Channel Memory Installation",
    "subtitle": "Check the Key Notch · A2 / B2 in This Example",
    "summary": "This example installs two DDR5 modules in A2 and B2. Check that both ends of each module are fully seated.",
    "instructions": [
      "Check the motherboard population order. This example uses the second and fourth slots from the CPU, A2 and B2; other boards may specify a different order.",
      "Open the movable slot latches. Some slots have only one movable latch; do not pry open the fixed end.",
      "Align the asymmetric contact-edge notch with the slot key and verify that the memory type matches the board.",
      "Press evenly at both ends until the module is fully seated and the movable latches close. Do not rely on an audible click alone."
    ],
    "criticalWarning": "If resistance feels abnormal, stop and check the key notch, latches and memory type. Do not rock or strike the module.",
    "debugCheck": "Both ends sit at the same height, contacts are seated, and movable latches and fixed ends correctly retain the module."
  },
  "3": {
    "title": "M.2 NVMe SSD Installation",
    "subtitle": "About 30° Insertion · Lower and Secure the Tail · Check Thermal-Pad Film",
    "summary": "Insert the M.2 2280 SSD at an angle, then gently pivot its tail down around the seated connector and secure it.",
    "instructions": [
      "Choose an NVMe-compatible slot using the board manual, check lane-sharing restrictions, and set the standoff or latch to the 80 mm position for a 2280 drive. Remove the heatsink if fitted.",
      "Align the key notch and gently insert the SSD at about 30° until its connector is seated.",
      "Lower the raised tail onto the standoff and secure it with the supplied screw or toolless latch. Do not bend the SSD circuit board.",
      "If fitting a heatsink, remove any thermal-pad film marked for removal and reinstall the heatsink as instructed. Do not peel off the SSD product label."
    ],
    "criticalWarning": "Check standoff position and thermal-pad thickness. Do not press an unsupported SSD down or leave protective film between thermal contact surfaces.",
    "debugCheck": "SSD is flat and secure, its connector is seated, and the fitted heatsink does not bend the board."
  },
  "4": {
    "title": "CPU Cooler & Thermal Paste Installation",
    "subtitle": "Inspect Base Protection · Follow Paste Instructions · Rearward Airflow",
    "summary": "Install the dual-tower cooler with AM5-compatible mounts, check the base and paste, and direct airflow from front to rear.",
    "instructions": [
      "Fit the AM5 brackets, spacers and mounts specified by the cooler manual. Retain the motherboard backplate when required by those instructions.",
      "Check for pre-applied thermal paste. If none is present, use the amount and pattern specified by the cooler or paste manufacturer; do not add paste over an existing application.",
      "Inspect the cooler base for removable shipping film or a protective cover. Remove it if present and keep the contact surface clean.",
      "Align the mount and tighten screws evenly in alternating turns to the specified stop or torque. Do not keep tightening beyond that point.",
      "This example blows from the case front toward the rear exhaust. Connect CPU_FAN; follow the board manual for splitters, CPU_OPT and header current limits."
    ],
    "criticalWarning": "Leftover film, poor contact or incorrect paste application can impair cooling. Check CPU temperature and fan status in BIOS and shut down to investigate abnormal readings.",
    "debugCheck": "Mount is secure, fans clear the RAM and cables, airflow direction is consistent, and CPU_FAN is connected."
  },
  "5": {
    "title": "Install the Motherboard Assembly in the Case",
    "subtitle": "Match Standoffs · Align Rear I/O · Support Installed Components",
    "summary": "Move the motherboard, installed CPU, memory, SSD and cooler into the case together, then align and secure the mounting holes.",
    "instructions": [
      "Remove side panels as directed by the case manual. Place glass on a soft, flat surface where it cannot be knocked over.",
      "Match every case standoff to an actual motherboard mounting hole. Hole counts vary by board design; remove all extra standoffs beneath areas without mounting holes.",
      "If the board uses a separate I/O shield, fit it into the rear opening first and check that its tabs do not obstruct the ports.",
      "Support the board at its edges and carry the weight securely, keeping clear of pins and cables. Lower the installed assembly into the case; do not use the cooler as a handle.",
      "Align the rear ports and mounting holes, start screws loosely, then tighten evenly until secure without damaging the circuit board."
    ],
    "criticalWarning": "Misplaced or extra metal standoffs can short circuitry on the back of the board. Check each position and remove dropped screws before powering on.",
    "debugCheck": "Mounting holes are correctly supported, rear ports are unobstructed, and no loose screws remain in the case."
  },
  "6": {
    "title": "Power Supply & Motherboard Power",
    "subtitle": "Rear PSU Insertion · 24-Pin ATX · CPU EPS",
    "summary": "This example inserts the PSU from the rear with its fan facing the bottom intake, then connects motherboard and CPU power.",
    "instructions": [
      "Keep mains power disconnected. Pre-connect needed modular cables if convenient, using only cables supplied with the PSU or explicitly approved as compatible by its manufacturer.",
      "Follow the case manual for its rear PSU bracket and insert the PSU. This case has a bottom vent and filter, so the fan faces downward for intake; keep clearance beneath the case.",
      "Secure the PSU and bracket with the supplied hardware. Other cases may require side insertion or a different fan orientation depending on ventilation.",
      "Route the 24-Pin ATX cable through the cable opening and seat it in the matching motherboard socket with the latch engaged.",
      "Connect the cable marked CPU / EPS, typically 4+4-Pin, to the CPU power socket. Connect additional sockets when required by the motherboard and processor instructions."
    ],
    "criticalWarning": "CPU EPS 4+4-Pin and GPU PCIe 6+2-Pin are not interchangeable. Modular PSU pinouts can differ between models even when plugs physically fit.",
    "debugCheck": "PSU is secure with a clear intake; 24-Pin and all required CPU power connectors are fully seated and latched."
  },
  "7": {
    "title": "Graphics Card Installation & Power",
    "subtitle": "Horizontal Mounting · Primary PCIe x16 Slot · Support and Clearance",
    "summary": "This example uses a conventional horizontal GPU with fans facing downward. Seat it in the primary PCIe x16 slot and secure the rear bracket.",
    "instructions": [
      "Remove the expansion-slot covers required by the actual card thickness and position. Check card length and cable clearance.",
      "Release the primary PCIe x16 slot lock as directed by the board manual. Some boards use a separate release button; do not force fixed parts.",
      "Support the GPU with both hands, align the contact edge and rear bracket, and apply even pressure in the slot insertion direction until fully seated and locked.",
      "Secure the rear bracket and fit a support for heavier cards as instructed by the manufacturer to prevent excessive sag.",
      "Connect power according to the actual card: PCIe 6/8-Pin, 16-Pin, or no auxiliary connector on some models. Fully seat and latch plugs; avoid tight bends or sideways strain close to connectors."
    ],
    "criticalWarning": "An incompletely seated power plug can overheat. Follow GPU and PSU cable requirements, connect all required sockets, and allow space for cable bends and the side panel.",
    "debugCheck": "PCIe lock is engaged, bracket and support are secure, power plugs are seated, and GPU fans are unobstructed."
  },
  "8": {
    "title": "Front Panel Headers & I/O",
    "subtitle": "Follow the Pinout · POWER SW · USB · HD AUDIO",
    "summary": "Use the motherboard manual to connect the power switch, LEDs, front USB and audio, then route cables clear of fans.",
    "instructions": [
      "Find the POWER SW two-pin connector in the case front-panel bundle. Some cases use a combined connector; check its pin arrangement first.",
      "Locate the F_PANEL / JFP1 or equivalent pinout in the board manual and connect POWER SW to the designated pair. Mechanical switches are normally not polarity-sensitive.",
      "Connect RESET SW and POWER LED / HDD LED as needed, observing LED polarity.",
      "Connect front USB cables to matching headers with their keys aligned. Front USB Type-C uses its corresponding header; never force a plug into another socket.",
      "Connect HD AUDIO and any case fans as required. Route cables behind the tray and secure them without contacting blades or creating side-panel pinch points."
    ],
    "criticalWarning": "Header names, positions and pinouts vary by motherboard. Check the manual, keep power disconnected, and do not insert USB header plugs at an angle.",
    "debugCheck": "Power-switch pins are correct, USB and audio are seated, fans are connected, and cables cannot catch in fan blades."
  },
  "9": {
    "title": "Close the Side Panel & Check First Boot",
    "subtitle": "Inspect Wiring · Observe POST · Enter BIOS",
    "summary": "Check fasteners and cables, fit the side panel, connect the monitor and power, and observe startup before entering BIOS.",
    "instructions": [
      "Check for loose screws and cables near fans, then align and secure the panel following the case manual. Do not press on the GPU power connector.",
      "When using a discrete GPU, normally connect HDMI / DP to the graphics card. Motherboard video outputs can also work when the CPU has integrated graphics and the platform supports and enables them.",
      "Connect the power cord and keyboard, switch the PSU to I / ON, and press the case power button.",
      "Interpret diagnostic LEDs or codes using the board manual. CPU, DRAM, VGA and BOOT behavior varies; BOOT may remain lit when no bootable operating system is installed.",
      "Use the documented key, commonly Delete or F2, to enter BIOS. Check CPU, memory capacity and SSD detection, temperatures and fan status.",
      "Confirm a stable boot at default settings first. Enable a compatible EXPO / XMP profile only if desired, then verify stability; memory overclocking is optional for first boot."
    ],
    "criticalWarning": "First boot or memory-setting changes can trigger DDR5 training and a prolonged blank screen. Duration depends on the platform, BIOS and memory configuration; follow the board manual rather than a universal time limit.",
    "debugCheck": "BIOS is accessible, hardware detection is correct, and temperatures and fan status are reasonable. Interpret diagnostics before proceeding to OS installation."
  }
};
