import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory2,
  Category,
  Search,
  Person,
  Logout,
  LightMode,
  DarkMode,
  Language,
  ChevronLeft,
  ChevronRight,
  Inventory,
} from "@mui/icons-material";
import { useThemeMode } from "@/core/theme/ThemeContext";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser";
import { authApi } from "@/features/auth/api/authApi";

const DRAWER_W = 260;
const MINI_W = 72;

const NAV_ITEMS = [
  { path: "/", labelKey: "nav.dashboard", Icon: Dashboard },
  { path: "/products", labelKey: "nav.products", Icon: Inventory2 },
  { path: "/categories", labelKey: "nav.categories", Icon: Category },
  { path: "/search", labelKey: "nav.search", Icon: Search },
  { path: "/profile", labelKey: "nav.profile", Icon: Person },
];

export default function AppLayout() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const { t, i18n } = useTranslation();
  const { toggleTheme, mode } = useThemeMode();
  const { clearAuth } = useAuthContext();
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const drawerW = !isMobile && collapsed ? MINI_W : DRAWER_W;
  const isRTL = muiTheme.direction === "rtl";

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearAuth();
    navigate("/login", { replace: true });
  };

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
          px: collapsed && !isMobile ? 1 : 2.5,
          py: 2,
          minHeight: 64,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                bgcolor: alpha("#fff", 0.12),
                p: 0.75,
                borderRadius: 1.5,
                display: "flex",
              }}
            >
              <Inventory sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
            >
              {t("app.name")}
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            size="small"
            onClick={() => setCollapsed((c) => !c)}
            sx={{
              color: "rgba(255,255,255,0.5)",
              "&:hover": { color: "#fff", bgcolor: alpha("#fff", 0.08) },
            }}
          >
            {collapsed ? (
              isRTL ? (
                <ChevronLeft />
              ) : (
                <ChevronRight />
              )
            ) : isRTL ? (
              <ChevronRight />
            ) : (
              <ChevronLeft />
            )}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Nav items */}
      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {NAV_ITEMS.map(({ path, labelKey, Icon }) => {
          const active = isActive(path);
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={collapsed && !isMobile ? t(labelKey) : ""}
                placement={isRTL ? "left" : "right"}
              >
                <ListItemButton
                  onClick={() => {
                    navigate(path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    minHeight: 42,
                    px: collapsed && !isMobile ? 1.25 : 1.5,
                    justifyContent:
                      collapsed && !isMobile ? "center" : "flex-start",
                    bgcolor: active ? alpha("#4F46E5", 0.9) : "transparent",
                    "&:hover": {
                      bgcolor: active
                        ? alpha("#4F46E5", 0.95)
                        : alpha("#fff", 0.07),
                    },
                    transition: "all 0.15s",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? 0 : 36,
                      color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={t(labelKey)}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.875rem",
                            fontWeight: active ? 600 : 500,
                            color: active ? "#fff" : "rgba(255,255,255,0.75)",
                            textAlign: "start",
                          },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* User / Logout */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <Box sx={{ p: 1.5 }}>
        {(!collapsed || isMobile) && user && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              bgcolor: alpha("#fff", 0.06),
            }}
          >
            <Avatar
              src={user.profile_image_url ?? undefined}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#4F46E5",
                fontSize: "0.8rem",
              }}
            >
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#fff",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.45)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip
          title={collapsed && !isMobile ? t("nav.logout") : ""}
          placement={isRTL ? "left" : "right"}
        >
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              minHeight: 40,
              px: 1.5,
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              color: "rgba(255,255,255,0.55)",
              "&:hover": { bgcolor: alpha("#EF4444", 0.15), color: "#FCA5A5" },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed && !isMobile ? 0 : 36,
                color: "inherit",
              }}
            >
              <Logout fontSize="small" />
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <ListItemText
                primary={t("nav.logout")}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "inherit",
                    },
                  },
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerW}px)` },
          [isRTL ? "mr" : "ml"]: { md: `${drawerW}px` },
          zIndex: (th) => th.zIndex.drawer - 1,
          transition: muiTheme.transitions.create(["width", "margin"], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              size="small"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />

          {/* Language */}
          <Tooltip
            title={
              i18n.language === "en" ? t("common.arabic") : t("common.english")
            }
          >
            <IconButton
              size="small"
              onClick={toggleLang}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                width: 36,
                height: 36,
                bgcolor: "action.hover",
                borderRadius: 1.5,
              }}
            >
              <Language fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Theme */}
          <Tooltip
            title={
              mode === "light" ? t("common.darkMode") : t("common.lightMode")
            }
          >
            <IconButton
              size="small"
              onClick={toggleTheme}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "action.hover",
                borderRadius: 1.5,
              }}
            >
              {mode === "light" ? (
                <DarkMode fontSize="small" />
              ) : (
                <LightMode fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* Avatar dropdown */}
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0.25 }}
          >
            <Avatar
              src={user?.profile_image_url ?? undefined}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: "0.8rem",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{
              horizontal: isRTL ? "left" : "right",
              vertical: "top",
            }}
            anchorOrigin={{
              horizontal: isRTL ? "left" : "right",
              vertical: "bottom",
            }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 180 } } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                navigate("/profile");
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("nav.profile")}</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleLogout();
                setAnchorEl(null);
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>{t("nav.logout")}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar — mobile */}
      <Drawer
        variant="temporary"
        anchor={isRTL ? "right" : "left"}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_W },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Sidebar — desktop */}
      <Drawer
        variant="permanent"
        anchor={isRTL ? "right" : "left"}
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerW,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerW,
            overflow: "hidden",
            transition: muiTheme.transitions.create("width", {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerW}px)` },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          bgcolor: "background.default",
          p: { xs: 2, sm: 3 },
          transition: muiTheme.transitions.create(["width", "margin"], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
