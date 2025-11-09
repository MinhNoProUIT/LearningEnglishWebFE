import React from "react";
import {
  Box,
  Button,
  Popper,
  Paper,
  MenuList,
  MenuItem,
  ClickAwayListener,
  Grow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Child = { label: string; href: string; allow?: boolean };

type HoverDropdownProps = {
  label: string;
  childrenItems: Child[];
  active: boolean;
  onNavigate: (href: string) => void;
  buttonSx?: object;
  fontFamily?: string;
};

export function HoverDropdown({
  label,
  childrenItems,
  active,
  onNavigate,
  buttonSx,
  fontFamily = "var(--font-geist-sans)",
}: HoverDropdownProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<NodeJS.Timeout | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = (delay = 140) => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), delay);
  };

  const handlePointerEnter = () => {
    cancelClose();
    setOpen(true);
  };

  const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const to = e.relatedTarget as Node | null;
    if (containerRef.current && to && containerRef.current.contains(to)) {
      return; // vẫn ở trong container -> không đóng
    }
    scheduleClose();
  };

  return (
    <Box
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      sx={{ display: "inline-flex", position: "relative" }}
    >
      <Button
        ref={btnRef}
        endIcon={<ExpandMoreIcon sx={{ color: "#cde3ff" }} />}
        sx={buttonSx}
      >
        {label}
      </Button>

      <ClickAwayListener
        onClickAway={(e) => {
          // chỉ đóng nếu click ra ngoài container
          if (
            containerRef.current &&
            e.target instanceof Node &&
            !containerRef.current.contains(e.target)
          ) {
            setOpen(false);
          }
        }}
      >
        <Popper
          open={open}
          anchorEl={btnRef.current}
          placement="bottom-start"
          transition
          disablePortal // ❗ để Popper là con của containerRef
          modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
          sx={{ zIndex: (t) => t.zIndex.modal }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper
                onPointerEnter={cancelClose}
                onPointerLeave={handlePointerLeave}
                sx={{ minWidth: 220, fontFamily }}
                elevation={4}
              >
                <MenuList autoFocusItem={false} sx={{ py: 0.5 }}>
                  {childrenItems
                    .filter((c) => c.allow !== false)
                    .map((c) => (
                      <MenuItem
                        key={c.href}
                        onClick={() => {
                          setOpen(false);
                          onNavigate(c.href);
                        }}
                        sx={{ fontWeight: 500 }}
                      >
                        {c.label}
                      </MenuItem>
                    ))}
                </MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
      </ClickAwayListener>
    </Box>
  );
}
