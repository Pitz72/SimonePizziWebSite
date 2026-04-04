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

    // --- PROJECTS ---
    getProjects: async (category?: string) => {
        const qs = category ? `?category=${encodeURIComponent(category)}` : '';
        const res = await fetch(`${API_URL}/projects.php${qs}`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero progetti');
        return res.json();
    },
    getProject: async (id: number) => {
        const res = await fetch(`${API_URL}/projects.php?id=${id}`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero progetto');
        return res.json();
    },
    createProject: async (data: any) => {
        const res = await fetch(`${API_URL}/projects.php`, {
            ...fetchConfig, method: 'POST', body: JSON.stringify(data)
        });
        if (!res.ok) { const r = await res.json(); throw new Error(r.error || 'Errore creazione progetto'); }
        return res.json();
    },
    updateProject: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/projects.php?id=${id}`, {
            ...fetchConfig, method: 'PUT', body: JSON.stringify({ id, ...data })
        });
        if (!res.ok) { const r = await res.json(); throw new Error(r.error || 'Errore aggiornamento progetto'); }
        return res.json();
    },
    deleteProject: async (id: number) => {
        const res = await fetch(`${API_URL}/projects.php?id=${id}`, {
            ...fetchConfig, method: 'DELETE', body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error('Errore cancellazione progetto');
        return res.json();
    },
    patchProject: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/projects.php`, {
            ...fetchConfig, method: 'PATCH', body: JSON.stringify({ id, ...data })
        });
        if (!res.ok) throw new Error('Errore patch progetto');
        return res.json();
    },

    // --- CATEGORIES (v1.6.5) ---
    getCategories: async () => {
        const res = await fetch(`${API_URL}/categories.php`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero categorie');
        return res.json();
    },
    createCategory: async (data: { name: string; slug: string }) => {
        const res = await fetch(`${API_URL}/categories.php`, {
            ...fetchConfig, method: 'POST', body: JSON.stringify(data)
        });
        if (!res.ok) { const r = await res.json(); throw new Error(r.error || 'Errore creazione categoria'); }
        return res.json();
    },
    updateCategory: async (id: number, data: { name: string; slug: string; sort_order: number }) => {
        const res = await fetch(`${API_URL}/categories.php?id=${id}`, {
            ...fetchConfig, method: 'PUT', body: JSON.stringify({ id, ...data })
        });
        if (!res.ok) { const r = await res.json(); throw new Error(r.error || 'Errore aggiornamento categoria'); }
        return res.json();
    },
    deleteCategory: async (id: number) => {
        const res = await fetch(`${API_URL}/categories.php?id=${id}`, {
            ...fetchConfig, method: 'DELETE', body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error('Errore cancellazione categoria');
        return res.json();
    },

    // --- ANALYTICS (v1.6.5) ---
    trackView: async (articleId: number) => {
        // Fire-and-forget: non bloccare l'UI in caso di errore
        try {
            await fetch(`${API_URL}/analytics.php`, {
                ...fetchConfig, method: 'POST',
                body: JSON.stringify({ type: 'view', article_id: articleId })
            });
        } catch { /* silenzioso */ }
    },
    trackClick: async (articleId: number, buttonLabel: string) => {
        try {
            await fetch(`${API_URL}/analytics.php`, {
                ...fetchConfig, method: 'POST',
                body: JSON.stringify({ type: 'click', article_id: articleId, button_label: buttonLabel })
            });
        } catch { /* silenzioso */ }
    },
    getAnalytics: async () => {
        const res = await fetch(`${API_URL}/analytics.php`, fetchConfig);
        if (!res.ok) throw new Error('Errore recupero analytics');
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
        const res = await fetch(`${API_URL}/media.php?id=${id}`, {
            ...fetchConfig,
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Errore cancellazione media');
        return res.json();
    },
    uploadMediaWithProgress: (file: File, onProgress: (percent: number) => void): Promise<any> => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true; // Mantiene i cookie di sessione PHP

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        reject(new Error('Risposta non valida dal server'));
                    }
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err.error || `Errore upload (HTTP ${xhr.status})`));
                    } catch {
                        reject(new Error(`Errore upload (HTTP ${xhr.status})`));
                    }
                }
            };
            xhr.onerror = () => reject(new Error("Errore di rete durante l'upload"));
            xhr.onabort = () => reject(new Error('Upload annullato'));

            xhr.open('POST', `${API_URL}/upload.php`);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(formData);
        });
    }
};
