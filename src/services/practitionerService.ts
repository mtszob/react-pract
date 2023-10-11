export function getById(id: string) {
    return fetch('/api/practitioners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getById', data: id }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`Error while getting practitioner by id: ${id}`);
    });
}

export function getByName(name: string) {
    return fetch('/api/practitioners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getByName', data: name }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`Error while getting practitioner by name: ${name}`);
    });
}