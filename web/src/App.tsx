import React, { useEffect, useState } from 'react';
import { api, CollectionDto, UserDto } from './api';
import { CollectionsScreen } from './components/CollectionsScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { BulkActionsScreen } from './components/BulkActionsScreen';
import { ScanScreen } from './components/ScanScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LoginScreen } from './components/LoginScreen';

type ActiveTab = 'scan' | 'catalog' | 'bulk' | 'collections' | 'settings';

export function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);

  const loadCollections = async () => {
    try {
      const list = await api.getCollections();
      setCollections(list);
    } catch {
      // ignore initial error in test/offline mode
    }
  };

  useEffect(() => {
    let mounted = true;
    api
      .getMe()
      .then((user) => {
        if (!mounted) return;
        setCurrentUser(user);
        setAuthChecking(false);
        loadCollections();
      })
      .catch(() => {
        if (!mounted) return;
        setCurrentUser(null);
        setAuthChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLoginSuccess = (user: UserDto) => {
    setCurrentUser(user);
    setActiveTab('catalog');
    loadCollections();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout error
    }
    setCurrentUser(null);
    setCollections([]);
    setActiveTab('catalog');
  };

  const handleOpenCollection = (collectionId: number) => {
    setSelectedCollectionId(collectionId);
    setActiveTab('catalog');
  };

  if (authChecking) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <p className="empty-state">Chargement…</p>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img
            src="/icon.svg"
            alt="Emblème Chouette et Livre"
            className="brand-icon"
          />
          <h1>Ma Bibliothèque</h1>
        </div>
        <nav className="app-nav" aria-label="Navigation principale">
          {currentUser.canAddBooks && (
            <button
              type="button"
              className={`nav-btn ${activeTab === 'scan' ? 'active' : ''}`}
              aria-label="Ajouter un livre"
              title="Ajouter un livre"
              onClick={() => setActiveTab('scan')}
            >
              <span className="nav-icon" aria-hidden="true">
                ➕
              </span>{' '}
              <span className="nav-label">Ajouter</span>
            </button>
          )}
          <button
            type="button"
            className={`nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            aria-label="Bibliothèque"
            title="Bibliothèque"
            onClick={() => setActiveTab('catalog')}
          >
            <span className="nav-icon" aria-hidden="true">
              📚
            </span>{' '}
            <span className="nav-label">Bibliothèque</span>
          </button>
          {currentUser.canEditBooks && (
            <button
              type="button"
              className={`nav-btn ${activeTab === 'bulk' ? 'active' : ''}`}
              aria-label="Actions groupées"
              title="Actions groupées"
              onClick={() => setActiveTab('bulk')}
            >
              <span className="nav-icon" aria-hidden="true">
                ☑️
              </span>{' '}
              <span className="nav-label">Actions groupées</span>
            </button>
          )}
          <button
            type="button"
            className={`nav-btn ${activeTab === 'collections' ? 'active' : ''}`}
            aria-label="Collections"
            title="Collections"
            onClick={() => setActiveTab('collections')}
          >
            <span className="nav-icon" aria-hidden="true">
              🗂️
            </span>{' '}
            <span className="nav-label">Collections</span>
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            aria-label="Paramétrage"
            title="Paramétrage"
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon" aria-hidden="true">
              ⚙️
            </span>{' '}
            <span className="nav-label">Paramétrage</span>
          </button>
        </nav>
        <div className="user-bar">
          <span className="user-badge" title="Utilisateur connecté">
            👤 {currentUser.username}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm logout-btn"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'scan' && currentUser.canAddBooks && (
          <ScanScreen
            collections={collections}
            onBookAdded={loadCollections}
          />
        )}
        {activeTab === 'catalog' && (
          <CatalogScreen
            collections={collections}
            selectedCollectionId={selectedCollectionId}
            onSelectCollection={setSelectedCollectionId}
            onCollectionsChanged={loadCollections}
            canEditBooks={currentUser.canEditBooks}
            canDeleteBooks={currentUser.canDeleteBooks}
          />
        )}
        {activeTab === 'bulk' && currentUser.canEditBooks && (
          <BulkActionsScreen
            collections={collections}
            onCollectionsChanged={loadCollections}
          />
        )}
        {activeTab === 'collections' && (
          <CollectionsScreen
            collections={collections}
            onRefresh={loadCollections}
            onSelectCollection={handleOpenCollection}
            canAddBooks={currentUser.canAddBooks}
            canEditBooks={currentUser.canEditBooks}
            canDeleteBooks={currentUser.canDeleteBooks}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}
