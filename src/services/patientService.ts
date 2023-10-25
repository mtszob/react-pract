export function getAll() {
    return fetch(`/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getAll' }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`getAll: Error while getting data from patients collection`);
    });
}

export function getByPractitioner(practId: string) {
    return fetch(`/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getByPractitioner', data: practId }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`getByEmailAndPassword: Error while getting data by practitioner from patients collection`);
    });
}