import React, { useEffect, useState } from 'react';
import { api, AppSettings, UserDto, VisionProviderMode } from '../api';

export interface SettingsScreenProps {
  currentUser?: UserDto;
}

export function SettingsScreen({ currentUser }: SettingsScreenProps) {
  const canManageUsers = currentUser ? currentUser.canManageUsers : true;

  // Vision AI & system settings state
  const [visionProvider, setVisionProvider] =
    useState<VisionProviderMode>('auto');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [ollamaModel, setOllamaModel] = useState('llava');
  const [googleBooksApiKey, setGoogleBooksApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // User management state
  const [users, setUsers] = useState<UserDto[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newCanAdd, setNewCanAdd] = useState(true);
  const [newCanEdit, setNewCanEdit] = useState(false);
  const [newCanDelete, setNewCanDelete] = useState(false);
  const [newCanManageUsers, setNewCanManageUsers] = useState(false);
  const [userPasswords, setUserPasswords] = useState<Record<number, string>>(
    {},
  );

  const loadUsers = async () => {
    if (!canManageUsers) return;
    try {
      const list = await api.getUsers();
      setUsers(list);
    } catch {
      // ignore in offline/test if not mocked
    }
  };

  useEffect(() => {
    if (canManageUsers) {
      api
        .getSettings()
        .then((s: AppSettings) => {
          setVisionProvider(s.visionProvider);
          setGeminiApiKey(s.geminiApiKey);
          setGeminiModel(s.geminiModel || 'gemini-2.0-flash');
          setOpenaiApiKey(s.openaiApiKey);
          setOpenaiModel(s.openaiModel || 'gpt-4o-mini');
          setOllamaUrl(s.ollamaUrl);
          setOllamaModel(s.ollamaModel || 'llava');
          setGoogleBooksApiKey(s.googleBooksApiKey);
        })
        .catch(() => {
          // ignore in offline/test if not mocked
        });
      loadUsers();
    }
  }, [canManageUsers]);

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const updated = await api.updateSettings({
        visionProvider,
        geminiApiKey,
        geminiModel,
        openaiApiKey,
        openaiModel,
        ollamaUrl,
        ollamaModel,
        googleBooksApiKey,
      });
      setVisionProvider(updated.visionProvider);
      setGeminiApiKey(updated.geminiApiKey);
      setGeminiModel(updated.geminiModel);
      setOpenaiApiKey(updated.openaiApiKey);
      setOpenaiModel(updated.openaiModel);
      setOllamaUrl(updated.ollamaUrl);
      setOllamaModel(updated.ollamaModel);
      setGoogleBooksApiKey(updated.googleBooksApiKey);
      setStatusMessage('Paramétrage enregistré avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement du paramétrage.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    if (!currentPassword || !newPassword) {
      setError('Veuillez saisir votre mot de passe actuel et le nouveau.');
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setStatusMessage('Votre mot de passe a été modifié avec succès.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du changement de mot de passe.',
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    if (!newUsername.trim() || !newUserPassword) {
      setError(
        "L'identifiant et le mot de passe du nouvel utilisateur sont obligatoires.",
      );
      return;
    }
    try {
      await api.createUser({
        username: newUsername.trim(),
        password: newUserPassword,
        canAddBooks: newCanAdd,
        canEditBooks: newCanEdit,
        canDeleteBooks: newCanDelete,
        canManageUsers: newCanManageUsers,
      });
      setNewUsername('');
      setNewUserPassword('');
      setNewCanAdd(true);
      setNewCanEdit(false);
      setNewCanDelete(false);
      setNewCanManageUsers(false);
      setStatusMessage('Utilisateur créé avec succès.');
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l'utilisateur.",
      );
    }
  };

  const toggleExistingUserPerm = (
    userId: number,
    perm: 'canAddBooks' | 'canEditBooks' | 'canDeleteBooks' | 'canManageUsers',
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, [perm]: !u[perm] } : u)),
    );
  };

  const handleSaveUser = async (u: UserDto) => {
    setError(null);
    setStatusMessage(null);
    try {
      const pwd = userPasswords[u.id]?.trim();
      await api.updateUser(u.id, {
        canAddBooks: u.canAddBooks,
        canEditBooks: u.canEditBooks,
        canDeleteBooks: u.canDeleteBooks,
        canManageUsers: u.canManageUsers,
        ...(pwd ? { password: pwd } : {}),
      });
      setUserPasswords((prev) => ({ ...prev, [u.id]: '' }));
      setStatusMessage(`Utilisateur « ${u.username} » mis à jour.`);
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour de l'utilisateur.",
      );
    }
  };

  const handleDeleteUser = async (u: UserDto) => {
    setError(null);
    setStatusMessage(null);
    try {
      await api.deleteUser(u.id);
      setStatusMessage(`Utilisateur « ${u.username} » supprimé.`);
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l'utilisateur.",
      );
    }
  };

  return (
    <section className="screen-section">
      <h2>⚙️ Paramétrage</h2>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {statusMessage && (
        <div role="status" className="alert alert-success">
          {statusMessage}
        </div>
      )}

      {canManageUsers && (
        <div className="card book-form">
          <h3>👥 Utilisateurs et autorisations</h3>

          <form onSubmit={handleCreateUser} className="authors-fieldset">
            <h4>Ajouter un utilisateur</h4>
            <div className="field-row-2">
              <div className="field">
                <label htmlFor="new-user-username">
                  Identifiant du nouvel utilisateur *
                </label>
                <input
                  id="new-user-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex. marie"
                />
              </div>
              <div className="field">
                <label htmlFor="new-user-password">
                  Mot de passe du nouvel utilisateur *
                </label>
                <input
                  id="new-user-password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mot de passe"
                />
              </div>
            </div>

            <div className="collections-checks">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCanAdd}
                  onChange={(e) => setNewCanAdd(e.target.checked)}
                />
                Ajouter des livres
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCanEdit}
                  onChange={(e) => setNewCanEdit(e.target.checked)}
                />
                Modifier des livres
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCanDelete}
                  onChange={(e) => setNewCanDelete(e.target.checked)}
                />
                Supprimer des livres
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCanManageUsers}
                  onChange={(e) => setNewCanManageUsers(e.target.checked)}
                />
                Ajouter / gérer des utilisateurs
              </label>
            </div>

            <div className="card-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                Créer l&apos;utilisateur
              </button>
            </div>
          </form>

          {users.length > 0 && (
            <div className="users-list">
              <h4>Comptes existants</h4>
              {users.map((u) => (
                <div key={u.id} className="user-item-card">
                  <div className="user-item-header">
                    <strong>👤 {u.username}</strong>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveUser(u)}
                      >
                        Enregistrer les droits de {u.username}
                      </button>
                      {(!currentUser || currentUser.id !== u.id) && (
                        <button
                          type="button"
                          className="btn btn-ghost-danger btn-sm"
                          onClick={() => handleDeleteUser(u)}
                        >
                          Supprimer {u.username}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="collections-checks">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={u.canAddBooks}
                        onChange={() =>
                          toggleExistingUserPerm(u.id, 'canAddBooks')
                        }
                      />
                      Ajouter des livres
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={u.canEditBooks}
                        onChange={() =>
                          toggleExistingUserPerm(u.id, 'canEditBooks')
                        }
                      />
                      Modifier des livres
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={u.canDeleteBooks}
                        onChange={() =>
                          toggleExistingUserPerm(u.id, 'canDeleteBooks')
                        }
                      />
                      Supprimer des livres
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={u.canManageUsers}
                        onChange={() =>
                          toggleExistingUserPerm(u.id, 'canManageUsers')
                        }
                      />
                      Gérer les utilisateurs
                    </label>
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      aria-label={`Nouveau mot de passe pour ${u.username}`}
                      placeholder="Nouveau mot de passe (laisser vide pour conserver)"
                      value={userPasswords[u.id] ?? ''}
                      onChange={(e) =>
                        setUserPasswords((prev) => ({
                          ...prev,
                          [u.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleChangePassword} className="card book-form">
        <h3>🔑 Mon mot de passe</h3>
        <div className="field-row-2">
          <div className="field">
            <label htmlFor="current-password">Mot de passe actuel</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="field">
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="card-actions">
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={changingPassword}
          >
            {changingPassword ? 'Modification…' : 'Changer mon mot de passe'}
          </button>
        </div>
      </form>

      {canManageUsers && (
        <form onSubmit={handleSubmitSettings} className="card book-form">
          <h3>🤖 Analyse des couvertures (IA Vision &amp; OCR)</h3>
          <div className="field">
            <label htmlFor="settings-vision-provider">
              Moteur d&apos;analyse des photos de couverture
            </label>
            <select
              id="settings-vision-provider"
              value={visionProvider}
              onChange={(e) =>
                setVisionProvider(e.target.value as VisionProviderMode)
              }
            >
              <option value="auto">
                Hybride automatique (IA Vision si renseignée, sinon OCR local)
              </option>
              <option value="ocr">
                OCR local uniquement (100 % gratuit, sans clé externe)
              </option>
              <option value="gemini">Google Gemini Vision</option>
              <option value="openai">OpenAI Vision</option>
              <option value="ollama">Ollama Vision (local)</option>
            </select>
          </div>

          <fieldset className="authors-fieldset">
            <legend>Google Gemini (IA Vision)</legend>
            <div className="field-row-2">
              <div className="field">
                <label htmlFor="settings-gemini-key">GEMINI_API_KEY</label>
                <input
                  id="settings-gemini-key"
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label htmlFor="settings-gemini-model">Modèle Gemini</label>
                <input
                  id="settings-gemini-model"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  placeholder="gemini-2.0-flash"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="authors-fieldset">
            <legend>OpenAI (IA Vision)</legend>
            <div className="field-row-2">
              <div className="field">
                <label htmlFor="settings-openai-key">OPENAI_API_KEY</label>
                <input
                  id="settings-openai-key"
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                />
              </div>
              <div className="field">
                <label htmlFor="settings-openai-model">Modèle OpenAI</label>
                <input
                  id="settings-openai-model"
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="authors-fieldset">
            <legend>Ollama (IA Vision locale)</legend>
            <div className="field-row-2">
              <div className="field">
                <label htmlFor="settings-ollama-url">OLLAMA_URL</label>
                <input
                  id="settings-ollama-url"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://host.docker.internal:11434"
                />
              </div>
              <div className="field">
                <label htmlFor="settings-ollama-model">Modèle Ollama</label>
                <input
                  id="settings-ollama-model"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llava"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="authors-fieldset">
            <legend>Google Books (Optionnel)</legend>
            <div className="field">
              <label htmlFor="settings-google-books-key">
                GOOGLE_BOOKS_API_KEY
              </label>
              <input
                id="settings-google-books-key"
                type="password"
                value={googleBooksApiKey}
                onChange={(e) => setGoogleBooksApiKey(e.target.value)}
                placeholder="Optionnel (quota étendu Google Books)"
                autoComplete="off"
              />
            </div>
          </fieldset>

          <div className="card-actions form-submit-bar">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer le paramétrage'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
