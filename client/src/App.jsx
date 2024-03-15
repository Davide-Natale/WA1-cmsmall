import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import API from './API';
import AppContext from './AppContext';
import HomeRoute from './components/HomeRoute';
import ViewRoute from './components/ViewRoute';
import LoginRoute from './components/Authentication';
import FormRoute from './components/FormRoute';
import DefaultRoute from './components/DefaultRoute';

function App() {
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [fetchSiteName, setFetchSiteName] = useState(true);
  const [listOfPages, setListOfPages] = useState([]);
  const [fetchPages, setFetchPages] = useState('front-office');
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  function handleError(err) {
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0].msg) {
        errMsg = err.errors[0].msg;
      }
    } else if(err.error) {
      errMsg = err.error;
    }

    setErrMsg(errMsg);
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if(fetchSiteName) {
      API.getSiteName()
          .then(site =>  { setSiteName(site.name); setFetchSiteName(false); })
          .catch(err => handleError(err));
    }
  }, [fetchSiteName]);

  useEffect(() => {
    if (fetchPages === 'front-office') {
      API.getPublishedPages()
        .then(pages => { setListOfPages(pages); setFetchPages(''); setLoading(false); })
        .catch(err => handleError(err));
    } else if (fetchPages === 'back-office') {
      API.getAllPages()
        .then(pages => { setListOfPages(pages); setFetchPages(''); setLoading(false); })
        .catch(err => handleError(err));
    }
  }, [fetchPages]);

  function addPage(page) {
    API.addPage(page)
    .then(() => {
      setFetchSiteName(true);
      setFetchPages('back-office');
    }).catch(err => handleError(err));
  }

  function updatePage(page) {
    API.updatePage(page)
    .then(() => {
      setFetchSiteName(true);
      setFetchPages('back-office');
    }).catch(err => handleError(err));
  }

  function deletePage(id) {
    setListOfPages((oldPages) => oldPages.map(e => e.id !== id ? e : {...e, status: 'deleted'}));
    API.deletePage(id)
    .then(() => {
      setFetchSiteName(true);
      setFetchPages('back-office');
    }).catch(err => handleError(err));
  }

  function updateSiteName(siteName) {
    API.updateSiteName(siteName)
    .then(() => {
      setFetchSiteName(true);
      setFetchPages('back-office');
      setLoading(true);
    })
    .catch((err) => handleError(err));
  }

  function loginSuccessful(user) {
    setUser(user);
    setLoggedIn(true);
  }

  async function doLogout() {
    await API.logout();
    setLoggedIn(false);
    setUser(undefined);
  }

  return (
    <Router>
      <AppContext.Provider value={{loginState: {user: user, loggedIn: loggedIn, loginSuccessful: loginSuccessful, doLogout: doLogout},
        listOfPagesState: {listOfPages: listOfPages, addPage: addPage, updatePage: updatePage, deletePage: deletePage, 
          updateFetchPages: (fetchPages) => setFetchPages(fetchPages)},
        loadingState: {loading: loading, updateLoading: (loading) => setLoading(loading)},
        siteNameState: {siteName: siteName, updateSiteName: updateSiteName, updateFetchSiteName: (fetchSiteName) => setFetchSiteName(fetchSiteName)},
        handleErrorState: {errMsg: errMsg, resetErrMsg: () => setErrMsg(''), handleError: handleError} }} > 
        <Routes>
          <Route path='/' element={ <HomeRoute type='front-office'/>} />
          <Route path='/back-office' element={<HomeRoute type='back-office' />} />
          <Route path='/back-office/add' element={<FormRoute type='back-office' />} />
          <Route path='/view/:pageId' element={<ViewRoute type='front-office'/>} />
          <Route path='/back-office/view/:pageId' element={<ViewRoute type='back-office' />} />
          <Route path='back-office/edit/:pageId' element={<FormRoute type='back-office' />} />
          <Route path='/login' element={<LoginRoute />} />
          <Route path='/*' element={<DefaultRoute />} />
        </Routes>
      </AppContext.Provider>
    </Router>
  );
}

export default App;
