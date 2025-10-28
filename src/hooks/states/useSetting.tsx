import {
  resetSetting,
  setSetting as setSettingSlice,
  updateDirection,
  updateHeader,
  updateLanguage,
  updateLayout,
  updateSidebar,
  updateTheme,
} from "@/redux/slices/setting-slice";
import type { AppDispatch, RootState } from "@/redux/store";
import type { TSettingState } from "@/types/state.type";
import { useDispatch, useSelector } from "react-redux";

const useSetting = () => {
  const dispatch = useDispatch<AppDispatch>();
  const setting = useSelector((state: RootState) => state.setting);

  // Individual setters
  const setTheme = (theme: TSettingState["theme"]) =>
    dispatch(updateTheme(theme));
  const setDirection = (direction: TSettingState["direction"]) =>
    dispatch(updateDirection(direction));
  const setLanguage = (language: TSettingState["language"]) =>
    dispatch(updateLanguage(language));
  const setSidebar = (sidebar: TSettingState["sidebar"]) =>
    dispatch(updateSidebar(sidebar));
  const setHeader = (header: TSettingState["header"]) =>
    dispatch(updateHeader(header));
  const setLayout = (layout: TSettingState["layout"]) =>
    dispatch(updateLayout(layout));

  // Full setting update
  const setSetting = (payload: Partial<TSettingState>) =>
    dispatch(setSettingSlice({ ...setting, ...payload }));

  // Reset to default
  const reset = () => dispatch(resetSetting());

  // Toggle functions
  const toggleTheme = () => {
    const order: TSettingState["theme"][] = ["light", "dark", "system"];
    const nextIndex = (order.indexOf(setting.theme) + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  const toggleDirection = () => {
    setDirection(setting.direction === "ltr" ? "rtl" : "ltr");
  };

  const toggleLanguage = () => {
    setLanguage(setting.language === "en" ? "bn" : "en");
  };

  const toggleSidebar = () => {
    setSidebar(setting.sidebar === "expanded" ? "compact" : "expanded");
  };

  return {
    setting,
    setSetting,
    reset,
    setTheme,
    setDirection,
    setLanguage,
    setSidebar,
    setHeader,
    setLayout,
    toggleTheme,
    toggleDirection,
    toggleLanguage,
    toggleSidebar,
  };
};

export default useSetting;
