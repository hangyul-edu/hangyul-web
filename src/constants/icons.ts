import { eraserIcon, noteIcon, paperIcon, pencilIcon } from "@/assets/icons";

export const ICONS = {
  eraser: {
    src: eraserIcon,
    width: 48,
    height: 50,
  },
  pencil: {
    src: pencilIcon,
    width: 46,
    height: 51,
  },
  paper: {
    src: paperIcon,
    width: 48,
    height: 56,
  },
  note: {
    src: noteIcon,
    width: 48,
    height: 50,
  },
} as const;
