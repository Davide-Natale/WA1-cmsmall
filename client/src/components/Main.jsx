import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AppContext from '../AppContext';

function MyRow(props) {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const loginState = context.loginState;
    const listOfPagesState = context.listOfPagesState;
    const loadingState = context.loadingState;
    const siteNameState = context.siteNameState;

    const statusClass = props.e.status === 'deleted'? 'table-danger' : null;

    return(
        <tr className={statusClass}>
            <td>{props.e.title}</td>
            <td>{props.e.publication_date? props.e.publication_date.format('MMMM D, YYYY') : '-'}</td>
            <td>{props.e.creation_date.format('MMMM D, YYYY')}</td>
            <td>{props.e.author}</td>
            <td>
                <Button variant='primary' className='rounded-circle mx-2' onClick={() => { 
                        loadingState.updateLoading(true); 
                        siteNameState.updateFetchSiteName(true);
                        navigate((props.type === 'back-office'? `/${props.type}` : '') + `/view/${props.e.id}`); 
                    }}>
                    <i className="bi bi-eye" />
                </Button>
                {props.type === 'back-office' ? 
                    <>
                        {props.e.authorId !== loginState.user.id && !loginState.user.admin?
                            <>
                                <OverlayTrigger placement='bottom' overlay={<Tooltip id="tooltip-disabled">You aren't the page's author!</Tooltip>}>
                                    <span className="d-inline-block">
                                        <Button variant='primary' className='rounded-circle mx-2' disabled>
                                            <i className="bi bi-pencil-square" />
                                        </Button>
                                    </span>
                                </OverlayTrigger> 
                                <OverlayTrigger placement='bottom' overlay={<Tooltip id="tooltip-disabled">You aren't the page's author!</Tooltip>}>
                                    <span className="d-inline-block">
                                        <Button variant='danger' className='rounded-circle mx-2' disabled>
                                            <i className="bi bi-trash-fill" />
                                        </Button>
                                    </span>
                                </OverlayTrigger>
                            </> :
                            <>
                                <Button variant='primary' className='rounded-circle mx-2' onClick={() => {
                                        loadingState.updateLoading(true); 
                                        siteNameState.updateFetchSiteName(true);
                                        navigate(`/back-office/edit/${props.e.id}`);
                                    }}>
                                    <i className="bi bi-pencil-square" />
                                </Button>
                                <Button variant='danger' className='rounded-circle mx-2' onClick={() => listOfPagesState.deletePage(props.e.id)}>
                                    <i className="bi bi-trash-fill" />
                                </Button>
                            </>
                        }
                    </> : undefined }
            </td>
        </tr>
    );
}

function MyTable(props) {
    const [sort, setSort] = useState('desc');
    const context = useContext(AppContext);
    const listOfPagesState  = context.listOfPagesState;
    const sortedPages = [...listOfPagesState.listOfPages];

    if(sort === 'asc')
        sortedPages.sort((e1, e2) => {
            if (!e1.publication_date)
                return -1;
            else if (!e2.publication_date)
                return 1;
            else
                return e1.publication_date.diff(e2.publication_date);
        });
    else if (sort === 'desc')
        sortedPages.sort((e1, e2) => {
            if (!e1.publication_date)
                return 1;
            else if (!e2.publication_date)
                return -1;
            else
                return e2.publication_date.diff(e1.publication_date)
        });
    
    return(
        <Table>
            <thead className="text-center">
                <tr>
                    <th>Title</th>
                    <th>
                        Publication Date
                        {sort === 'desc' ? <i className="mx-1 bi bi-sort-down" onClick={() => setSort('asc')} /> :
                            <i className="mx-1 bi bi-sort-up" onClick={() => setSort('desc')} /> }
                    </th>
                    <th className='col-2'>Creation Date</th>
                    <th>Author</th>
                    <th className={props.type === 'back-office'? 'col-3' : 'col-1'}>Actions</th>
                </tr>
            </thead>
            <tbody className='text-center'>
                {sortedPages.map(e => <MyRow e={e} key={e.id} type={props.type} />)}
            </tbody>
        </Table>
    );
}

function MyMain(props) {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const loginState = context.loginState;
    const siteNameState = context.siteNameState;
    const listOfPagesState = context.listOfPagesState;
    const loadingState = context.loadingState;

    return(
        <>
            <Container fluid>
                <Row className='my-4'>
                    <Col xs='auto'>
                        {props.type === 'back-office'? 
                           <> 
                            <Row>
                                <Col>
                                <Button className='mx-2 rounded-pill' variant='secondary' onClick={() => {
                                    loadingState.updateLoading(true);
                                    siteNameState.updateFetchSiteName(true);
                                    listOfPagesState.updateFetchPages('front-office');
                                    navigate('/');
                                }}>
                                    <i className="bi bi-caret-left-fill" />
                                    Front Office
                                </Button>
                                </Col>
                            </Row>
                                <Row className='my-3'>
                                    <Col>
                                <Button className='mx-2 rounded-pill' variant='secondary' onClick={() => {
                                    loadingState.updateLoading(true); 
                                    siteNameState.updateFetchSiteName(true);
                                    navigate(`/back-office/add`);
                                }}>
                                    {'Add Page '}
                                    <i className="bi bi-file-earmark-plus" />
                                </Button>
                                </Col>
                            </Row>
                            </> : undefined}
                    </Col>
                    <Col className='mx-5'>
                        <MyTable type={props.type} />
                    </Col>
                    <Col xs='auto' className='text-end'>
                        {props.type === 'front-office' && loginState.loggedIn? <Button className='mx-3 rounded-pill' variant='secondary' onClick={() => { 
                                    loadingState.updateLoading(true); 
                                    siteNameState.updateFetchSiteName(true);
                                    listOfPagesState.updateFetchPages('back-office');
                                    navigate('/back-office'); 
                                }}>
                                Back Office
                                <i className="bi bi-caret-right-fill" />
                            </Button> : undefined 
                        }
                        
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default MyMain