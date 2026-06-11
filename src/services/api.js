const API_URL = 'https://jtt.alwaysdata.net/api';

export const api = {
    login: (matricule, password) => fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule, password })
    }).then(r => r.json()),

    register: (data) => fetch(`${API_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getCourses: (matricule) => fetch(`${API_URL}/courses/${matricule}`).then(r => r.json()),
    
    addCourse: (formData) => fetch(`${API_URL}/courses`, { method: 'POST', body: formData }).then(r => r.json()),
    
    deleteCourse: (id) => fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' }).then(r => r.json()),

    getCourseDetail: (id) => fetch(`${API_URL}/course/${id}`).then(r => r.json()),
    
    addNote: (data) => fetch(`${API_URL}/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    deleteNote: (id) => fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' }).then(r => r.json()),

    updateProfile: (matricule, data) => fetch(`${API_URL}/update-profile/${matricule}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json()),

    getTrash: (matricule) => fetch(`${API_URL}/trash/${matricule}`).then(r => r.json()),
    
    restoreItem: (type, id) => fetch(`${API_URL}/trash/restore/${type}/${id}`, { method: 'POST' }).then(r => r.json()),
    
    permanentDelete: (type, id) => fetch(`${API_URL}/trash/permanent/${type}/${id}`, { method: 'DELETE' }).then(r => r.json()),
    
    emptyTrash: (matricule) => fetch(`${API_URL}/trash/empty/${matricule}`, { method: 'POST' }).then(r => r.json()),

    saveTheme: (matricule, theme) => fetch(`${API_URL}/save-theme`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule, theme })
    }).then(r => r.json()),
};

export default api;