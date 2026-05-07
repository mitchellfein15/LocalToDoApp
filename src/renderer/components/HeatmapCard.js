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

function HeatmapCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year] = useState(new Date().getFullYear());

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
  }, [year]);

  const countByDate = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      map[row.date] = Number(row.count);
    });
    return map;
  }, [rows]);

  const maxCount = useMemo(() => {
    return Object.values(countByDate).reduce((max, value) => Math.max(max, value), 0);
  }, [countByDate]);

  const monthsData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = Array.from({ length: 12 }, () => []);

    // Add empty padding days so the 1st of each month starts on the correct day of the week
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
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
      if (count > 0 && maxCount > 0) {
        level = Math.min(4, Math.ceil((count / maxCount) * 4));
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

    // Render each month as a block
    return months.map((days, index) => (
      <div key={monthNames[index]} className="heatmap-month">
        <span className="month-label">{monthNames[index]}</span>
        <div className="heatmap-month-grid">{days}</div>
      </div>
    ));
  }, [countByDate, maxCount, year]);

  if (loading) {
    return <div className="widget-loading">Loading heatmap...</div>;
  }

  return (
    <div className="heatmap-widget">
      <div className="heatmap-months-container">
        {monthsData}
      </div>
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
  );
}

export default HeatmapCard;