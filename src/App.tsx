import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { ReaderSettingsDialog } from './components/ReaderSettingsDialog';
import { EmergencyRescueModal } from './components/EmergencyRescueModal';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { QuoteCardModal } from './components/QuoteCardModal';
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
  ReaderSettings,
  QuoteCardData
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
import { lightHaptic } from './services/hapticsService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [readCategory, setReadCategory] = useState<CategoryKey>('science');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRescueOpen, setIsRescueOpen] = useState<boolean>(false);
  const [quoteCardData, setQuoteCardData] = useState<QuoteCardData | null>(null);

  // State
  const [settings, setSettings] = useState<ReaderSettings>(() => getReaderSettings());
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [articles, setArticles] = useState<Article[]>(() => loadAllArticles());
  const [recentArticles, setRecentArticles] = useState<Article[]>(() => getRecent(5));
  const [recommendation, setRecommendation] = useState<Recommendation>(() =>
    recommendSubject(getCategoryActivity(), stats.reviews_due)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

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
      {/* Top Header calibrated for Samsung Galaxy A10s Infinity-V notch */}
      <Header
        streak={stats.streak}
        dueCount={stats.reviews_due}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateReviews={() => setActiveTab('reviews')}
        onTriggerRescue={() => setIsRescueOpen(true)}
      />

      {/* Main Container - max-w-md optimal for Galaxy A10s 720px width viewport */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 pt-3">
        {activeTab === 'home' && (
          <HomeScreen
            stats={stats}
            recommendation={recommendation}
            recentArticles={recentArticles}
            onStartReading={handleStartReading}
            onNavigateReviews={() => setActiveTab('reviews')}
            onOpenArticle={handleOpenArticle}
            onNavigateLibrary={() => setActiveTab('library')}
            onTriggerRescue={() => setIsRescueOpen(true)}
          />
        )}

        {activeTab === 'read' && (
          <ReadScreen
            initialCategory={readCategory}
            settings={settings}
            onSaved={refreshAppData}
            onNavigateHome={() => setActiveTab('home')}
            onOpenQuoteCard={data => setQuoteCardData(data)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryScreen
            articles={articles}
            onStartReading={handleStartReading}
            selectedArticleId={selectedArticleId}
            onOpenQuoteCard={data => setQuoteCardData(data)}
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

      {/* Ambient Audio Floating Mini-Player */}
      <AmbientAudioPlayer />

      {/* Samsung One UI Bottom Thumb Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={tab => {
          lightHaptic();
          setSelectedArticleId(null);
          setActiveTab(tab);
        }}
        dueCount={stats.reviews_due}
      />

      {/* Emergency Rescue Breath Modal */}
      <EmergencyRescueModal
        isOpen={isRescueOpen}
        onClose={() => setIsRescueOpen(false)}
        onLaunchReading={cat => handleStartReading(cat)}
      />

      {/* Reader Appearance & Display Settings Modal */}
      <ReaderSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Aesthetic Quote Card Generator Modal */}
      <QuoteCardModal
        data={quoteCardData}
        onClose={() => setQuoteCardData(null)}
      />
    </div>
  );
};
