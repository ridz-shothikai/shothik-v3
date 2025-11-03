"use client";
import { trySamples } from "@/_mock/trySamples";
import { trackEvent } from "@/analysers/eventTracker";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useResponsive from "@/hooks/ui/useResponsive";
import useLoadingText from "@/hooks/useLoadingText";
import useSnackbar from "@/hooks/useSnackbar";
import { setShowLoginModal } from "@/redux/slices/auth";
import { setAlertMessage, setShowAlert } from "@/redux/slices/tools";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserActionInput from "../common/UserActionInput";
import BottomBar from "./BottomBar";
import LanguageMenu from "./LanguageMenu";

const Translator = () => {
  const [outputContend, setOutputContend] = useState("");
  const { user, accessToken } = useSelector((state) => state.auth);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const isMobile = useResponsive("down", "sm");
  const enqueueSnackbar = useSnackbar();
  const dispatch = useDispatch();
  const loadingText = useLoadingText(isLoading);
  const sampleText = trySamples.translator.English;
  const [translateLang, setTranslateLang] = useState({
    fromLang: "Auto Detect",
    toLang: "English",
  });

  const handleLanguageChange = (newLangState) => {
    setOutputContend(""); // Clear output when language changes
    setTranslateLang(newLangState);
  };

  function handleInput(e) {
    const value = e.target.value;
    setUserInput(value);
  }

  function handleClear() {
    setUserInput("");
    setOutputContend("");
  }

  async function fetchWithStreaming(payload, api = "/translator") {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX + api;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw { message: error.message, error: error.error };
      }

      const stream = response.body;
      const decoder = new TextDecoderStream();
      const reader = stream.pipeThrough(decoder).getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        setOutputContend((prev) => prev + value);
      }
    } catch (error) {
      throw error;
    }
  }

  async function handleSubmit(payloads, url) {
    try {
      //track event
      trackEvent("click", "translator", "translator_click", 1);

      setOutputContend("");
      setIsLoading(true);
      const direction = translateLang.fromLang + " to " + translateLang.toLang;
      const payload = payloads ? payloads : { data: userInput, direction };

      await fetchWithStreaming(payload, url);
    } catch (error) {
      if (/LIMIT_REQUEST|PACAKGE_EXPIRED/.test(error?.error)) {
        dispatch(setShowAlert(true));
        dispatch(setAlertMessage(error?.message));
      } else if (error?.error === "UNAUTHORIZED") {
        dispatch(setShowLoginModal(true));
      } else {
        enqueueSnackbar(error?.message, { variant: "error" });
      }
      setOutputContend("");
    } finally {
      setIsLoading(false);
    }
  }

  const handleHumanize = async () => {
    try {
      setIsHumanizing(true);
      const payload = {
        data: outputContend,
        language: translateLang.toLang,
        mode: "Fixed",
        synonym: "Basic",
      };
      await handleSubmit(payload, "/fix-grammar");

      enqueueSnackbar("Translation humanized successfully.", {
        variant: "success",
      });
    } catch (err) {
      const error = err?.response?.data;
      if (/LIMIT_REQUEST|PACAKGE_EXPIRED/.test(error?.error)) {
        dispatch(setShowAlert(true));
        dispatch(setAlertMessage("Humanize limit exceeded, Please upgrade"));
      } else if (error?.error === "UNAUTHORIZED") {
        dispatch(setShowLoginModal(true));
      } else {
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    } finally {
      setIsHumanizing(false);
    }
  };

  function reverseText() {
    if (!outputContend) return;
    const input = userInput;
    setUserInput(outputContend);
    setOutputContend(input);
  }

  return (
    <Card className="mt-4 rounded-xl border p-8 shadow-sm">
      <LanguageMenu
        isLoading={isLoading || isHumanizing}
        userInput={userInput}
        reverseText={reverseText}
        translateLang={translateLang}
        setTranslateLang={handleLanguageChange}
      />

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative min-h-[400px] overflow-y-auto sm:min-h-[480px]">
          <Textarea
            name="input"
            rows={isMobile ? 15 : 19}
            placeholder="Input your text here..."
            value={userInput}
            onChange={handleInput}
            className="border-border h-full min-h-[400px] w-full resize-none rounded-lg p-4 focus-visible:ring-0 focus-visible:ring-offset-0 sm:min-h-[480px]"
          />
          {isMobile && (
            <BottomBar
              handleClear={handleClear}
              handleHumanize={handleHumanize}
              handleSubmit={handleSubmit}
              isHumanizing={isHumanizing}
              isLoading={isLoading}
              outputContend={outputContend}
              userInput={userInput}
              userPackage={user?.package}
            />
          )}
          {!userInput ? (
            <UserActionInput
              setUserInput={setUserInput}
              isMobile={isMobile}
              sampleText={sampleText}
            />
          ) : null}
        </div>
        {isMobile && !userInput ? null : (
          <div className="h-[400px] overflow-y-auto sm:h-[480px]">
            <Textarea
              name="output"
              rows={isMobile ? 15 : 19}
              placeholder="Translated text"
              value={loadingText ? loadingText : outputContend}
              disabled
              className="border-border text-foreground h-full min-h-[400px] w-full resize-none rounded-lg p-4 disabled:cursor-default disabled:opacity-100 sm:min-h-[480px]"
            />
          </div>
        )}
      </div>

      {!isMobile && (
        <BottomBar
          handleClear={handleClear}
          handleHumanize={handleHumanize}
          handleSubmit={handleSubmit}
          isHumanizing={isHumanizing}
          isLoading={isLoading}
          outputContend={outputContend}
          userInput={userInput}
          userPackage={user?.package}
        />
      )}
    </Card>
  );
};

export default Translator;
