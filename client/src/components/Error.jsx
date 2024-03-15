import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import AppContext from "../AppContext";

function ErrorView(props) {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const loadingState = context.loadingState;
    const listOfPagesState = context.listOfPagesState;
    const siteNameState = context.siteNameState;
    const handleErrorState = context.handleErrorState;

    return (
        <Container >
            <Row className="my-5">
                <Col></Col>
                <Col>
                    <Card style={{ backgroundColor: 'rgb(255, 210, 210)' }}>
                        <Card.Header className="text-center">
                            <Card.Title as='h2' style={{ color: 'red' }}>{handleErrorState.errMsg}</Card.Title>
                        </Card.Header>
                        <Card.Body className="text-center">
                            <Card.Subtitle as='h5'>Return to Home</Card.Subtitle>
                            <Button className='my-2 rounded-pill' variant="dark" onClick={() => {
                                handleErrorState.resetErrMsg();
                                loadingState.updateLoading(true);
                                siteNameState.updateFetchSiteName(true);
                                listOfPagesState.updateFetchPages('front-office');
                                navigate('/');
                            }}>Home</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col></Col>
            </Row>
        </Container>
    );
}
export default ErrorView;

