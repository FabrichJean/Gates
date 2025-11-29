import { useCallback } from "react";
import useCardStore from "../stores/useCardStore";

type CardController = {
  visible: boolean;
  collapsed: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  toggleCollapsed: () => void;
  setVisible: (v: boolean) => void;
  setCollapsed: (c: boolean) => void;
};

export function useCardFlottant(): CardController {
  const visible = useCardStore((s) => s.visible);
  const collapsed = useCardStore((s) => s.collapsed);
  const show = useCardStore((s) => s.show);
  const hide = useCardStore((s) => s.hide);
  const toggle = useCardStore((s) => s.toggle);
  const expand = useCardStore((s) => s.expand);
  const collapse = useCardStore((s) => s.collapse);
  const setVisible = useCardStore((s) => s.setVisible);
  const setCollapsed = useCardStore((s) => s.setCollapsed);

  const toggleCollapsed = useCallback(() => {
    const c = useCardStore.getState().collapsed;
    setCollapsed(!c);
  }, [setCollapsed]);

  return {
    visible,
    collapsed,
    show,
    hide,
    toggle,
    expand,
    collapse,
    toggleCollapsed,
    setVisible,
    setCollapsed,
  };
}

export default useCardFlottant;
