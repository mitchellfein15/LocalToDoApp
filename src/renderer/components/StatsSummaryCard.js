import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import './WidgetCards.css';

function StatsSummaryCard() {
  const [stats, setStats] = useState({ openTodos: 0, completedYear: 0, notes: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [todos, notes, heatmap] = await Promise.all([
        ApiService.request('/todos?includeCompleted=true'),
        ApiService.getNotes(),
        ApiService.getHeatmap(new Date().getFullYear())
      ]);
      const completedYear = (heatmap || []).reduce((sum, entry) => sum + Number(entry.count || 0), 0);
      const openTodos = (todos || []).filter((todo) => !todo.completed).length;
      setStats({
        openTodos,
        completedYear,
        notes: (notes || []).length
      });
    } catch (error) {
      console.error('Failed to load summary stats', error);
    }
  };

  return (
    <div className="stats-widget">
      <div className="stat-line"><span>Open todos</span><strong>{stats.openTodos}</strong></div>
      <div className="stat-line"><span>Completed this year</span><strong>{stats.completedYear}</strong></div>
      <div className="stat-line"><span>Total notes</span><strong>{stats.notes}</strong></div>
    </div>
  );
}

export default StatsSummaryCard;
