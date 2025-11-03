import ArrowSwitchIcon from "@/components/icons/ArrowSwitchIcon";
import { Button } from "@/components/ui/button";
import { detectLanguageV2 } from "@/hooks/languageDitectorV2";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import LanguageMenus from "../common/LanguageMenus";

const LanguageMenu = ({
  isLoading,
  userInput,
  reverseText,
  translateLang,
  setTranslateLang,
}) => {
  const [languageDirection, setLanguageDirection] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [anchorEl, setEnchorEl] = useState(null);

  useEffect(() => {
    if (!userInput) return;
    const language = detectLanguageV2(userInput);
    setTranslateLang((prev) => {
      return { ...prev, fromLang: language };
    });
  }, [userInput]);

  function handleLanguage(e, direction) {
    setEnchorEl(e.target);
    setShowMenu(true);
    setLanguageDirection(direction);
  }

  const handleReverseTranslation = (e) => {
    setTranslateLang((prev) => ({
      fromLang: prev.toLang,
      toLang: prev.fromLang,
    }));

    reverseText();
  };

  function handleLanguageMenu(value) {
    setTranslateLang((prev) => {
      return { ...prev, [languageDirection]: value };
    });
  }

  return (
    <div className="mb-1 flex flex-row items-center justify-center">
      <Button
        disabled={isLoading}
        onClick={(e) => handleLanguage(e, "fromLang")}
        variant="ghost"
      >
        {translateLang.fromLang}
        <ChevronDown className="h-4 w-4" />
      </Button>
      <LanguageMenus
        anchorEl={anchorEl}
        handleClose={() => setShowMenu(false)}
        handleLanguageMenu={handleLanguageMenu}
        open={showMenu}
      />
      <Button
        onClick={handleReverseTranslation}
        disabled={!userInput || isLoading}
        variant="ghost"
        className={cn(
          !userInput || isLoading ? "cursor-default" : "cursor-pointer",
        )}
      >
        <ArrowSwitchIcon className="h-4 w-4" />
      </Button>
      <Button
        disabled={isLoading}
        onClick={(e) => handleLanguage(e, "toLang")}
        variant="ghost"
      >
        {translateLang.toLang}
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LanguageMenu;
