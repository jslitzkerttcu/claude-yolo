import { RED, YELLOW, CYAN, GREEN, ORANGE, RESET, BOLD } from '../lib/constants.js';

export const YOLO_ART = `${YELLOW}
    ██╗   ██╗ ██████╗ ██╗      ██████╗ ██╗
    ╚██╗ ██╔╝██╔═══██╗██║     ██╔═══██╗██║
     ╚████╔╝ ██║   ██║██║     ██║   ██║██║
      ╚██╔╝  ██║   ██║██║     ██║   ██║╚═╝
       ██║   ╚██████╔╝███████╗╚██████╔╝██╗
       ╚═╝    ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝
${ORANGE}    🔥 NO SAFETY - MAXIMUM POWER - USE WITH CAUTION 🔥${RESET}
`;

export const SAFE_ART = `${CYAN}
    ███████╗ █████╗ ███████╗███████╗
    ██╔════╝██╔══██╗██╔════╝██╔════╝
    ███████╗███████║█████╗  █████╗  
    ╚════██║██╔══██║██╔══╝  ██╔══╝  
    ███████║██║  ██║██║     ███████╗
    ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝
${GREEN}    🛡️ PROTECTED MODE - SAFETY FIRST 🛡️${RESET}
`;

export const YOLO_BANNER = `${YELLOW}🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥${RESET}`;
export const SAFE_BANNER = `${CYAN}🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️ 🛡️${RESET}`;

export function showYoloActivated() {
  console.log(YOLO_BANNER);
  console.log(YOLO_ART);
  console.log(YOLO_BANNER);
  console.log(`${RED}${BOLD}⚠️  WARNING: All safety checks DISABLED!${RESET}`);
  console.log(`${RED}⚠️  Claude can access ANY file without asking!${RESET}`);
}

export function showSafeActivated() {
  console.log(SAFE_BANNER);
  console.log(SAFE_ART);
  console.log(SAFE_BANNER);
  console.log(`${GREEN}✓ Safety checks enabled${RESET}`);
  console.log(`${GREEN}✓ Claude will ask for permissions${RESET}`);
}

export function showModeStatus(mode) {
  console.log(`${BOLD}Claude CLI Status:${RESET}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (mode === 'YOLO') {
    console.log(YOLO_ART);
    console.log(`Mode: ${YELLOW}${BOLD}YOLO${RESET} 🔥`);
    console.log(`Safety: ${RED}DISABLED${RESET}`);
    console.log(`Permissions: ${RED}BYPASSED${RESET}`);
  } else {
    console.log(SAFE_ART);
    console.log(`Mode: ${CYAN}${BOLD}SAFE${RESET} 🛡️`);
    console.log(`Safety: ${GREEN}ENABLED${RESET}`);
    console.log(`Permissions: ${GREEN}REQUIRED${RESET}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}