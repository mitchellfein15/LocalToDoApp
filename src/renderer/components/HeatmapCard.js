import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';
import './WidgetCards.css';

function getStartOfYear(year) {
  return new Date(year, 0, 1);
}

function getEndOfYear(year) {
  return new Date(year, 11, 31);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function HeatmapCard({ refreshTrigger }) {
  const currentYear = new Date().getFullYear();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);

  useEffect(() => {
    let isMounted = true;
    const loadYears = async () => {
      try {
        const years = await ApiService.getHeatmapYears();
        if (!isMounted) return;
        const normalized = Array.isArray(years) && years.length > 0
          ? years.map(Number).sort((a, b) => a - b)
          : [currentYear];
        if (!normalized.includes(currentYear)) {
          normalized.push(currentYear);
          normalized.sort((a, b) => a - b);
        }
        setAvailableYears(normalized);
        setYear((prev) => (normalized.includes(prev) ? prev : currentYear));
      } catch (error) {
        console.error('Failed to load heatmap years', error);
      }
    };

    loadYears();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, currentYear]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getHeatmap(year);
        if (isMounted) {
          setRows(data || []);
        }
      } catch (error) {
        console.error('Failed to load heatmap', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [year, refreshTrigger]);

  const countByDate = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      map[row.date] = Number(row.count);
    });
    return map;
  }, [rows]);

  const yearTotal = useMemo(
    () => Object.values(countByDate).reduce((sum, count) => sum + count, 0),
    [countByDate]
  );

  const thresholds = useMemo(() => {
    const counts = Object.values(countByDate)
      .filter((count) => count > 0)
      .sort((a, b) => a - b);

    if (counts.length === 0) {
      return { p25: 0, p50: 0, p75: 0 };
    }

    const getPercentile = (percentile) => {
      const index = Math.floor((counts.length - 1) * percentile);
      return counts[index];
    };

    return {
      p25: getPercentile(0.25),
      p50: getPercentile(0.50),
      p75: getPercentile(0.75),
    };
  }, [countByDate]);

  const monthsData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = Array.from({ length: 12 }, () => []);

    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1).getDay();
      for (let i = 0; i < firstDay; i++) {
        months[month].push(<div key={`empty-${month}-${i}`} className="heatmap-day empty" />);
      }
    }

    const start = getStartOfYear(year);
    const end = getEndOfYear(year);
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = toDateKey(cursor);
      const count = countByDate[key] || 0;
      let level = 0;
      if (count > 0) {
        if (count <= thresholds.p25) {
          level = 1;
        } else if (count <= thresholds.p50) {
          level = 2;
        } else if (count <= thresholds.p75) {
          level = 3;
        } else {
          level = 4;
        }
      }

      months[cursor.getMonth()].push(
        <div
          key={key}
          className={`heatmap-day level-${level}`}
          title={`${key}: ${count} completed`}
        />
      );
      cursor.setDate(cursor.getDate() + 1);
    }

    return months.map((days, index) => (
      <div key={monthNames[index]} className="heatmap-month">
        <span className="month-label">{monthNames[index]}</span>
        <div className="heatmap-month-grid">{days}</div>
      </div>
    ));
  }, [countByDate, thresholds, year]);

  const earliestYear = availableYears[0] ?? currentYear;
  const latestYear = availableYears[availableYears.length - 1] ?? currentYear;
  const canGoPrev = year > earliestYear;
  const canGoNext = year < latestYear;

  const shiftYear = (delta) => {
    const currentIndex = availableYears.indexOf(year);
    if (currentIndex === -1) {
      setYear(currentYear);
      return;
    }
    const next = availableYears[currentIndex + delta];
    if (typeof next === 'number') {
      setYear(next);
    }
  };

  return (
    <div className="heatmap-widget">
      <div className="heatmap-header">
        <h3 className="card-title heatmap-title">Productivity Heatmap</h3>
        <div className="heatmap-year-controls">
          <button
            type="button"
            className="heatmap-year-btn"
            onClick={() => shiftYear(-1)}
            disabled={!canGoPrev}
            aria-label="Previous year"
          >
            ‹
          </button>
          <span className="heatmap-year-label">{year}</span>
          <button
            type="button"
            className="heatmap-year-btn"
            onClick={() => shiftYear(1)}
            disabled={!canGoNext}
            aria-label="Next year"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <div className="widget-loading">Loading heatmap...</div>
      ) : (
        <>
          <div className="heatmap-months-container">
            {monthsData}
          </div>
          <div className="heatmap-footer">
            <span className="heatmap-year-total">
              {yearTotal} completed in {year}
            </span>
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="heatmap-day level-0" />
              <div className="heatmap-day level-1" />
              <div className="heatmap-day level-2" />
              <div className="heatmap-day level-3" />
              <div className="heatmap-day level-4" />
              <span>More</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HeatmapCard;
