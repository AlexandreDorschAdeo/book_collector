import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { CollectionsScreen } from './components/CollectionsScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ScanScreen } from './components/ScanScreen';
import { api, CollectionDto } from './api';

const sampleCollections: CollectionDto[] = [
  {
    id: 1,
    name: 'BD',
    location: 'Salon',
    bookCount: 2,
    createdAt: '2026-10-26T00:00:00Z',
  },
  {
    id: 2,
    name: 'Mangas',
    location: 'Maison de campagne',
    bookCount: 1,
    createdAt: '2026-10-26T00:00:00Z',
  },
];

describe('CollectionsScreen (2.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays collections with location and bookCount, and supports creation, edition and deletion', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const onSelect = vi.fn();

    vi.spyOn(api, 'createCollection').mockResolvedValue({
      id: 3,
      name: 'Romans',
      location: 'Bureau',
      bookCount: 0,
      createdAt: '2026-10-26T00:00:00Z',
    });
    vi.spyOn(api, 'updateCollection').mockResolvedValue({
      ...sampleCollections[0],
      name: 'BD Franco-Belge',
    });
    vi.spyOn(api, 'deleteCollection').mockResolvedValue(undefined);

    render(
      <CollectionsScreen
        collections={sampleCollections}
        onRefresh={onRefresh}
        onSelectCollection={onSelect}
      />,
    );

    expect(screen.getByText('BD')).toBeInTheDocument();
    expect(screen.getByText('Salon')).toBeInTheDocument();
    expect(screen.getByText('2 livre(s)')).toBeInTheDocument();
    expect(screen.getByText('Maison de campagne')).toBeInTheDocument();

    // Create collection
    await user.type(
      screen.getByLabelText(/Nom de la collection/i),
      'Romans',
    );
    await user.type(screen.getByLabelText(/Lieu/i), 'Bureau');
    await user.click(
      screen.getByRole('button', { name: /Créer la collection/i }),
    );
    expect(api.createCollection).toHaveBeenCalledWith({
      name: 'Romans',
      location: 'Bureau',
    });

    // Edit collection
    const editButtons = screen.getAllByRole('button', { name: /Modifier/i });
    await user.click(editButtons[0]);
    const nameInput = screen.getByLabelText(/Modifier le nom/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'BD Franco-Belge');
    await user.click(screen.getByRole('button', { name: /Enregistrer/i }));
    expect(api.updateCollection).toHaveBeenCalledWith(1, {
      name: 'BD Franco-Belge',
      location: 'Salon',
    });

    // Delete collection
    const deleteButtons = screen.getAllByRole('button', { name: /Supprimer/i });
    await user.click(deleteButtons[0]);
    expect(api.deleteCollection).toHaveBeenCalledWith(1);
  });
});

