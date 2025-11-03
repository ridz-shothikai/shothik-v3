// HistoryTab.jsx
import { Button } from "@/components/ui/button";
import {
  setActiveHistory,
  setHistories,
  setHistoryGroups,
} from "@/redux/slices/paraphraseHistorySlice";
import { historyGroupsByPeriod } from "@/utils/historyGroupsByPeriod";
import {
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Trash2 as Trash,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const HistoryTab = ({ onClose }) => {
  const dispatch = useDispatch();

  const [expandedEntries, setExpandedEntries] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const { accessToken } = useSelector((state) => state.auth);

  const { activeHistory, histories, historyGroups } = useSelector(
    (state) => state.paraphraseHistory,
  );

  const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/p-v2/api";

  // const API_BASE = "http://localhost:3050/api";

  // const historyGroupsByPeriod = (histories) => {
  //   const now = new Date();
  //   const currentMonth = now.getMonth();
  //   const currentYear = now.getFullYear();

  //   const groups = histories.reduce((acc, entry) => {
  //     const d = new Date(entry.timestamp);
  //     const m = d.getMonth();
  //     const y = d.getFullYear();
  //     const monthName = d.toLocaleString("default", { month: "long" });
  //     const key =
  //       m === currentMonth && y === currentYear
  //         ? "This Month"
  //         : `${monthName} ${y}`;

  //     if (!acc[key]) acc[key] = [];
  //     acc?.[key]?.push({
  //       _id: entry._id,
  //       text: entry.text,
  //       time: entry.timestamp,
  //     });
  //     return acc;
  //   }, {});

  //   const result = [];

  //   if (groups?.["This Month"]) {
  //     result.push({ period: "This Month", history: groups["This Month"] });
  //     delete groups["This Month"];
  //   }
  //   Object.keys(groups)
  //     .sort((a, b) => {
  //       const [ma, ya] = a.split(" ");
  //       const [mb, yb] = b.split(" ");
  //       const da = new Date(`${ma} 1, ${ya}`);
  //       const db = new Date(`${mb} 1, ${yb}`);
  //       return db - da;
  //     })
  //     .forEach((key) => {
  //       result.push({ period: key, history: groups?.[key] });
  //     });

  //   return result;
  // };

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      if (!res.ok) console.error("Failed to fetch history");
      const data = await res.json();
      const groups = historyGroupsByPeriod(data || []);

      dispatch(setHistories(data));
      // const groups = historyGroupsByPeriod(data); // Use the utility function
      dispatch(setHistoryGroups(groups));
    } catch (err) {
      console.error(err);
    }
  }, [accessToken, dispatch, API_BASE]);

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to clear all history?")) return;
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      if (!res.ok) throw new Error("Failed to delete history");
      dispatch(setHistories([]));
      dispatch(setHistoryGroups([]));
      dispatch(setActiveHistory(null));
    } catch (err) {
      console.error(err);
    }
  };

  // const handleDeleteEntry = async (entryId) => {
  //   if (!window.confirm("Are you sure you want to delete this entry?")) return;
  //   try {
  //     const res = await fetch(`${API_BASE}/history/${entryId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  //       },
  //     });
  //     if (!res.ok) throw new Error("Failed to delete history entry");

  //     const updatedHistories = histories?.filter(
  //       (history) => history?._id !== entryId,
  //     );
  //     const groups = historyGroupsByPeriod(updatedHistories);

  //     dispatch(setHistories(updatedHistories));
  //     dispatch(setHistoryGroups(groups));

  //     if (activeHistory && activeHistory._id === entryId) {
  //       dispatch(setActiveHistory(null));
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleDeleteEntry = useCallback(
    async (entryId) => {
      if (!window.confirm("Are you sure you want to delete this entry?"))
        return;

      try {
        const res = await fetch(`${API_BASE}/history/${entryId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        if (!res.ok) throw new Error("Failed to delete history entry");

        const updatedHistories = histories.filter(
          (history) => history._id !== entryId,
        );
        dispatch(setHistories(updatedHistories));
        const groups = historyGroupsByPeriod(updatedHistories);
        dispatch(setHistoryGroups(groups));

        if (activeHistory && activeHistory._id === entryId) {
          dispatch(setActiveHistory(null));
        }
      } catch (err) {
        console.error(err);
      }
    },
    [accessToken, histories, activeHistory, dispatch, API_BASE],
  );

  const handleSetActiveHistory = (entry) => {
    dispatch(setActiveHistory(entry));
    onClose();
  };

  // useEffect(() => {
  //   if (!accessToken) return;
  //   fetchHistory();
  // }, [accessToken]);

  useEffect(() => {
    if (!(historyGroups?.length > 0)) return;
    const init = {};
    historyGroups?.forEach((group) => {
      init[group?.period] = true;
    });
    setExpandedGroups(init);
  }, [historyGroups]);

  const toggleGroup = (period) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [period]: !prev?.[period],
    }));
  };

  const toggleEntryExpansion = (period, index) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [`${period}-${index}`]: !prev?.[`${period}-${index}`],
    }));
  };

  return (
    <div id="history_tab" className="px-2 py-1">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-2">
        <h6 className="text-lg font-bold">History</h6>
        {accessToken && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={fetchHistory}
              className="min-w-0 p-1"
              aria-label="Refresh history"
            >
              <RefreshCcw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDeleteAll}
              className="min-w-0 p-1"
              aria-label="Clear history"
            >
              <Trash className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Period groups */}
      {historyGroups?.length === 0 ? (
        <p className="text-muted-foreground px-2 text-sm">
          No history entries.
        </p>
      ) : (
        historyGroups?.map(({ period, history }) => (
          <div key={period} className="mb-2">
            <div
              onClick={() => toggleGroup(period)}
              className="mb-1 flex cursor-pointer items-center justify-between px-2"
            >
              <span className="text-muted-foreground text-sm">{period}</span>
              {expandedGroups?.[period] ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="min-w-0 p-1"
                  aria-label="Collapse group"
                >
                  <ChevronUp className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="min-w-0 p-1"
                  aria-label="Expand group"
                >
                  <ChevronDown className="size-4" />
                </Button>
              )}
            </div>
            <div className="border-border border-b" />
            {expandedGroups?.[period] &&
              history?.map((entry, i) => (
                <div
                  key={i}
                  onClick={() => handleSetActiveHistory(entry)}
                  className={`cursor-pointer px-2 pt-1 pb-1 transition-colors ${i < history?.length - 1 ? "border-border border-b" : ""} ${entry?._id === activeHistory?._id ? "bg-primary/10" : "bg-transparent"} `}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {new Date(entry.time).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry._id);
                      }}
                      className="text-destructive min-w-0 p-1"
                      aria-label="Delete entry"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                  <p className="text-sm">
                    {expandedEntries?.[`${period}-${i}`]
                      ? entry?.text
                      : truncateText(entry?.text, 20)}
                    {entry?.text?.split(" ")?.length > 20 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEntryExpansion(period, i);
                        }}
                        className="ml-1"
                      >
                        {expandedEntries?.[`${period}-${i}`]
                          ? "Read Less"
                          : "Read More"}
                      </Button>
                    )}
                  </p>
                </div>
              ))}
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryTab;

// HELPER FUNCTION
export function truncateText(text, limit) {
  const words = text?.split(" ");
  if (words?.length > limit) {
    return words?.slice(0, limit).join(" ") + "...";
  }
  return text;
}
