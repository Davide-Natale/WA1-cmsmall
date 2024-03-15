'use strict';

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('cms.db', (err) => {
    if(err) throw err;
});

// get published pages
exports.getPublishedPages = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT p.id, title, authorId, creation_date, publication_date, name
                   FROM pages p, users u  
                   WHERE p.authorId = u.id AND julianday('now') - julianday(publication_date) >= 0`;

    db.all(query, (err, rows) => {
      if(err)
        reject(err);
      else
        resolve(rows.map(e => ({id: e.id, title: e.title, authorId: e.authorId, author: e.name,
          creation_date: e.creation_date, publication_date: e.publication_date})));
    });
  });
};

// get all pages
exports.getAllPages = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT p.id, title, authorId, creation_date, publication_date, name 
                   FROM pages p, users u 
                   WHERE p.authorId = u.id`;

    db.all(query, (err, rows) => {
      if(err)
        reject(err);
      else
        resolve(rows.map(e => ({id: e.id, title: e.title, authorId: e.authorId, author: e.name, 
          creation_date: e.creation_date, publication_date: e.publication_date})));
    });
  });
};

// get the page identified by <id>
exports.getPage = (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT p.id, title, authorId, creation_date, publication_date, name 
                   FROM pages p, users u 
                   WHERE p.authorId = u.id AND  p.id = ?`;

    db.get(query, [id], (err, row) => {
      if(err)
        reject(err);
      else if(row == undefined)
        resolve({error: 'Page not found.'});
      else
        resolve({id: row.id, title: row.title, authorId: row.authorId, author: row.name,
          creation_date: row.creation_date, publication_date: row.publication_date});
    });
  });
}; 
 
// add new page
exports.addPage = (page) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO pages(title, authorId, creation_date, publication_date) VALUES(?, ?, ?, ?)";

    db.run(query, [page.title, page.authorId, page.creation_date, page.publication_date], function(err) {
      if(err)
        reject(err);
      else
        resolve(this.lastID);
    });
  });
};

// update an existing page
exports.updatePage = (page) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE pages SET title = ?, authorId = ?, publication_date = ?, creation_date = ? WHERE id = ?';

    db.run(query, [page.title, page.authorId, page.publication_date, page.creation_date, page.id], function (err) {
      if(err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
};

// delete an existing page 
exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM pages WHERE id = ?";

    db.run(query, [id], function (err) {
      if(err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
};
 
// get blocks of an existing page sorted by position
exports.getBlocks = (pageId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM blocks WHERE pageId = ? ORDER BY position";

    db.all(query, [pageId], (err, rows) => {
      if(err)
        reject(err);
      else {
        resolve(rows.map(e => ({id: e.id, type: e.type, content: e.content, 
          position: e.position, pageId: e.pageId, })));
      }
    });
  });
};

// add new block
exports.addBlock = (block) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO blocks(type, content, position, pageId) VALUES(?, ?, ?, ?)";

    db.run(query, [block.type, block.content, block.position, block.pageId], function(err) {
      if(err)
        reject(err);
      else
        resolve(this.lastID);
    });
  });
}; 

// delete blocks of an existing page
exports.deleteBlocks = (pageId) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM blocks WHERE pageId = ?";

    db.run(query, [pageId], function(err) {
      if(err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
}; 

// get site name
exports.getSiteName = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT name FROM site';
    
        db.get(query, (err, row) => {
          if(err)
            reject(err);
          else
            resolve({name: row.name});
        });
    });
};

// update site name
exports.updateSiteName = (siteName) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE site SET name = ?';

    db.run(query, [siteName], function (err) {
      if(err)
        reject(err);
      else
        resolve(this.changes);
    });
  });
};

// get all images
exports.getImages = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM images';

    db.all(query, (err, rows) => {
      if(err)
        reject(err);
      else
        resolve(rows.map(e => ({id: e.id, url: e.url})));
    });
  });
};

// get an image by url
exports.getImage = (url) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM images WHERE url = ?';

    db.get(query, [url], (err, row) => {
      if(err)
        reject(err);
      else if(row == undefined)
        resolve({error: 'Image not found.'});
      else
        resolve({id: row.id, url: row.url});
    });
  });
};

// get all users
exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, name FROM users';

    db.all(query, (err, rows) => {
      if(err)
        reject(err);
      else
        resolve(rows.map(e => ({id: e.id, name: e.name})));
    });
  });
};