describe('CatalogScreen (3.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lists books with subtitle, author roles and collections/locations, and supports global search and book creation', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getBooks').mockResolvedValue([
      {
        id: 10,
        isbn13: '9782012101333',
        title: 'Astérix',
        subtitle: 'Astérix le Gaulois',
        publisher: 'Hachette',
        coverUrl: '/api/covers/book-10-123.jpg',
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
        type: 'bd',
        collections: [
          { id: 1, name: 'BD', location: 'Salon' },
          { id: 2, name: 'Mangas', location: 'Maison de campagne' },
        ],
        createdAt: '2026-10-26T00:00:00Z',
      },
    ]);
    vi.spyOn(api, 'createBook').mockResolvedValue({
      id: 11,
      isbn13: null,
      title: 'Akira',
      subtitle: 'Tome 1',
      publisher: 'Glénat',
      coverUrl: null,
      authors: [{ name: 'Katsuhiro Otomo', role: 'author' }],
      type: 'manga',
      collections: [{ id: 1, name: 'BD', location: 'Salon' }],
      createdAt: '2026-10-26T00:00:00Z',
    });

    render(
      <CatalogScreen
        collections={sampleCollections}
        selectedCollectionId={null}
        onSelectCollection={vi.fn()}
        onCollectionsChanged={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(await screen.findByText('Astérix')).toBeInTheDocument();
    expect(screen.getByText('Astérix le Gaulois')).toBeInTheDocument();
    expect(screen.getByText(/Éditeur : Hachette/i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Couverture de Astérix/i }),
    ).toHaveAttribute('src', '/api/covers/book-10-123.jpg');
    expect(screen.getByText(/René Goscinny/)).toBeInTheDocument();
    expect(screen.getByText(/\(Scénariste\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(Dessinateur\)/)).toBeInTheDocument();
    expect(screen.getByText('BD — Salon')).toBeInTheDocument();
    expect(
      screen.getByText('Mangas — Maison de campagne'),
    ).toBeInTheDocument();

    // Global search
    await user.type(
      screen.getByLabelText(/Rechercher dans toutes les collections/i),
      'uderzo',
    );
    await waitFor(() => {
      expect(api.getBooks).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'uderzo' }),
      );
    });
  });

  it('opens centered modal dialogs for Modifier and Déplacer with automatic focus and Escape closing', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getBooks').mockResolvedValue([
      {
        id: 10,
        isbn13: '9782012101333',
        title: 'Astérix',
        subtitle: 'Astérix le Gaulois',
        publisher: 'Hachette',
        coverUrl: null,
        authors: [{ name: 'René Goscinny', role: 'writer' }],
        type: 'bd',
        collections: [{ id: 1, name: 'BD', location: 'Salon' }],
        createdAt: '2026-10-26T00:00:00Z',
      },
    ]);
    const updateBookSpy = vi.spyOn(api, 'updateBook').mockResolvedValue({
      id: 10,
      isbn13: '9782012101333',
      title: 'Astérix — Édition Luxe',
      subtitle: 'Astérix le Gaulois',
      publisher: 'Hachette',
      coverUrl: null,
      authors: [{ name: 'René Goscinny', role: 'writer' }],
      type: 'bd',
      collections: [{ id: 1, name: 'BD', location: 'Salon' }],
      createdAt: '2026-10-26T00:00:00Z',
    });
    const moveBookSpy = vi.spyOn(api, 'moveBook').mockResolvedValue({
      id: 10,
      isbn13: '9782012101333',
      title: 'Astérix — Édition Luxe',
      subtitle: 'Astérix le Gaulois',
      publisher: 'Hachette',
      coverUrl: null,
      authors: [{ name: 'René Goscinny', role: 'writer' }],
      type: 'bd',
      collections: [{ id: 2, name: 'Mangas', location: 'Maison de campagne' }],
      createdAt: '2026-10-26T00:00:00Z',
    });

    render(
      <CatalogScreen
        collections={sampleCollections}
        selectedCollectionId={null}
        onSelectCollection={vi.fn()}
        onCollectionsChanged={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(await screen.findByText('Astérix')).toBeInTheDocument();

    // Open Edit modal -> auto-focuses Title input
    await user.click(screen.getByRole('button', { name: /^Modifier$/i }));
    const editDialog = screen.getByRole('dialog', {
      name: /Modifier le livre/i,
    });
    expect(editDialog).toHaveAttribute('aria-modal', 'true');
    const titleInput = screen.getByLabelText(/^Titre \*/i);
    expect(titleInput).toHaveFocus();

    // Close modal with Escape
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: /Modifier le livre/i }),
    ).not.toBeInTheDocument();

    // Reopen Edit modal and save
    await user.click(screen.getByRole('button', { name: /^Modifier$/i }));
    const reopenedTitleInput = screen.getByLabelText(/^Titre \*/i);
    await user.clear(reopenedTitleInput);
    await user.type(reopenedTitleInput, 'Astérix — Édition Luxe');
    await user.click(
      screen.getByRole('button', { name: /Enregistrer le livre/i }),
    );
    expect(updateBookSpy).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ title: 'Astérix — Édition Luxe' }),
    );
    expect(
      screen.queryByRole('dialog', { name: /Modifier le livre/i }),
    ).not.toBeInTheDocument();

    // Open Move modal -> auto-focuses "Vers la collection" select
    await user.click(screen.getByRole('button', { name: /^Déplacer$/i }));
    const moveDialog = screen.getByRole('dialog', {
      name: /Déplacer « Astérix »/i,
    });
    expect(moveDialog).toHaveAttribute('aria-modal', 'true');
    const moveToSelect = screen.getByLabelText(/Vers la collection/i);
    expect(moveToSelect).toHaveFocus();

    await user.click(
      screen.getByRole('button', { name: /Valider le déplacement/i }),
    );
    expect(moveBookSpy).toHaveBeenCalledWith(10, 1, 2);
    expect(
      screen.queryByRole('dialog', { name: /Déplacer « Astérix »/i }),
    ).not.toBeInTheDocument();
  });
});

