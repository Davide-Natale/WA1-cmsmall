import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Card, Form, Dropdown, DropdownButton, Alert } from "react-bootstrap";
import MyNavbar from "./Navbar";
import AppContext from "../AppContext";
import API from "../API";
import dayjs from "dayjs";
import ErrorView from "./Error";

function ParagraphForm(props) {
    const [content, setContent] = useState(props.block? props.block.content : '');
    const [errMsg, setErrMsg] = useState('');
    const type = props.type.split('-')[0] + '-' + props.type.split('-')[1];
    const addBlock = props.addBlock;
    const updateBlock = props.updateBlock;

    function handleSubmit(event) {
        event.preventDefault();

        // Form validation
        if(content === '')
            setErrMsg('The Paragraph must contain text!');
        else if(type === 'p-edit') {
            const block = {type: 'p', content: content, position: props.block.position};
            updateBlock(block);
            props.resetAddType();
        } else {
            const block = {type: 'p', content: content};
            addBlock(block);
            props.resetAddType();
        }
    }

    return(
        <Card>
            <Card.Header>
                <Card.Subtitle>{type === 'p-edit' ? 'Edit Paragraph' : 'New Paragraph'}</Card.Subtitle>
            </Card.Header>
            <Card.Body>
                    {errMsg ? (<Alert variant='danger' onClose={() => setErrMsg('')} dismissible>{errMsg}</Alert>) : undefined }
                    <Form onSubmit={handleSubmit}>
                        <Form.Label>Paragraph:</Form.Label>
                            <Form.Control as="textarea" rows={6} className="mb-3" name='paragraph' value={content} onChange={(event) => setContent(event.target.value)}></Form.Control>
                        <Button type='submit' variant='success' className=" rounded-circle">
                            <i className="bi bi-check-lg" />
                        </Button>
                            <Button variant='danger' className="mx-3 rounded-circle" onClick={props.resetAddType}>
                                <i className="bi bi-x-lg" />
                        </Button>
                    </Form>
            </Card.Body>
        </Card>
    );
}

