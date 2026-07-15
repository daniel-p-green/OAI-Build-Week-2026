export const OAI_UI_SOURCE = {
  fileKey: "jVilV9akIrMbbpl8sUqC6K",
  inventory: "research/openai-apps-figma-component-inventory-2026-07-14.md",
} as const;

export const OAI_UI_COMPONENTS = {
  fullScreen: "2133:27199",
  navigationHeader: "2:626",
  button: "2:465",
  buttonInspectedInstance: "7:104094",
  token: "2:373",
  checkbox: "5:34676",
  menu: "6:9803",
  dropdownMenu: "2:415",
  input: "7:109657",
  textArea: "6:20458",
  modalInput: "7:109664",
  card: "2004:22170",
  listGroup: "2004:21591",
  listRow: "2002:21224",
  entityCardSimple: "2006:3897",
  entityCardMedia: "2117:34873",
  carousel: "2004:30840",
  carouselRow: "2004:29867",
  headerMobile: "2124:13243",
  sidebarDesktopHeader: "2123:26990",
  mapCard: "2117:33652",
} as const;

export const OAI_UI_TOKENS = {
  backgroundPrimary: "#FFFFFF",
  backgroundSecondary: "#E8E8E8",
  backgroundTertiary: "#F3F3F3",
  textPrimary: "#0D0D0D",
  textSecondary: "#5D5D5D",
  textTertiary: "#8F8F8F",
  accentBlue: "#0285FF",
  accentRed: "#E02E2A",
  accentOrange: "#E25507",
  accentGreen: "#008635",
  radiusRound: "999px",
  radiusCard: "24px",
  radiusMenu: "12px",
  headerHeight: "52px",
  buttonHeight: "36px",
} as const;

export type OaiComponentName =
  | "Full screen"
  | "Navigation/Header"
  | "Button"
  | "IconButton"
  | "Token"
  | "Checkbox"
  | "Input"
  | "TextArea"
  | "Card"
  | "ListGroup"
  | "ListRow"
  | "EntityCard / Media or map"
  | "Carousel"
  | "CarouselRow";

