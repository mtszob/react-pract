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