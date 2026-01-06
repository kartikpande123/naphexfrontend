import React, { useEffect, useState } from "react";
import API_BASE_URL from "./ApiConfig";

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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        padding: '2px',
        fontSize: 'clamp(6px, 1.5vw, 10px)',
        border: '1px solid #ccc',
        borderRadius: '3px',
        backgroundColor: '#fff'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1px',
          textAlign: 'center',
          alignItems: 'end',
          padding: '2px 0'
        }}>
          <div>{openPana[0]}P</div>
          <div style={{ fontSize: 'clamp(5px, 1.2vw, 8px)', fontWeight: 'bold', lineHeight: '1' }}>pp</div>
          <div>{closePana[0]}P</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1px',
          textAlign: 'center',
          fontWeight: 'bold',
          padding: '1px 0'
        }}>
          <div>{openPana[1]}P</div>
          <div style={{ 
            backgroundColor: '#d5d5d5', 
            padding: '2px 3px', 
            borderRadius: '2px',
            fontWeight: 'bold'
          }}>{PP}</div>
          <div>{closePana[1]}P</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1px',
          textAlign: 'center',
          padding: '1px 0'
        }}>
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
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 'clamp(4px, 2vw, 16px)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 'clamp(6px, 2vw, 16px)',
        padding: 'clamp(4px, 2vw, 12px)',
        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(12px, 4vw, 24px)',
          color: '#333',
          fontWeight: 'bold'
        }}>Fruit Game Chart Results</h1>
      </div>

      {/* Session Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: 'clamp(4px, 2vw, 12px)',
        marginBottom: 'clamp(6px, 2vw, 16px)',
        justifyContent: 'center'
      }}>
        <button
          style={{
            flex: 1,
            maxWidth: '150px',
            padding: 'clamp(4px, 1.5vw, 10px) clamp(8px, 3vw, 20px)',
            fontSize: 'clamp(8px, 2.5vw, 14px)',
            fontWeight: selectedSession === "session1" ? 'bold' : 'normal',
            backgroundColor: selectedSession === "session1" ? '#4CAF50' : '#fff',
            color: selectedSession === "session1" ? '#fff' : '#333',
            border: '2px solid #4CAF50',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onClick={() => setSelectedSession("session1")}
        >
          Session 1
        </button>
        <button
          style={{
            flex: 1,
            maxWidth: '150px',
            padding: 'clamp(4px, 1.5vw, 10px) clamp(8px, 3vw, 20px)',
            fontSize: 'clamp(8px, 2.5vw, 14px)',
            fontWeight: selectedSession === "session2" ? 'bold' : 'normal',
            backgroundColor: selectedSession === "session2" ? '#2196F3' : '#fff',
            color: selectedSession === "session2" ? '#fff' : '#333',
            border: '2px solid #2196F3',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onClick={() => setSelectedSession("session2")}
        >
          Session 2
        </button>
      </div>

      {/* Results Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(4px, 1vw, 12px)'
      }}>
        {weeks.map((week, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 'clamp(3px, 1vw, 8px)',
            backgroundColor: '#fff',
            borderRadius: '6px',
            padding: 'clamp(3px, 1vw, 8px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(1px, 0.5vw, 2px)',
              minWidth: 'fit-content',
              padding: 'clamp(2px, 1vw, 4px)',
              backgroundColor: '#f9f9f9',
              borderRadius: '3px'
            }}>
              <div style={{
                fontSize: 'clamp(6px, 1.5vw, 9px)',
                color: '#666',
                whiteSpace: 'nowrap',
                fontWeight: 'bold'
              }}>
                {formatDate(week[0])}
              </div>
              <div style={{
                fontSize: 'clamp(5px, 1.2vw, 8px)',
                color: '#999'
              }}>
                to
              </div>
              <div style={{
                fontSize: 'clamp(6px, 1.5vw, 9px)',
                color: '#666',
                whiteSpace: 'nowrap',
                fontWeight: 'bold'
              }}>
                {formatDate(week[week.length - 1])}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${week.length}, 1fr)`,
              gap: 'clamp(1px, 0.5vw, 4px)',
              flex: 1
            }}>
              {week.map((date) => (
                <div key={date} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(1px, 0.5vw, 3px)'
                }}>
                  <div style={{
                    fontSize: 'clamp(5px, 1.2vw, 9px)',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '1px',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    borderRadius: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {formatDate(date)}
                  </div>

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