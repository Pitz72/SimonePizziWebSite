/// <reference types="vite/client" />
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8888/api';

// Configurazione standard con credenziali per mantenere i cookie session PHP
const fetchConfig: RequestInit = {
    credentials: 'include',  // Richiede header Access-Control-Allow-Credentials dal server in locale, 
    // ma su hosting non serve CORS se stesso dominio.
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
};

export const api = {
    // Auth & Session
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/auth.php`, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        if (!res.ok) throw new Error('Login fallito');
        return res.json();
    },
    logout: async () => {
        const res = await fetch(`${API_URL}/auth.php`, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify({ action: 'logout' })
        });
        return res.json();
    },
    checkSession: async () => {
        const res = await fetch(`${API_URL}/auth.php`, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify({ action: 'check' })
        });
        if (!res.ok) throw new Error('Non loggato');
        return res.json();
    },
    changePassword: async (passwords: any) => {
        const res = await fetch(`${API_URL}/settings.php`, {
            ...fetchConfig,
            method: 'PUT',
            body: JSON.stringify(passwords)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Errore cambio password');
        }
        return res.json();
    },

    // --- SYSTEM STATS ---
    getStats: async () => {
        const res = await fetch(`${API_URL}/stats.php`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero statistiche');
        return res.json();
    },

    // --- ARTICLES ---
    getArticles: async (category?: string, admin?: boolean) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (admin) params.append('admin', 'true');

        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${API_URL}/articles.php${qs}`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero articoli');
        return res.json();
    },
    getArticle: async (id: number) => {
        const res = await fetch(`${API_URL}/articles.php?id=${id}`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero articolo');
        return res.json();
    },
    getArticleBySlug: async (slug: string) => {
        const res = await fetch(`${API_URL}/articles.php?slug=${encodeURIComponent(slug)}`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero articolo per slug');
        return res.json();
    },
    createArticle: async (data: any) => {
        const res = await fetch(`${API_URL}/articles.php`, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || 'Errore creazione articolo');
        }
        return res.json();
    },
    updateArticle: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/articles.php?id=${id}`, {
            ...fetchConfig,
            method: 'PUT',
            body: JSON.stringify({ id, ...data })
        });
        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || 'Errore aggiornamento articolo');
        }
        return res.json();
    },
    toggleFeatured: async (id: number, is_featured: boolean) => {
        const res = await fetch(`${API_URL}/articles.php`, {
            ...fetchConfig,
            method: 'PATCH',
            body: JSON.stringify({ id, is_featured: is_featured ? 1 : 0 })
        });
        if (!res.ok) throw new Error('Errore aggiornamento stato vetrina');
        return res.json();
    },
    deleteArticle: async (id: number) => {
        const res = await fetch(`${API_URL}/articles.php?id=${id}`, {
            ...fetchConfig,
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error('Errore cancellazione articolo');
        return res.json();
    },

    // --- MEDIA ---
    uploadMedia: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        // Per gli upload (FormData), bypassiamo fetchConfig base per l'header Content-Type,
        // altrimenti la fetch rompe il multi-part boundary:
        const { headers, ...restConfig } = fetchConfig;

        const res = await fetch(`${API_URL}/upload.php`, {
            ...restConfig,
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
                // NON settare Content-Type: il browser genererà 'multipart/form-data; boundary=...' nativamente
            }
        });

        if (!res.ok) throw new Error('Errore upload file');
        return res.json();
    },
    getMedia: async () => {
        const res = await fetch(`${API_URL}/media.php`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero media');
        return res.json();
    },
    deleteMedia: async (id: number) => {
        const res = await fetch(`${API_URL}/media.php`, {
            ...fetchConfig,
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error('Errore cancellazione media');
        return res.json();
    }
};
