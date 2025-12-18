import React, { useEffect, useState } from "react";
import API_BASE_URL from "./ApiConfig";
import "./ChartResult.css";

const NaphexResults = () => {
  const [resultsMap, setResultsMap] = useState({});
  const [selectedSession, setSelectedSession] = useState("session1");

  useEffect(() => {
    const es = new EventSource(`${API_BASE_URL}/fetch-results`);

    es.onmessage = (e) => {
      const res = JSON.parse(e.data);
      if (!res.success) return;

      const map = {};
      map[res.results.date] = res.results.todayResults;

      res.results.previousResults.forEach((d) => {
        map[d.date] = {
          session1: d.session1 ?? null,
          session2: d.session2 ?? null,
        };
      });

      setResultsMap(map);
    };

    return () => es.close();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");

  const groupWeeks = (arr) => {
    const out = [];
    for (let i = 0; i < arr.length; i += 7) {
      out.push(arr.slice(i, i + 7));
    }
    return out;
  };

  const SectionGrid = ({ data }) => {
    const openPana = data?.["open-pana"]
      ? data["open-pana"].split("")
      : ["-", "-", "-"];

    const closePana = data?.["close-pana"]
      ? data["close-pana"].split("")
      : ["-", "-", "-"];

    const openNum = data?.["open-number"];
    const closeNum = data?.["close-number"];

    const PP =
      openNum !== undefined && closeNum !== undefined
        ? `${openNum}${closeNum}`
        : "-";

    return (
      <div className="section">
        <div className="grid header">
          <div>pp</div>
        </div>

        <div className="grid">
          <div>{openPana[0]}P</div>
          <div></div>
          <div>{closePana[0]}P</div>
        </div>

        <div className="grid">
          <div>{openPana[1]}P</div>
          <div>{PP}</div>
          <div>{closePana[1]}P</div>
        </div>

        <div className="grid">
          <div>{openPana[2]}P</div>
          <div></div>
          <div>{closePana[2]}P</div>
        </div>
      </div>
    );
  };

  const dates = Object.keys(resultsMap).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const weeks = groupWeeks(dates);
  weeks.forEach((week) => week.reverse());

  return (
    <div className="chart-wrapper">
      {/* Header */}
      <div className="chart-header">
        <h1>Fruit Game Chart Results</h1>
      </div>

      {/* Session Filter Buttons */}
      <div className="session-filter">
        <button
          className={selectedSession === "session1" ? "active" : ""}
          onClick={() => setSelectedSession("session1")}
        >
          Session 1
        </button>
        <button
          className={selectedSession === "session2" ? "active" : ""}
          onClick={() => setSelectedSession("session2")}
        >
          Session 2
        </button>
      </div>

      {/* Results Container */}
      <div className="result-container">
        {weeks.map((week, i) => (
          <div key={i} className="week-row">
            <div className="week-label">
              <div className="week-date-start">{formatDate(week[0])}</div>
              <div className="week-date-divider">to</div>
              <div className="week-date-end">
                {formatDate(week[week.length - 1])}
              </div>
            </div>

            <div className="week-days">
              {week.map((date) => (
                <div key={date} className="day-column">
                  <div className="date">{formatDate(date)}</div>

                  {selectedSession === "session1" && (
                    <SectionGrid data={resultsMap[date]?.session1} />
                  )}

                  {selectedSession === "session2" && (
                    <SectionGrid data={resultsMap[date]?.session2} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NaphexResults;