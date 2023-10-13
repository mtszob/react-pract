export function getById(collection: string, id: string) {
    return fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getById', data: id }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`getById: Error while getting data by id (${id}) from ${collection} collection`);
    });
}

export function getByName(collection: string, name: string) {
    return fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getByName', data: name }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`getByName: Error while getting data by name (${name}) from ${collection} collection`);
    });
}

export function getByEmailAndPassword(collection: string, email: string, password: string) {
    return fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'getByEmailAndPassword', data: { email, password } }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`getByEmailAndPassword: Error while getting data by email and password (${email}) from ${collection} collection`);
    });
}

export function add(collection: string, item: any) {
    return fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ action: 'add', data: item }),
    }).then(res => {
        if (res.ok) return res.json();
        return Promise.reject(`add: Error while adding data to ${collection} collection`);
    });
}