describe('BarcodeScanner (6.1)', () => {
  it('supports native camera photo scan and manual ISBN input', async () => {
    const user = userEvent.setup();
    const onDetected = vi.fn();

    render(<BarcodeScanner onDetected={onDetected} />);

    expect(
      screen.getByLabelText(/Scanner le code-barre avec l'appareil photo/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Saisie manuelle de l'ISBN/i),
      '9782012101333',
    );
    await user.click(
      screen.getByRole('button', { name: /Rechercher l'ISBN/i }),
    );
    expect(onDetected).toHaveBeenCalledWith('9782012101333');
  });
});

describe('ScanScreen (6.2 & 6.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays duplicate banners (already owned vs other edition vs new), supports attaching existing book, and chains 3 consecutive scans while preserving selected collection', async () => {
    const user = userEvent.setup();
    const onBookAdded = vi.fn().mockResolvedValue(undefined);

    const lookupSpy = vi.spyOn(api, 'lookupIsbn');
    const createBookSpy = vi.spyOn(api, 'createBook').mockResolvedValue({
      id: 100,
      isbn13: '9782012101333',
      title: 'Livre Test',
      subtitle: null,
      publisher: 'Dargaud',
      coverUrl: null,
      authors: [{ name: 'Auteur', role: 'author' }],
      type: 'bd',
      collections: [{ id: 2, name: 'Mangas', location: 'Maison de campagne' }],
      createdAt: '2026-10-26T00:00:00Z',
    });
    const attachSpy = vi
      .spyOn(api, 'attachBookToCollection')
      .mockResolvedValue({
        id: 50,
        isbn13: '9782012101333',
        title: 'Astérix',
        subtitle: null,
        publisher: 'Hachette',
        coverUrl: null,
        authors: [{ name: 'Uderzo', role: 'illustrator' }],
        type: 'bd',
        collections: [
          { id: 1, name: 'BD', location: 'Salon' },
          { id: 2, name: 'Mangas', location: 'Maison de campagne' },
        ],
        createdAt: '2026-10-26T00:00:00Z',
      });

    render(
      <ScanScreen
        collections={sampleCollections}
        onBookAdded={onBookAdded}
      />,
    );

    // Select collection #2 (Maison de campagne)
    await user.selectOptions(
      screen.getByLabelText(/Collection de destination/i),
      '2',
    );
    expect(
      (screen.getByLabelText(/Collection de destination/i) as HTMLSelectElement)
        .value,
    ).toBe('2');

    // Scan #1: Book already owned in Salon -> attach existing book to collection #2
    lookupSpy.mockResolvedValueOnce({
      isbn13: '9782012101333',
      found: true,
      metadata: {
        title: 'Astérix',
        subtitle: 'Astérix le Gaulois',
        authors: [
          { name: 'René Goscinny', role: 'writer' },
          { name: 'Albert Uderzo', role: 'illustrator' },
        ],
      },
      duplicates: {
        sameIsbn: [
          {
            id: 50,
            isbn13: '9782012101333',
            title: 'Astérix',
            subtitle: 'Astérix le Gaulois',
            publisher: 'Hachette',
            coverUrl: null,
            authors: [{ name: 'René Goscinny', role: 'writer' }],
            type: 'bd',
            collections: [{ id: 1, name: 'BD', location: 'Salon' }],
            createdAt: '2026-10-26T00:00:00Z',
          },
        ],
        otherEditions: [],
      },
    });

    await user.type(
      screen.getByLabelText(/Saisie manuelle de l'ISBN/i),
      '9782012101333',
    );
    await user.click(
      screen.getByRole('button', { name: /Rechercher l'ISBN/i }),
    );

    expect(
      await screen.findByText(/Vous possédez déjà ce livre/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/BD \(Salon\)/).length).toBeGreaterThanOrEqual(2);

    await user.click(
      screen.getByRole('button', {
        name: /Ajouter ce livre existant à la collection sélectionnée/i,
      }),
    );
    expect(attachSpy).toHaveBeenCalledWith(50, 2);

    // Collection #2 is still preserved after Scan #1!
    expect(
      (screen.getByLabelText(/Collection de destination/i) as HTMLSelectElement)
        .value,
    ).toBe('2');

    // Scan #2: Other edition owned -> banner shows "Vous possédez ce titre dans une autre édition", add it
    lookupSpy.mockResolvedValueOnce({
      isbn13: '9780306406157',
      found: true,
      metadata: {
        title: 'Dune',
        subtitle: 'Édition Collector',
        authors: [{ name: 'Frank Herbert', role: 'author' }],
      },
      duplicates: {
        sameIsbn: [],
        otherEditions: [
          {
            id: 60,
            isbn13: '9782266320481',
            title: 'Dune',
            subtitle: 'Poche',
            publisher: 'Pocket',
            coverUrl: null,
            authors: [{ name: 'Frank Herbert', role: 'author' }],
            type: 'book',
            collections: [{ id: 1, name: 'BD', location: 'Salon' }],
            createdAt: '2026-10-26T00:00:00Z',
          },
        ],
      },
    });

    await user.type(
      screen.getByLabelText(/Saisie manuelle de l'ISBN/i),
      '9780306406157',
    );
    await user.click(
      screen.getByRole('button', { name: /Rechercher l'ISBN/i }),
    );

    expect(
      await screen.findByText(/Vous possédez ce titre dans une autre édition/i),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /Ajouter à la collection/i }),
    );
    expect(createBookSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isbn: '9780306406157',
        title: 'Dune',
        collectionIds: [2],
      }),
    );

    // Scan #3: Brand new book -> banner shows "Vous ne possédez pas encore ce livre", collection #2 still preserved!
    lookupSpy.mockResolvedValueOnce({
      isbn13: '9791032700006',
      found: true,
      metadata: {
        title: 'Nouveau Manga',
        subtitle: 'Tome 1',
        publisher: 'Ki-oon',
        coverUrl: 'https://covers.openlibrary.org/b/id/42-L.jpg',
        authors: [{ name: 'Auteur Manga', role: 'author' }],
      },
      duplicates: {
        sameIsbn: [],
        otherEditions: [],
      },
    });

    await user.type(
      screen.getByLabelText(/Saisie manuelle de l'ISBN/i),
      '9791032700006',
    );
    await user.click(
      screen.getByRole('button', { name: /Rechercher l'ISBN/i }),
    );

    expect(
      await screen.findByText(/Vous ne possédez pas encore ce livre/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Maison d'édition/i)).toHaveValue('Ki-oon');
    expect(
      screen.getByRole('img', { name: /Aperçu de la couverture/i }),
    ).toHaveAttribute('src', 'https://covers.openlibrary.org/b/id/42-L.jpg');
    await user.click(
      screen.getByRole('button', { name: /Ajouter à la collection/i }),
    );
    expect(createBookSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isbn: '9791032700006',
        title: 'Nouveau Manga',
        publisher: 'Ki-oon',
        coverSourceUrl: 'https://covers.openlibrary.org/b/id/42-L.jpg',
        collectionIds: [2],
      }),
    );
    expect(
      (screen.getByLabelText(/Collection de destination/i) as HTMLSelectElement)
        .value,
    ).toBe('2');
  });

  it('supports file upload and camera capture with interactive cropping for book covers', async () => {
    const user = userEvent.setup();
    const createBookSpy = vi.spyOn(api, 'createBook').mockResolvedValue({
      id: 200,
      isbn13: null,
      title: 'BD Photo',
      subtitle: null,
      publisher: 'Dupuis',
      coverUrl: '/api/covers/book-200.jpg',
      authors: [{ name: 'Franquin', role: 'author' }],
      type: 'bd',
      collections: [{ id: 1, name: 'BD', location: 'Salon' }],
      createdAt: '2026-10-26T00:00:00Z',
    });

    render(
      <ScanScreen
        collections={sampleCollections}
        onBookAdded={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.type(screen.getByLabelText(/^Titre \*/i), 'BD Photo');
    await user.type(screen.getByLabelText(/Maison d'édition/i), 'Dupuis');
    await user.type(screen.getByLabelText(/Auteur 1/i), 'Franquin');

    // Upload a cover file and crop it
    const file = new File(['dummy-image'], 'cover.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Choisir un fichier de couverture/i);
    await user.upload(fileInput, file);

    expect(
      await screen.findByRole('dialog', { name: /Recadrer la couverture/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Valider le recadrage/i }),
    );

    expect(
      await screen.findByRole('img', { name: /Aperçu de la couverture/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Ajouter à la collection/i }),
    );

    expect(createBookSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'BD Photo',
        publisher: 'Dupuis',
        coverDataUrl: expect.stringMatching(/^data:image\//),
      }),
    );
  });

  it('analyzes cover photo automatically on empty form, pre-fills metadata + duplicate status, and allows switching between cover candidates while keeping the captured cover', async () => {
    const user = userEvent.setup();
    const lookupCoverSpy = vi.spyOn(api, 'lookupCover').mockResolvedValue({
      clues: {
        source: 'ocr',
        rawText: 'Blacksad Dargaud',
        searchQuery: 'Blacksad Dargaud',
        title: 'Blacksad',
        subtitle: null,
        publisher: 'Dargaud',
        isbn13: null,
        authors: [],
        inferredType: 'bd',
      },
      candidates: [
        {
          isbn13: '9782205056334',
          title: 'Blacksad',
          subtitle: 'Quelque part entre les ombres',
          publisher: 'Dargaud',
          coverUrl: null,
          authors: [
            { name: 'Juan Díaz Canales', role: 'writer' },
            { name: 'Juanjo Guarnido', role: 'illustrator' },
          ],
          type: 'bd',
          duplicates: {
            sameIsbn: [],
            otherEditions: [],
          },
        },
        {
          isbn13: '9782205051995',
          title: 'Blacksad',
          subtitle: 'Arctic-Nation',
          publisher: 'Dargaud',
          coverUrl: null,
          authors: [
            { name: 'Juan Díaz Canales', role: 'writer' },
            { name: 'Juanjo Guarnido', role: 'illustrator' },
          ],
          type: 'bd',
          duplicates: {
            sameIsbn: [],
            otherEditions: [
              {
                id: 77,
                isbn13: '9782205099999',
                title: 'Blacksad',
                subtitle: 'Arctic-Nation',
                publisher: 'Dargaud',
                coverUrl: null,
                authors: [{ name: 'Juan Díaz Canales', role: 'writer' }],
                type: 'bd',
                collections: [{ id: 1, name: 'BD', location: 'Salon' }],
                createdAt: '2026-10-26T00:00:00Z',
              },
            ],
          },
        },
      ],
      bestMatch: {
        isbn13: '9782205056334',
        title: 'Blacksad',
        subtitle: 'Quelque part entre les ombres',
        publisher: 'Dargaud',
        coverUrl: null,
        authors: [
          { name: 'Juan Díaz Canales', role: 'writer' },
          { name: 'Juanjo Guarnido', role: 'illustrator' },
        ],
        type: 'bd',
        duplicates: {
          sameIsbn: [],
          otherEditions: [],
        },
      },
    });

    render(
      <ScanScreen
        collections={sampleCollections}
        onBookAdded={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const file = new File(['cover-photo'], 'blacksad.jpg', {
      type: 'image/jpeg',
    });
    const cameraInput = screen.getByLabelText(
      /Prendre une photo de couverture/i,
    );
    await user.upload(cameraInput, file);

    await user.click(
      await screen.findByRole('button', { name: /Valider le recadrage/i }),
    );

    await waitFor(() => {
      expect(lookupCoverSpy).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByLabelText(/^Titre \*/i)).toHaveValue('Blacksad');
    expect(screen.getByLabelText(/Sous-titre/i)).toHaveValue(
      'Quelque part entre les ombres',
    );
    expect(screen.getByLabelText(/Maison d'édition/i)).toHaveValue('Dargaud');
    expect(screen.getByLabelText(/ISBN-13/i)).toHaveValue('9782205056334');

    // Switch to the second candidate ("Blacksad — Arctic-Nation (Dargaud)")
    await user.click(
      screen.getByRole('button', { name: /Blacksad — Arctic-Nation/i }),
    );

    expect(screen.getByLabelText(/Sous-titre/i)).toHaveValue('Arctic-Nation');
    expect(screen.getByLabelText(/ISBN-13/i)).toHaveValue('9782205051995');
    expect(
      await screen.findByText(/Vous possédez ce titre dans une autre édition/i),
    ).toBeInTheDocument();
  });
});

describe('App shell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders navigation tabs including ⚙️ Paramétrage, saves Vision AI settings, and manages users & permissions', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 1,
      username: 'admin',
      canAddBooks: true,
      canEditBooks: true,
      canDeleteBooks: true,
      canManageUsers: true,
      createdAt: '2026-10-26T00:00:00Z',
    });
    vi.spyOn(api, 'getCollections').mockResolvedValue([]);
    vi.spyOn(api, 'getBooks').mockResolvedValue([]);
    vi.spyOn(api, 'getUsers').mockResolvedValue([
      {
        id: 1,
        username: 'admin',
        canAddBooks: true,
        canEditBooks: true,
        canDeleteBooks: true,
        canManageUsers: true,
        createdAt: '2026-10-26T00:00:00Z',
      },
    ]);
    const createUserSpy = vi.spyOn(api, 'createUser').mockResolvedValue({
      id: 2,
      username: 'marie',
      canAddBooks: true,
      canEditBooks: false,
      canDeleteBooks: false,
      canManageUsers: false,
      createdAt: '2026-10-26T00:00:00Z',
    });
    vi.spyOn(api, 'getSettings').mockResolvedValue({
      visionProvider: 'auto',
      geminiApiKey: '',
      geminiModel: 'gemini-2.0-flash',
      openaiApiKey: '',
      openaiModel: 'gpt-4o-mini',
      ollamaUrl: '',
      ollamaModel: 'llava',
      googleBooksApiKey: '',
    });
    const updateSettingsSpy = vi
      .spyOn(api, 'updateSettings')
      .mockResolvedValue({
        visionProvider: 'gemini',
        geminiApiKey: 'AIzaTestKey',
        geminiModel: 'gemini-2.0-flash',
        openaiApiKey: '',
        openaiModel: 'gpt-4o-mini',
        ollamaUrl: '',
        ollamaModel: 'llava',
        googleBooksApiKey: '',
      });

    render(<App />);
    expect(await screen.findByText('Ma Bibliothèque')).toBeInTheDocument();
    expect(
      await screen.findByText(/Aucun livre n'a été trouvé/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Ajouter un livre$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /^Ajouter un livre$/i }),
    ).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: /^Bibliothèque$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Collections$/i }),
    ).toBeInTheDocument();

    const settingsBtn = screen.getByRole('button', { name: /Paramétrage/i });
    expect(settingsBtn).toHaveTextContent('⚙️ Paramétrage');

    await user.click(settingsBtn);

    // User creation
    await user.type(
      await screen.findByLabelText(/Identifiant du nouvel utilisateur/i),
      'marie',
    );
    await user.type(
      screen.getByLabelText(/Mot de passe du nouvel utilisateur/i),
      'secret123',
    );
    await user.click(
      screen.getByRole('button', { name: /Créer l'utilisateur/i }),
    );
    expect(createUserSpy).toHaveBeenCalledWith({
      username: 'marie',
      password: 'secret123',
      canAddBooks: true,
      canEditBooks: false,
      canDeleteBooks: false,
      canManageUsers: false,
    });

    // Vision AI settings
    expect(
      await screen.findByLabelText(/GEMINI_API_KEY/i),
    ).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText(/Moteur d'analyse des photos de couverture/i),
      'gemini',
    );
    await user.type(screen.getByLabelText(/GEMINI_API_KEY/i), 'AIzaTestKey');
    await user.click(
      screen.getByRole('button', { name: /Enregistrer le paramétrage/i }),
    );

    expect(updateSettingsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        visionProvider: 'gemini',
        geminiApiKey: 'AIzaTestKey',
      }),
    );
    expect(
      await screen.findByText(/Paramétrage enregistré avec succès/i),
    ).toBeInTheDocument();
  });

  it('requires login when unauthenticated and hides restricted actions based on user permissions', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getMe').mockRejectedValue(
      new Error('Authentification requise.'),
    );
    const loginSpy = vi.spyOn(api, 'login').mockResolvedValue({
      token: 'test-token',
      user: {
        id: 3,
        username: 'lecteur',
        canAddBooks: false,
        canEditBooks: false,
        canDeleteBooks: false,
        canManageUsers: false,
        createdAt: '2026-10-26T00:00:00Z',
      },
    });
    vi.spyOn(api, 'getCollections').mockResolvedValue(sampleCollections);
    vi.spyOn(api, 'getBooks').mockResolvedValue([
      {
        id: 10,
        isbn13: '9782012101333',
        title: 'Astérix',
        subtitle: null,
        publisher: 'Hachette',
        coverUrl: null,
        authors: [{ name: 'René Goscinny', role: 'writer' }],
        type: 'bd',
        collections: [{ id: 1, name: 'BD', location: 'Salon' }],
        createdAt: '2026-10-26T00:00:00Z',
      },
    ]);

    render(<App />);

    // Login screen is displayed with the Owl & Book emblem
    expect(
      await screen.findByText(/Connectez-vous pour accéder à la bibliothèque/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Emblème Chouette et Livre/i }),
    ).toHaveAttribute('src', '/icon.svg');

    await user.type(screen.getByLabelText(/Identifiant/i), 'lecteur');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'lecteur123');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));

    expect(loginSpy).toHaveBeenCalledWith('lecteur', 'lecteur123');

    // Catalog loads for read-only user
    expect(await screen.findByText('Astérix')).toBeInTheDocument();
    expect(screen.getByText(/👤 lecteur/)).toBeInTheDocument();

    // "Ajouter un livre", "Actions groupées", "Modifier", "Supprimer" are hidden for read-only user
    expect(
      screen.queryByRole('button', { name: /^Ajouter un livre$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Actions groupées$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Modifier$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Supprimer$/i }),
    ).not.toBeInTheDocument();
  });

  it('supports bulk selection, bulk move, and bulk field update in the Actions groupées tab', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getMe').mockResolvedValue({
      id: 1,
      username: 'admin',
      canAddBooks: true,
      canEditBooks: true,
      canDeleteBooks: true,
      canManageUsers: true,
      createdAt: '2026-10-26T00:00:00Z',
    });
    vi.spyOn(api, 'getCollections').mockResolvedValue(sampleCollections);
    vi.spyOn(api, 'getBooks').mockResolvedValue([
      {
        id: 10,
        isbn13: '9782012101333',
        title: 'Astérix',
        subtitle: 'Tome 1',
        publisher: 'Hachette',
        coverUrl: null,
        authors: [{ name: 'René Goscinny', role: 'writer' }],
        type: 'bd',
        collections: [{ id: 1, name: 'BD', location: 'Salon' }],
        createdAt: '2026-10-26T00:00:00Z',
      },
      {
        id: 11,
        isbn13: '9782205056334',
        title: 'Blacksad',
        subtitle: 'Tome 1',
        publisher: 'Dargaud',
        coverUrl: null,
        authors: [{ name: 'Juan Díaz Canales', role: 'writer' }],
        type: 'bd',
        collections: [{ id: 1, name: 'BD', location: 'Salon' }],
        createdAt: '2026-10-26T00:00:00Z',
      },
    ]);
    const bulkMoveSpy = vi.spyOn(api, 'bulkMoveBooks').mockResolvedValue({
      updatedCount: 2,
      books: [],
    });
    const bulkUpdateSpy = vi.spyOn(api, 'bulkUpdateBooks').mockResolvedValue({
      updatedCount: 2,
      books: [],
    });

    render(<App />);

    // Open Actions groupées tab
    const bulkTabBtn = await screen.findByRole('button', {
      name: /^Actions groupées$/i,
    });
    await user.click(bulkTabBtn);

    expect(
      await screen.findByRole('heading', { name: /Actions groupées/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 livre(s) sélectionné(s)')).toBeInTheDocument();

    // Select all books
    await user.click(
      screen.getByRole('button', { name: /Tout sélectionner/i }),
    );
    expect(screen.getByText('2 livre(s) sélectionné(s)')).toBeInTheDocument();

    // Bulk move modal
    await user.click(
      screen.getByRole('button', { name: /Déplacer la sélection/i }),
    );
    const moveModal = screen.getByRole('dialog', {
      name: /Déplacer la sélection en lot/i,
    });
    expect(moveModal).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText(/Vers la collection/i)).toHaveFocus();

    await user.click(
      screen.getByRole('button', { name: /Valider le déplacement en lot/i }),
    );
    expect(bulkMoveSpy).toHaveBeenCalledWith({
      bookIds: [10, 11],
      fromCollectionId: 1,
      toCollectionId: 2,
    });
    expect(
      await screen.findByText(/2 livre\(s\) déplacé\(s\) avec succès/i),
    ).toBeInTheDocument();

    // Select books individually and run bulk edit
    await user.click(screen.getByLabelText(/Sélectionner Astérix/i));
    await user.click(screen.getByLabelText(/Sélectionner Blacksad/i));
    expect(screen.getByText('2 livre(s) sélectionné(s)')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Modifier la sélection/i }),
    );
    const editModal = screen.getByRole('dialog', {
      name: /Modifier la sélection en lot/i,
    });
    expect(editModal).toHaveAttribute('aria-modal', 'true');

    // Toggle Publisher and Type fields
    await user.click(screen.getByLabelText(/Appliquer le type/i));
    await user.selectOptions(
      screen.getByLabelText(/Type à appliquer/i),
      'comic',
    );
    await user.click(
      screen.getByLabelText(/Appliquer la maison d'édition/i),
    );
    await user.type(
      screen.getByLabelText(/Maison d'édition à appliquer/i),
      'Dupuis',
    );

    await user.click(
      screen.getByRole('button', { name: /Appliquer les modifications/i }),
    );
    expect(bulkUpdateSpy).toHaveBeenCalledWith({
      bookIds: [10, 11],
      fields: {
        type: 'comic',
        publisher: 'Dupuis',
      },
    });
    expect(
      await screen.findByText(/2 livre\(s\) modifié\(s\) avec succès/i),
    ).toBeInTheDocument();
  });
});
