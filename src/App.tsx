import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { ReaderSettingsDialog } from './components/ReaderSettingsDialog';
import { HomeScreen } from './screens/HomeScreen';
import { ReadScreen } from './screens/ReadScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { ReviewsScreen } from './screens/ReviewsScreen';
import { StatsScreen } from './screens/StatsScreen';
import {
  CategoryKey,
  Article,
  AppStats,
  Recommendation,
  ReaderSettings
} from './types';
import {
  getAppStats,
  loadAllArticles,
  getRecent,
  getCategoryActivity,
  getReaderSettings,
  saveReaderSettings
} from './services/storageService';
import { recommendSubject } from './services/recommendation';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [readCategory, setReadCategory] = useState<CategoryKey>('science');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<ReaderSettings>(() => getReaderSettings());
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [articles, setArticles] = useState<Article[]>(() => loadAllArticles());
  const [recentArticles, setRecentArticles] = useState<Article[]>(() => getRecent(5));
  const [recommendation, setRecommendation] = useState<Recommendation>(() =>
    recommendSubject(getCategoryActivity(), stats.reviews_due)
  );

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Refresh data whenever articles change or screen actions complete
  const refreshAppData = () => {
    const updatedStats = getAppStats();
    const all = loadAllArticles();
    setStats(updatedStats);
    setArticles(all);
    setRecentArticles(getRecent(5));
    setRecommendation(recommendSubject(getCategoryActivity(), updatedStats.reviews_due));
  };

  const handleUpdateSettings = (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    saveReaderSettings(newSettings);
  };

  const handleStartReading = (cat?: CategoryKey) => {
    if (cat) {
      setReadCategory(cat);
    }
    setActiveTab('read');
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticleId(article.id);
    setActiveTab('library');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors selection:bg-[var(--amber-dim)] selection:text-[var(--amber)]">
      {/* Top Header */}
      <Header
        streak={stats.streak}
        dueCount={stats.reviews_due}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateReviews={() => setActiveTab('reviews')}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
        {activeTab === 'home' && (
          <HomeScreen
            stats={stats}
            recommendation={recommendation}
            recentArticles={recentArticles}
            onStartReading={handleStartReading}
            onNavigateReviews={() => setActiveTab('reviews')}
            onOpenArticle={handleOpenArticle}
            onNavigateLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'read' && (
          <ReadScreen
            initialCategory={readCategory}
            settings={settings}
            onSaved={refreshAppData}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'library' && (
          <LibraryScreen
            articles={articles}
            onStartReading={handleStartReading}
            selectedArticleId={selectedArticleId}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsScreen
            onStartReading={() => handleStartReading()}
            onReviewFinished={refreshAppData}
          />
        )}

        {activeTab === 'stats' && (
          <StatsScreen
            stats={stats}
            onGoalUpdated={refreshAppData}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={tab => {
          setSelectedArticleId(null);
          setActiveTab(tab);
        }}
        dueCount={stats.reviews_due}
      />

      {/* Reader Settings Modal */}
      <ReaderSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};
