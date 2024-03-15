import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Navbar, Container, Button, Form, Row, Col, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import AppContext from '../AppContext';

function SiteIcon(props) {
  return( 
    <Navbar.Brand className='fs-4'>
      <i className="bi bi-file-earmark-text-fill" />
    </Navbar.Brand>
  );
}

function SiteNameFO(props) {
  const siteNameState = useContext(AppContext).siteNameState;

  return(
    <Navbar.Brand className='fs-4'>
          <i className="bi bi-file-earmark-text-fill" />
          {' ' + siteNameState.siteName}
        </Navbar.Brand>
  );
}

function SiteNameForm(props) {
  const context = useContext(AppContext);
  const siteNameState = context.siteNameState;
  const [siteName, setSiteName] = useState(siteNameState.siteName);
  const [disabled, setDisabled] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  function handleSubmit (event) {
    event.preventDefault();
    setLocalLoading(true);
    siteNameState.updateSiteName(siteName);
  }

  return(
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col xs='auto'>
          <Form.Control type="text" name='site name' value={siteName} onChange={(event) => {
            setSiteName(event.target.value);
            if (event.target.value === '')
              setDisabled(true);
            else
              setDisabled(false);
          }
          } />
        </Col>
        <Col>
          {disabled ?
            <OverlayTrigger placement='bottom' overlay={<Tooltip id="tooltip-disabled">The site name can't be empy!</Tooltip>}>
              <span className="d-inline-block">
                <Button type='submit' variant='info' className='mx-1 rounded-circle' disabled><i className="bi bi-check-lg" /></Button>
              </span>
            </OverlayTrigger> :
            <Button type='submit' variant='success' className='mx-1 rounded-circle'>
              {localLoading? <Spinner variant='light' size='sm' /> : <i className="bi bi-check-lg" />}  
            </Button>
          }
          <Button variant='danger' className='mx-1 rounded-circle' onClick={() => props.updateEdit(false)}>
            <i className="bi bi-x-lg" />
          </Button>
        </Col>
      </Row>
    </Form>
  );

}

function SiteNameBO(props) {
  const [edit, setEdit] = useState(false);
  
  return(
    <> 
      {!edit ?
      <>
        <SiteNameFO />
        <Button variant='info' className='rounded-circle' onClick={() => setEdit(true)}>
          <i className="bi bi-pencil-square" />
        </Button>
      </> :
      <>
        <SiteIcon />
        <SiteNameForm updateEdit={(edit) => setEdit(edit)}/>
      </>} 
    </>
  );
}

function MyNavbar(props) {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const loginState = context.loginState;
  const siteNameState = context.siteNameState;
  const listOfPagesState = context.listOfPagesState;
  const loadingState = context.loadingState;
  
  return (<Navbar bg="primary" variant="dark">
      <Container fluid>
        {props.type === 'back-office' && loginState.user.admin?
          <SiteNameBO /> :
          <SiteNameFO />}
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {loginState.loggedIn ?
            <>
              <Navbar.Text>
                {'Signed in as: ' + loginState.user.name}
              </Navbar.Text>
              <Button className='mx-2 rounded-pill' variant='danger' onClick={() => {
                loginState.doLogout();
                loadingState.updateLoading(true);
                siteNameState.updateFetchSiteName(true);
                listOfPagesState.updateFetchPages('front-office');
                navigate('/');
              }}>
                {'Logout '}
                <i className="bi bi-person-fill" />
              </Button>
            </> :
            <Button className='mx-2 rounded-pill' variant='info' onClick={() => navigate('/login')}>
              {'Login '}
              <i className="bi bi-person-fill" />
            </Button>
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar; 