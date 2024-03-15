import dayjs from 'dayjs';

const URL = 'http://localhost:3001/api';

function getPublishedPages() {
  // call GET /api/pages/published
  return new Promise((resolve, reject) => {
    fetch(URL + '/pages/published')
    .then(response => {
      if(response.ok) {
        response.json()
        .then(pages => { resolve(pages.map(e => ({id: e.id, title: e.title, authorId: e.authorId, author: e.author, 
          creation_date: dayjs(e.creation_date), publication_date: dayjs(e.publication_date), blocks: e.blocks }))) });
      } else {
        // analyze the cause of error
        response.json()
        .then(message => { reject(message); }) // error message in the response body
        .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function getAllPages() {
  // call GET /api/pages
  return new Promise((resolve, reject) => {
    fetch(URL + '/pages', {
      credentials: 'include'
    })
    .then(response => {
      if(response.ok) {
        response.json()
        .then(pages => { resolve(pages.map(e => ({id: e.id, title: e.title, authorId: e.authorId, author: e.author,
          creation_date: dayjs(e.creation_date), publication_date: e.publication_date? dayjs(e.publication_date) : undefined, blocks: e.blocks }))); });
      } else {
        // analyze the cause of error
        response.json()
        .then(message => { reject(message); }) // error message in the response body
        .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function getPage(id) {
  // call GET /api/pages/<id>
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${id}`, {
        credentials: 'include'
    })
    .then(response => {
        if(response.ok){
            response.json()
            .then(page => { resolve({id: page.id, title: page.title, authorId: page.authorId, author: page.author,
              creation_date: dayjs(page.creation_date), publication_date: page.publication_date? dayjs(page.publication_date) : undefined, blocks: page.blocks}); });
        } else {
            // analyze the cause of error
            response.json()
            .then(message => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function addPage(page) {
  // call POST /api/pages
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify(page),
        credentials: 'include'
    }).then(response => {
            if(response.ok)
                resolve(null);
            else {
                // analyze the cause of error
                response.json()
                .then(message => { reject(message); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
       }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
});
}

function updatePage(page) {
  // call PUT /api/pages/<id>
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${page.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'Application/json'
        },
        body: JSON.stringify({title: page.title, publication_date: page.publication_date, 
          creation_date: page.creation_date, authorId: page.authorId, blocks: page.blocks}),
        credentials: 'include'
    }).then(response => {
            if(response.ok)
                resolve(null);
            else {
                // analyze the cause of error
                response.json()
                .then(message => { reject(message); }) // error message in the response body
                .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
       }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
});
}

function deletePage(id) {
  // call DELETE /api/pages/<id>
  return new Promise((resolve, reject) => {
    fetch(URL + `/pages/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(response => {
      if (response.ok)
        resolve(null);
      else {
        // analyze the cause of error
        response.json()
          .then(message => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
});

}

function getSiteName() {
  // call GET /api/site-name
  return new Promise((resolve, reject) => {
    fetch(URL + '/site-name')
    .then(response => {
      if(response.ok) {
        response.json()
        .then(site => resolve(site));
      } else {
        // analyze the cause of error
        response.json()
        .then(message => { reject(message); }) // error message in the response body
        .catch(() => { reject({ error: "Cannot parse server response." }); }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }); }); // connection errors
  });
}

function updateSiteName(siteName) {
  // call PUT /api/site-name
  return new Promise((resolve, reject) => {
    fetch(URL + '/site-name', {
      method: 'PUT',
      headers: {
        'Content-Type': 'Application/json'
      },
      body: JSON.stringify({name: siteName}),
      credentials: 'include'
    }).then(response => {
        if(response.ok)
          resolve(null)
        else {
          // analyze the cause of error
          response.json()
          .then(message => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }); }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }); });
  });
}

function getImages() {
  // call GET /api/images
  return new Promise((resolve, reject) => {
    fetch(URL + '/images', {
        credentials: 'include'
    })
    .then(response => {
        if(response.ok){
            response.json()
            .then(images => { resolve(images); });
        } else {
            // analyze the cause of error
            response.json()
            .then(message => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function getUsers() {
  // call GET /api/users
  return new Promise((resolve, reject) => {
    fetch(URL + '/users', {
        credentials: 'include'
    })
    .then(response => {
        if(response.ok){
            response.json()
            .then(users => { resolve(users); });
        } else {
            // analyze the cause of error
            response.json()
            .then(message => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
} 

async function login(credentials) {
  // call POST /api/sessions
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}
  
async function logout() {
  // call DELETE /api/sessions/current
  await fetch(URL + '/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

async function getUserInfo() {
  // call GET /api/sessions/current
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
    
  const userInfo = await response.json();
  if (response.ok) {
     return userInfo;
  } else {
      throw userInfo;  // an object with the error coming from the server
  }
}

const API = {getPublishedPages, getAllPages, getPage, addPage, updatePage, deletePage,
   getSiteName, updateSiteName, getImages, getUsers, login, logout, getUserInfo};

export default API;