function HeaderForm(props) {
    const [content, setContent] = useState(props.block? props.block.content : '');
    const [errMsg, setErrMsg] = useState('');
    const type = props.type.split('-')[0] + '-' + props.type.split('-')[1];
    const addBlock = props.addBlock;
    const updateBlock = props.updateBlock;

    function handleSubmit(event) {
        event.preventDefault();

        // Form validation
        if(content === '')
            setErrMsg('The Header must contain text!');
         else if(type === 'h-edit') {
            const block = {type: 'h', content: content, position: props.block.position};
            updateBlock(block);
            props.resetAddType();
        } else {
            const block = {type: 'h', content: content};
            addBlock(block);
            props.resetAddType();
        }
    }

    return(
        <Card>
            <Card.Header>
                <Card.Subtitle>{type === 'h-edit' ? 'Edit Header' : 'New Header'}</Card.Subtitle>
            </Card.Header>
            <Card.Body>
                {errMsg ? (<Alert variant='danger' onClose={() => setErrMsg('')} dismissible>{errMsg}</Alert>) : undefined }
                <Form onSubmit={handleSubmit}>
                    <Form.Label>Header:</Form.Label>
                        <Form.Control type='text' className="mb-3" name='paragraph' value={content} onChange={(event) => setContent(event.target.value)}></Form.Control>
                    <Button type='submit' variant='success' className=" rounded-circle">
                        <i className="bi bi-check-lg" />
                    </Button>
                    <Button variant='danger' className="mx-3 rounded-circle" onClick={props.resetAddType} >
                        <i className="bi bi-x-lg" />
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

function ImageRadio(props) {
    const e = props.e;
    const checkedImage = props.checkedImage;
    const updateCheckedImage = props.updateCheckedImage;

    return(
        <Row>
            <Col>
                <Card.Img src={e.url} style={{width: '100%'}}/>
            </Col>
            <Col className="col-1">
                <Form.Check value={e.url} type="radio" checked={checkedImage === e.url} onChange={(event) => updateCheckedImage(event.target.value)}/>
            </Col>
        </Row>
    );
}

function ImageForm(props) {
    const [images, setImages] = useState([]);
    const [localLoading, setLocalLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [checkedImage, setCheckedImage] = useState(props.block? props.block.content : '');
    const handleErrorState = useContext(AppContext).handleErrorState;
    const type = props.type.split('-')[0] + '-' + props.type.split('-')[1];
    const addBlock = props.addBlock;
    const updateBlock = props.updateBlock;
    
    useEffect(() =>{
        API.getImages()
            .then((images) => {setImages(images); setLocalLoading(false); })
            .catch((err) => handleErrorState.handleError(err));
    }, []);

    function handleSubmit(event) {
        event.preventDefault();

        // Form validation
        if(checkedImage === '')
            setErrMsg('You must select an image!');
        else if(type === 'img-edit'){
            const block = {type: 'img', content: checkedImage, position: props.block.position};
            updateBlock(block);
            props.resetAddType();
        } else {
            const block = {type: 'img', content: checkedImage};
            addBlock(block);
            props.resetAddType();
        }
    }

    return(
        <Card>
            <Card.Header>
                <Card.Subtitle>{props.type === 'img-edit' ? 'Edit Image' : 'New Image'}</Card.Subtitle>
            </Card.Header>
            <Card.Body >
                {localLoading? <Container className='my-5 text-center'> <Spinner variant='primary' /> </Container> :
                    <>
                        {errMsg ? (<Alert variant='danger' onClose={() => setErrMsg('')} dismissible>{errMsg}</Alert>) : undefined}
                        <Form onSubmit={handleSubmit}>
                            <Button type='submit' variant='success' className=" rounded-circle">
                                <i className="bi bi-check-lg" />
                            </Button>
                            <Button variant='danger' className="mx-3 rounded-circle" onClick={props.resetAddType}>
                                <i className="bi bi-x-lg" />
                            </Button>
                            <Form.Group>
                                {images.map(e => (<ImageRadio key={e.id} e={e} checkedImage={checkedImage} 
                                    updateCheckedImage={(checkedImage) => setCheckedImage(checkedImage)} />))}
                            </Form.Group>
                        </Form>
                    </>
                }
            </Card.Body>
        </Card>
    );
}

function ParagraphView(props) {
    const block = props.block;
    const addType = props.addType;
    const updatePosition = props.updatePosition;
    const deleteBlock = props.deleteBlock;
    const updateAddType = props.updateAddType;

    return(
        <Card className={block.position > 1? 'my-4' : ''}>
            <Card.Header>
                <Card.Subtitle>Paragraph</Card.Subtitle>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col>
                        <Form>
                            <Form.Control as="textarea" rows={6} className="mb-3" name='paragraph' value={block.content} readOnly></Form.Control>
                        </Form>
                        <Button variant='primary' className="rounded-circle" onClick={() => updateAddType('p-edit-' + block.position)}
                            disabled={addType? true : false}>
                            <i className="bi bi-pencil-square" />
                        </Button>
                        <Button variant='danger' className="mx-3 rounded-circle" onClick={() => deleteBlock(block.position)}
                            disabled={addType? true : false}>
                            <i className="bi bi-trash-fill" />
                        </Button> 
                    </Col>
                    <Col className="col-2">
                        <Button variant='secondary' className="my-3 rounded-circle" onClick={() => updatePosition('up', block.position)}
                            disabled={block.position === 1 || addType? true : false}>
                            <i className="bi bi-caret-up-fill" />
                        </Button>
                        <Button variant='secondary' className="rounded-circle" onClick={() => updatePosition('down', block.position)}
                            disabled={block.position === props.numBlocks || addType? true : false}>
                            <i className="bi bi-caret-down-fill" />
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

function HeaderView(props) {
    const block = props.block;
    const addType = props.addType;
    const deleteBlock = props.deleteBlock;
    const updatePosition = props.updatePosition;
    const updateAddType = props.updateAddType;
    
    return(
        <Card className={block.position > 1? 'my-4' : ''}>
            <Card.Header>
                <Card.Subtitle>Header</Card.Subtitle>
            </Card.Header>
            <Card.Body>
                <Form>
                    <Form.Control type="text" className="mb-3" name='header' value={block.content} readOnly ></Form.Control>
                </Form>    
                    <Row>
                        <Col>
                            <Button variant='primary' className="rounded-circle" onClick={() => updateAddType('h-edit-' + block.position)}
                                disabled={addType? true : false}>
                                <i className="bi bi-pencil-square" />
                            </Button>
                            <Button variant='danger' className="mx-3 rounded-circle" onClick={() => deleteBlock(block.position)}
                                disabled={addType? true : false}>
                                <i className="bi bi-trash-fill" />
                            </Button>
                        </Col>
                        <Col className="text-end">
                            <Button variant='secondary' className="mx-3 rounded-circle" onClick={() => updatePosition('up', block.position)}
                                disabled={block.position === 1 || addType? true : false}>
                                <i className="bi bi-caret-up-fill" />
                            </Button>
                            <Button variant='secondary' className="rounded-circle" onClick={() => updatePosition('down', block.position)}
                                disabled={block.position === props.numBlocks || addType? true : false}>
                                <i className="bi bi-caret-down-fill" />
                            </Button>
                        </Col>
                    </Row>              
            </Card.Body>
        </Card>
    );
}

function ImageView(props) {
    const block = props.block;
    const addType = props.addType;
    const updatePosition = props.updatePosition;
    const deleteBlock = props.deleteBlock;
    const updateAddType = props.updateAddType;

    return(
        <Card className={block.position > 1? 'my-4' : ''}>
            <Card.Header>
                <Card.Subtitle>Image</Card.Subtitle>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Img src={block.content} style={{ width: '100%' }}></Card.Img>
                            <Button variant='primary' className="rounded-circle" onClick={() => updateAddType('img-edit-' + block.position)}
                                disabled={addType? true : false}>
                                <i className="bi bi-pencil-square" />
                            </Button>
                            <Button variant='danger' className="mx-3 rounded-circle" onClick={() => deleteBlock(block.position)}
                                disabled={addType? true : false}>
                                <i className="bi bi-trash-fill" />
                            </Button>     
                    </Col>
                    <Col className="col-2">
                        <Row className=""></Row>
                        <Row className="my-5">
                            <Col>
                                <Button variant='secondary' className="my-4 rounded-circle" onClick={() => updatePosition('up', block.position)}
                                    disabled={block.position === 1 || addType? true : false}>
                                    <i className="bi bi-caret-up-fill" />
                                </Button>
                                <Button variant='secondary' className="rounded-circle" onClick={() => updatePosition('down', block.position)}
                                    disabled={block.position === props.numBlocks || addType? true : false}>
                                    <i className="bi bi-caret-down-fill" />
                                </Button>
                            </Col> 
                        </Row>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

function BlocksList(props) {
    const blocks = props.blocks;
    const updatePosition = props.updatePosition;
    const deleteBlock = props.deleteBlock;

    return (
        <>  
            {blocks.map((e, index, array) => {
                if (e.type === 'img')
                    return (<ImageView key={e.position} block={e} numBlocks={array.length} updatePosition={updatePosition} 
                        deleteBlock={deleteBlock} updateAddType={props.updateAddType} addType={props.addType}/>);
                else if (e.type === 'h')
                    return (<HeaderView key={e.position} block={e} numBlocks={array.length} updatePosition={updatePosition} 
                        deleteBlock={deleteBlock} updateAddType={props.updateAddType} addType={props.addType}/>);
                else if (e.type === 'p')
                    return (<ParagraphView key={e.position} block={e} numBlocks={array.length} updatePosition={updatePosition} 
                        deleteBlock={deleteBlock} updateAddType={props.updateAddType} addType={props.addType}/>);
            })}
        </>
    );
}

function PageForm(props) {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const loginState = context.loginState
    const listOfPagesState = context.listOfPagesState;
    const siteNameState = context.siteNameState;
    const loadingState = context.loadingState;
    const [title, setTitle] = useState(props.page.title? props.page.title : '');
    const [publicationDate, setPublicationDate] = useState(props.page.publication_date? props.page.publication_date.format('YYYY-MM-DD') : '');
    const [authorId, setAuthorId] = useState(props.page.authorId? props.page.authorId : loginState.user.id);
    const [errMsg, setErrMsg] = useState('');
    const creationDate = props.page.creation_date? props.page.creation_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

    function handleSubmit(event) {
        event.preventDefault();
        const headers = props.blocks.filter(e => e.type === 'h');

        // Form validation
        if(title === '')
            setErrMsg('Title is a required field!');
        else if(publicationDate && dayjs(publicationDate).diff(creationDate) < 0)
            setErrMsg('Publication date cannot be earlier than Creation date!')
        else if(headers.length === 0 || props.blocks.length - headers.length === 0)
            setErrMsg('Page must contain at least an header and another type of block!');
        else {
            const page = {title: title, publication_date: publicationDate, creation_date: creationDate, 
                authorId: authorId, blocks: props.blocks};

            if(props.page.id) 
                listOfPagesState.updatePage({id: props.page.id, ...page});
            else 
                listOfPagesState.addPage(page);
            
            loadingState.updateLoading(true);
            navigate('/back-office');
        }  
    }

    return(
        <Card style={{ background: 'rgb(250, 250, 250', width: '100%' }}>
            <Card.Header>
                <Card.Title>{props.page.id? 'Edit page' : 'Add new page'}</Card.Title>
            </Card.Header>
            <Card.Body>
                {errMsg ? (<Alert variant='danger' onClose={() => setErrMsg('')} dismissible>{errMsg}</Alert>) : undefined}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-2">
                        <Form.Label>Title:</Form.Label>
                        <Form.Control type="text" name='title' value={title} onChange={(event) => setTitle(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Publication Date:</Form.Label>
                        <Form.Control type="date" name='publication date' value={publicationDate} onChange={(event) => setPublicationDate(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Creation Date:</Form.Label>
                        <Form.Control type="date" name='creation date' value={creationDate} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Author:</Form.Label>
                        <Form.Select disabled={!loginState.user.admin} onChange={(event) => setAuthorId(event.target.value)} >
                            <option value={props.page.authorId? props.page.authorId : loginState.user.id}>{props.page.author? props.page.author : loginState.user.name}</option>
                            {props.page.authorId?
                                props.users.filter(e => e.id !== props.page.authorId).map(e => {
                                    return (<option key={e.id} value={e.id}>{e.name}</option>);
                                }) :
                                props.users.filter(e => e.id !== loginState.user.id).map(e => {
                                    return (<option key={e.id} value={e.id}>{e.name}</option>);
                                })
                            }
                        </Form.Select>
                    </Form.Group>
                    <Button variant="success" type="submit" className="rounded-pill">{props.page.id? 'Save' : 'Add'}</Button>
                    <Button variant="danger" className="mx-3 rounded-pill" onClick={() => {
                            loadingState.updateLoading(true);
                            siteNameState.updateFetchSiteName(true);
                            listOfPagesState.updateFetchPages('back-office');
                            navigate('/back-office');
                        }}>
                        Cancel
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

function FormRoute(props) {
    const [addType, setAddType] = useState('');
    const [page, setPage] = useState({});
    const [blocks, setBlocks] = useState([]);
    const [users, setUsers] = useState([]);
    const { pageId } = useParams();
    const context = useContext(AppContext);
    const loadingState = context.loadingState;
    const loginState = context.loginState;
    const handleErrorState = context.handleErrorState; 

    useEffect(() => {
        async function fetchData() {
            try {
                if(loginState.user.admin) {
                    const users = await API.getUsers();
                    setUsers(users);
                }

                const page = await API.getPage(pageId);
                setPage(page);
                setBlocks(page.blocks);
                loadingState.updateLoading(false);
            } catch(err) {
                if(err.error === 'Page not found.')
                    loadingState.updateLoading(false);
                else
                    handleErrorState.handleError(err);
            }
        }
        
        fetchData();
    }, []);

    function addBlock(block) {
        setBlocks((oldBlocks) => [...oldBlocks, {...block, position: blocks.length + 1}])
    }

    function updatePosition(direction, position) {
        if(direction === 'up') {
            setBlocks((oldBlocks) => {
                return oldBlocks.map(e => {
                    if (e.position === position - 1)
                        return { ...e, position: e.position + 1 };
                    else if (e.position === position)
                        return { ...e, position: e.position - 1 };
                    else
                        return e;
                }).sort((e1, e2) => e1.position - e2.position);
            });
        } else if(direction === 'down') {
            setBlocks((oldBlocks) => {
                return oldBlocks.map(e => {
                    if (e.position === position + 1)
                        return { ...e, position: e.position - 1 };
                    else if (e.position === position)
                        return { ...e, position: e.position + 1 };
                    else
                        return e;
                }).sort((e1, e2) => e1.position - e2.position);
            });
        }
    }

    function updateBlock(block) {
        setBlocks((oldBlocks) => {
            return oldBlocks.map(e => {
                if(e.position === block.position)
                    return block;
                else
                    return e;
            });
        });
    }

    function deleteBlock(position) {
        setBlocks((oldBlocks) => {
            return oldBlocks.filter(e => e.position !== position)
                            .map(e => {
                                if (e.position > position)
                                    return { ...e, position: e.position - 1 };
                                else
                                    return e;
            });
        });
    }

    return(
        <>  
            {handleErrorState.errMsg ? 
                <ErrorView /> : 
                <>
                    {loadingState.loading ? <Container className='my-5 text-center'> <Spinner variant='primary' /> </Container> :
                        <>
                            <MyNavbar />
                            <Container fluid>
                                <Row className="my-4">
                                    <Col className="col-3" >
                                        <PageForm page={page} blocks={blocks} users={users} />
                                    </Col>
                                    <Col className='col-5' hidden={blocks.length === 0}>
                                        <Row>
                                            <Col className="col-1"></Col>
                                            <Col>
                                                <BlocksList blocks={blocks} updatePosition={updatePosition} deleteBlock={deleteBlock}
                                                    addType={addType} updateAddType={(addType) => setAddType(addType)} />
                                            </Col>
                                            <Col className="col-1"></Col>
                                        </Row>

                                    </Col>
                                    <Col className="col-4">
                                        {addType === '' ?
                                            <DropdownButton variant='secondary' title="Add Block">
                                                <Dropdown.Header>Choose type</Dropdown.Header>
                                                <Dropdown.Item onClick={() => { setAddType(''); setAddType('h-add'); }}>Header</Dropdown.Item>
                                                <Dropdown.Item onClick={() => setAddType('p-add')}>Paragraph</Dropdown.Item>
                                                <Dropdown.Item onClick={() => setAddType('img-add')}>Image</Dropdown.Item>
                                            </DropdownButton> : undefined
                                        }
                                        {addType.split('-')[0] === 'img' ? <ImageForm type={addType} block={blocks[parseInt(addType.split('-')[2] - 1)]}
                                            resetAddType={() => setAddType('')} addBlock={addBlock} updateBlock={updateBlock} /> : undefined}
                                        {addType.split('-')[0] === 'h' ? <HeaderForm type={addType} block={blocks[parseInt(addType.split('-')[2] - 1)]}
                                            resetAddType={() => setAddType('')} addBlock={addBlock} updateBlock={updateBlock} /> : undefined}
                                        {addType.split('-')[0] === 'p' ? <ParagraphForm type={addType} block={blocks[parseInt(addType.split('-')[2] - 1)]}
                                            resetAddType={() => setAddType('')} addBlock={addBlock} updateBlock={updateBlock} /> : undefined}
                                    </Col>
                                </Row>
                            </Container>
                        </>
                    }
                </>
            }        
        </>   
    );
}

export default FormRoute; 