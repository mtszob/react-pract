export function getAll() {
    return fetch(`/api/practitioners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getAll' }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`getAll: Error while getting data from practitioners collection`);
    });
}
