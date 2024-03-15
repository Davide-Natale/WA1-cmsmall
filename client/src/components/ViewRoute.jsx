import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Card, Container, Row, Col, Button, Spinner } from "react-bootstrap";
import MyNavbar from "./Navbar";
import API from "../API";
import AppContext from "../AppContext";
import ErrorView from "./Error";

function PageInfo(props) {
    const page = props.page;
    
    return(
        <Card className='my-1' style={{ backgroundColor: 'rgb(252, 252, 252)', width: '100%' }}>
            <Card.Header>
                <Card.Title as='h3'>Properties</Card.Title>
            </Card.Header>
            <Card.Body>
                <Card.Text ><strong>{'Author: '}</strong>{page.author}</Card.Text>
                <Card.Text><strong>{'Publication Date: '}</strong>{page.publication_date ? page.publication_date.format('MMMM D, YYYY') : '-'}</Card.Text>
                <Card.Text><strong>{'Creation Date: '}</strong>{page.creation_date ? page.creation_date.format('MMMM D, YYYY') : '-'}</Card.Text>
            </Card.Body>
        </Card>
    );
}

function PageContent(props) {
    const blocks = props.page.blocks || [];

    return(
        <Card className="my-1" style={{ backgroundColor: 'rgb(252, 252, 252)', width: '100%' }}>
            <Card.Header className="text-center">
                <Card.Title as='h1'>{props.page.title}</Card.Title>
            </Card.Header>
            <Card.Body>
                {blocks.map(e => {
                    if (e.type === 'img')
                        return (<Card.Img key={e.id} src={e.content} style={{ width: '75%' }} />);
                    else if (e.type === 'h')
                        return (<Card.Subtitle key={e.id} as='h4' className="mb-2">{e.content}</Card.Subtitle>);
                    else if (e.type === 'p')
                        return (<Card.Text key={e.id} >{e.content}</Card.Text>);
                })}
            </Card.Body>
        </Card>
    );
}

function PageView(props) {
    const page = props.page;
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const loadingState = context.loadingState;
    const loginState = context.loginState;
    const listOfPagesState = context.listOfPagesState;
    const siteNameState = context.siteNameState; 

    return(
        <Container fluid>
            <Row className="my-4">
                <Col xs='auto'>
                    <Button className='mx-2 rounded-pill' variant='secondary' onClick={() => { 
                            loadingState.updateLoading(true); 
                            siteNameState.updateFetchSiteName(true);
                            listOfPagesState.updateFetchPages(props.type);
                            navigate(props.type === 'back-office'? '/back-office' : '/');                        
                        }}>
                        <i className="bi bi-caret-left-fill" />
                        Back
                    </Button>
                </Col>
                <Col className="mx-5">
                    <PageContent page={page} />
                </Col>
                <Col className="col-3 mx-3">
                    <Row>
                        <Col>
                            <PageInfo page={page} /> 
                        </Col>
                    </Row>
                    {props.type === 'back-office' && (loginState.user.admin || loginState.user.id === page.authorId)?
                        <Row>
                            <Col>
                                <Button variant='info' className="my-2 mx-2 rounded-pill" onClick={() => {
                                        loadingState.updateLoading(true); 
                                        siteNameState.updateFetchSiteName(true);
                                        navigate(`/back-office/edit/${page.id}`);
                                    }}>
                                    {'Edit '}
                                    <i className="bi bi-pencil-square" />
                                </Button>
                                <Button variant='danger' className='mx-2 rounded-pill' onClick={() => {
                                        loadingState.updateLoading(true);
                                        listOfPagesState.deletePage(page.id);
                                        navigate('/back-office');
                                    }}>
                                    {'Delete '}
                                    <i className="bi bi-trash-fill" />
                                </Button>
                            </Col>
                        </Row> : undefined
                    } 
                </Col>
            </Row>
        </Container>
    );
}

function ViewRoute(props) {
    const [page, setPage] = useState({});
    const { pageId } = useParams();
    const context = useContext(AppContext);
    const loadingState = context.loadingState;    
    const handleErrorState = context.handleErrorState;

    useEffect(() => {
        API.getPage(pageId)
            .then((page) => { setPage(page); loadingState.updateLoading(false); })
            .catch((err) => handleErrorState.handleError(err));
    }, []);

    return (
        <>
            {handleErrorState.errMsg ? 
                <ErrorView /> : 
                <>
                    {loadingState.loading ? <Container className='my-5 text-center'> <Spinner variant='primary' /> </Container> :
                        <>
                            <MyNavbar />
                            <PageView type={props.type} page={page}/>
                        </>
                    }
                </>
            }   
        </>
    );
}

export default ViewRoute;